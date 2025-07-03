"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface ChartData {
  name: string;
  value: number;
  children?: Record<string, unknown>;
  color: string;
}

interface DrillPath {
  name: string;
  level: number;
}

const generateColorPalette = (count: number) => {
  // Beautiful modern color palette
  const baseColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8C471",
    "#82E0AA",
    "#F1948A",
    "#AED6F1",
    "#A3E4D7",
    "#F9E79F",
    "#D5A6BD",
    "#A9DFBF",
    "#F5B7B1",
    "#D2B4DE",
    "#AED6F1",
    "#A3E4D7",
    "#F9E79F",
    "#A9DFBF",
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Generate additional colors if needed
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (360 / count) * i;
    const saturation = 60 + (i % 3) * 10; // Vary saturation
    const lightness = 60 + (i % 4) * 5; // Vary lightness
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
};

const processDataForChart = (data: Record<string, unknown>): ChartData[] => {
  if (!data) return [];

  const entries = Object.entries(data);
  const colors = generateColorPalette(entries.length);

  return entries
    .map(([key, value], index) => {
      if (typeof value === "number") {
        return {
          name: key,
          value,
          color: colors[index],
        };
      } else if (typeof value === "object" && value !== null) {
        const total = calculateTotal(value as Record<string, unknown>);
        return {
          name: key,
          value: total,
          children: value as Record<string, unknown>,
          color: colors[index],
        };
      }
      return {
        name: key,
        value: 0,
        color: colors[index],
      };
    })
    .filter((item) => item.value > 0);
};

const calculateTotal = (obj: Record<string, unknown>): number => {
  let total = 0;

  for (const value of Object.values(obj)) {
    if (typeof value === "number") {
      total += value;
    } else if (typeof value === "object" && value !== null) {
      total += calculateTotal(value as Record<string, unknown>);
    }
  }

  return total;
};

const formatCurrency = (value: number): string => {
  const trillion = Math.floor(value / 1000000000000);
  const billion = Math.floor((value % 1000000000000) / 100000000);

  if (trillion > 0) {
    return `${trillion.toLocaleString()}兆${
      billion > 0 ? `${billion.toLocaleString()}億` : ""
    }円`;
  } else if (billion > 0) {
    return `${billion.toLocaleString()}億円`;
  } else {
    const million = Math.floor(value / 1000);
    return `${million.toLocaleString()}万円`;
  }
};

interface InteractivePieChartProps {
  title: string;
  data: Record<string, unknown>;
  className?: string;
}

const InteractivePieChart: React.FC<InteractivePieChartProps> = ({
  title,
  data,
  className,
}) => {
  const [drillPath, setDrillPath] = useState<DrillPath[]>([]);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const currentData = useMemo(() => {
    let current = data;
    for (const pathItem of drillPath) {
      if (
        current[pathItem.name] &&
        typeof current[pathItem.name] === "object"
      ) {
        current = current[pathItem.name] as Record<string, unknown>;
      }
    }
    return processDataForChart(current);
  }, [data, drillPath]);

  const chartData = useMemo(() => {
    return {
      labels: currentData.map((item) => item.name),
      datasets: [
        {
          data: currentData.map((item) => item.value),
          backgroundColor: currentData.map((item) => item.color),
          borderColor: currentData.map((item) => item.color),
          borderWidth: 2,
          hoverBorderWidth: 4,
          hoverOffset: 20,
        },
      ],
    };
  }, [currentData]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: { dataIndex: number }) => {
              const dataIndex = context.dataIndex;
              const item = currentData[dataIndex];
              return `${item.name}: ${formatCurrency(item.value)}`;
            },
          },
        },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 800,
      },
      onHover: (_: unknown, elements: Array<{ index: number }>) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          setHoveredSegment(currentData[index]?.name || null);
        } else {
          setHoveredSegment(null);
        }
      },
      onClick: (_: unknown, elements: Array<{ index: number }>) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const item = currentData[index];
          if (item?.children) {
            setDrillPath((prev) => [
              ...prev,
              { name: item.name, level: prev.length },
            ]);
          }
        }
      },
    }),
    [currentData]
  );

  const handleBreadcrumbClick = useCallback((index: number) => {
    setDrillPath((prev) => prev.slice(0, index + 1));
  }, []);

  const goBack = useCallback(() => {
    setDrillPath((prev) => prev.slice(0, -1));
  }, []);

  return (
    <motion.div
      className={`clay-card ${className || ""}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center clay-icon`}
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {title === "歳入" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 12H4"
                />
              )}
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate">
            {title}
          </h2>
        </div>
        {drillPath.length > 0 && (
          <motion.button
            onClick={goBack}
            className="clay-button p-3 sm:p-4 rounded-full text-white transition-all duration-200 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="戻る"
          >
            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="gray"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </div>
          </motion.button>
        )}
      </div>

      <div className="m-4"></div>

      {drillPath.length > 0 && (
        <motion.nav
          className="mb-6 sm:mb-8 p-3 sm:p-4 lg:p-5 clay-inset rounded-xl sm:rounded-2xl"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <ol className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600 flex-wrap">
            <li>
              <button
                onClick={() => setDrillPath([])}
                className="px-4 py-3 rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                トップ
              </button>
            </li>
            {drillPath.map((path, index) => (
              <React.Fragment key={index}>
                <li className="text-gray-400 mx-2">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </li>
                <li>
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className="px-4 py-3 rounded-lg hover:bg-white/20 transition-all duration-200 truncate max-w-32 sm:max-w-48 lg:max-w-none"
                    title={path.name}
                  >
                    {path.name}
                  </button>
                </li>
              </React.Fragment>
            ))}
          </ol>
        </motion.nav>
      )}

      <div className="h-72 sm:h-80 lg:h-96 xl:h-[420px] flex items-center justify-center clay-inset rounded-xl sm:rounded-2xl">
        <div className="w-full h-full p-3 sm:p-4 lg:p-6">
          <Doughnut data={chartData} options={options} />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 justify-items-center">
        {currentData.map((entry, index) => (
          <motion.div
            key={index}
            className={`w-full flex items-center p-4 sm:p-5 rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer clay-raised ${
              hoveredSegment === entry.name ? "scale-105" : ""
            }`}
            onClick={() =>
              entry.children &&
              setDrillPath((prev) => [
                ...prev,
                { name: entry.name, level: prev.length },
              ])
            }
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full mr-3 sm:mr-4 flex-shrink-0 shadow-sm"
              style={{ backgroundColor: entry.color }}
            />
            <div className="min-w-0 flex-1">
              <span
                className={`block text-xs sm:text-sm font-medium truncate transition-colors ${
                  hoveredSegment === entry.name
                    ? "text-blue-700"
                    : "text-gray-700"
                }`}
                title={`${entry.name}: ${formatCurrency(entry.value)}`}
              >
                {entry.name}
              </span>
              <span className="block text-xs text-gray-500 truncate mt-0.5 sm:mt-1">
                {formatCurrency(entry.value)}
              </span>
            </div>
            {entry.children && (
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0 ml-1 sm:ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default InteractivePieChart;
