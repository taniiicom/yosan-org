"use client";
import { useEffect, useRef } from "react";
import * as d3 from "d3";

export interface BudgetNode {
  name: string;
  value?: number;
  children?: BudgetNode[];
}

type SunburstNode = d3.HierarchyRectangularNode<BudgetNode> & {
  current: SunburstNode;
  target?: { x0: number; x1: number; y0: number; y1: number };
};

interface Props {
  data: BudgetNode;
  size?: number;
}

export default function BudgetSunburst({ data, size = 500 }: Props) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const root = d3
      .hierarchy<BudgetNode>(data)
      .sum((d) => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));
    const sunburstRoot = root as unknown as SunburstNode;

    const radius = size / 2;

    const partition = d3.partition<BudgetNode>().size([
      2 * Math.PI,
      radius,
    ]);

    partition(root);
    sunburstRoot.each((d: SunburstNode) => {
      d.current = d;
    });

    const svg = d3
      .select(ref.current)
      .attr("viewBox", [0, 0, size, size].join(" "))
      .style("font", "12px sans-serif");

    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${size / 2},${size / 2})`);

    const color = d3.scaleOrdinal<string, string>(
      d3.quantize(d3.interpolateSpectral, sunburstRoot.children?.length || 1)
    );

    const arcGen = d3
      .arc<SunburstNode>()
      .startAngle((d) => d.x0)
      .endAngle((d) => d.x1)
      .padAngle((d) => Math.min((d.x1 - d.x0) / 2, 0.005))
      .padRadius(radius * 1.5)
      .innerRadius((d) => d.y0)
      .outerRadius((d) => d.y1 - 1);

    function arcVisible(d: SunburstNode) {
      return d.y1 <= radius && d.y0 >= 0 && d.x1 > d.x0;
    }

    function labelVisible(d: SunburstNode) {
      return d.y1 <= radius && d.y0 >= 0 && d.x1 - d.x0 > 0.03;
    }

    function labelTransform(d: SunburstNode) {
      const x = ((d.x0 + d.x1) / 2) * (180 / Math.PI);
      const y = (d.y0 + d.y1) / 2;
      return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
    }

    const path = g
      .append("g")
      .selectAll<SVGPathElement, SunburstNode>("path")
      .data(sunburstRoot.descendants().slice(1) as unknown as SunburstNode[])
      .join("path")
      .attr("fill", (d) => {
        let p = d;
        while (p.depth > 1) p = p.parent!;
        return color(p.data.name);
      })
      .attr("fill-opacity", (d) => (arcVisible((d as SunburstNode).current) ? 0.6 : 0))
      .attr("d", (d) => arcGen((d as SunburstNode).current));

    path
      .filter((d) => (d as SunburstNode).children != null)
      .style("cursor", "pointer")
      .on("click", (_event, p) => clicked(p as SunburstNode));

    path.append("title").text(
      (d) => `${d.ancestors().map((d) => d.data.name).reverse().join("/")}
${d3.format(",d")(d.value!)}`
    );

    const label = g
      .append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll<SVGTextElement, SunburstNode>("text")
      .data(sunburstRoot.descendants().slice(1) as unknown as SunburstNode[])
      .join("text")
      .attr("dy", "0.35em")
      .attr("fill-opacity", (d) => (labelVisible((d as SunburstNode).current) ? 1 : 0))
      .attr("transform", (d) => labelTransform((d as SunburstNode).current))
      .text((d: SunburstNode) => d.data.name);

    const parent = g
      .append("circle")
      .datum(sunburstRoot)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", () => clicked(parent.datum() as SunburstNode));

    function clicked(p: SunburstNode) {
      parent.datum(p.parent || sunburstRoot);

      sunburstRoot.each((d: SunburstNode) => {
        d.target = {
          x0:
            Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          x1:
            Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - p.depth ? 20 : 0),
          y1: Math.max(0, d.y1 - p.depth ? 20 : 0),
        };
      });

      g.transition().duration(750);

      path
        .transition()
        .tween("data", (d: SunburstNode) => {
          const i = d3.interpolate(d.current, d.target || d.current);
          return (t: number) => {
            d.current = i(t) as unknown as SunburstNode;
          };
        })
        .attr("fill-opacity", (d: SunburstNode) => (arcVisible((d.target as unknown as SunburstNode) ?? d) ? 0.6 : 0))
        .attr("d", (d: SunburstNode) => arcGen(d.current));

      label
        .filter((d: SunburstNode) => labelVisible((d.target as unknown as SunburstNode) ?? d))
        .transition()
        .attr("fill-opacity", (d: SunburstNode) => (labelVisible((d.target as unknown as SunburstNode) ?? d) ? 1 : 0))
        .attrTween("transform", (d: SunburstNode) => () => labelTransform(d.current));
    }
  }, [data, size]);

  return <svg ref={ref} width={size} height={size} />;
}

