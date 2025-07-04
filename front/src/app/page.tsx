"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import defaultRevenue from "../data/japan/2025/revenue.json";
import defaultExpenditure from "../data/japan/2025/expenditure.json";

const BudgetChart = dynamic(() => import("../components/BudgetChart"), {
  ssr: false,
  loading: () => <div className="text-center p-10">Loading...</div>,
});

interface Dataset {
  name: string;
  revenue: Record<string, unknown>;
  expenditure: Record<string, unknown>;
}

const calculateTotal = (data: Record<string, unknown>): number => {
  let total = 0;
  for (const value of Object.values(data)) {
    if (typeof value === "number") {
      total += value;
    } else if (typeof value === "object" && value !== null) {
      total += calculateTotal(value as Record<string, unknown>);
    }
  }
  return total;
};

export default function Home() {
  const [datasets, setDatasets] = useState<Dataset[]>([
    { name: "Japan 2025", revenue: defaultRevenue, expenditure: defaultExpenditure },
  ]);
  const [selected, setSelected] = useState(0);
  const [revenueInput, setRevenueInput] = useState(
    JSON.stringify(defaultRevenue, null, 2)
  );
  const [expenditureInput, setExpenditureInput] = useState(
    JSON.stringify(defaultExpenditure, null, 2)
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const ds = datasets[selected];
    setRevenueInput(JSON.stringify(ds.revenue, null, 2));
    setExpenditureInput(JSON.stringify(ds.expenditure, null, 2));
  }, [selected, datasets]);

  const updateDataset = () => {
    try {
      const revenue = JSON.parse(revenueInput);
      const expenditure = JSON.parse(expenditureInput);
      setDatasets((prev) =>
        prev.map((d, i) => (i === selected ? { ...d, revenue, expenditure } : d))
      );
      setError("");
    } catch {
      setError("JSON の構文エラーがあります");
    }
  };

  const addDataset = () => {
    const name = `Custom ${datasets.length}`;
    setDatasets([...datasets, { name, revenue: {}, expenditure: {} }]);
    setSelected(datasets.length);
  };

  const current = datasets[selected];

  const revenueTotal = calculateTotal(current.revenue);
  const expenditureTotal = calculateTotal(current.expenditure);

  return (
    <div className="min-h-screen p-6 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
          国家予算シミュレータ
        </h1>
        <p className="text-gray-600 text-sm">
          データセットを編集してグラフに反映できます
        </p>
      </header>

      <div className="flex flex-wrap items-end gap-4">
        <select
          className="clay-button px-4 py-2"
          value={selected}
          onChange={(e) => setSelected(Number(e.target.value))}
        >
          {datasets.map((d, i) => (
            <option key={i} value={i}>
              {d.name}
            </option>
          ))}
        </select>
        <button className="clay-button px-4 py-2" onClick={addDataset}>
          データセット追加
        </button>
        <button className="clay-button px-4 py-2" onClick={updateDataset}>
          グラフ更新
        </button>
        {error && <span className="text-red-500 ml-4">{error}</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetChart title="歳入" data={current.revenue} className="h-full" />
        <BudgetChart title="歳出" data={current.expenditure} className="h-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="clay-card">
          <h2 className="font-semibold mb-2">Revenue JSON</h2>
          <textarea
            className="w-full h-64 p-2 clay-inset focus:outline-none"
            value={revenueInput}
            onChange={(e) => setRevenueInput(e.target.value)}
          />
          <p className="mt-2 text-sm text-right">
            合計: {revenueTotal.toLocaleString()} 円
          </p>
        </div>
        <div className="clay-card">
          <h2 className="font-semibold mb-2">Expenditure JSON</h2>
          <textarea
            className="w-full h-64 p-2 clay-inset focus:outline-none"
            value={expenditureInput}
            onChange={(e) => setExpenditureInput(e.target.value)}
          />
          <p className="mt-2 text-sm text-right">
            合計: {expenditureTotal.toLocaleString()} 円
          </p>
        </div>
      </div>
    </div>
  );
}
