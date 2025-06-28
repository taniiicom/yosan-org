export interface BudgetRaw {
  [key: string]: number | BudgetRaw;
}

export interface BudgetNode {
  name: string;
  value?: number;
  children?: BudgetNode[];
}

export function parseBudget(raw: BudgetRaw): BudgetNode {
  const parse = (obj: BudgetRaw): BudgetNode[] =>
    Object.entries(obj)
      .filter(([k]) => k !== "計")
      .map(([k, v]) => {
        if (typeof v === "number") {
          return { name: k, value: v } as BudgetNode;
        }
        return { name: k, children: parse(v as BudgetRaw) } as BudgetNode;
      });

  return { name: "root", children: parse(raw) };
}
