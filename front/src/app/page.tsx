"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import revenueData from "../data/japan/2025/revenue.json";
import expenditureData from "../data/japan/2025/expenditure.json";

const InteractivePieChart = dynamic(() => import("../components/BudgetChart"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-72">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  ),
});

function calculateTotal(data: Record<string, unknown>): number {
  return Object.values(data).reduce<number>((acc, val) => {
    if (typeof val === "number") return acc + val;
    if (typeof val === "object" && val !== null)
      return acc + calculateTotal(val as Record<string, unknown>);
    return acc;
  }, 0);
}

function formatCurrency(value: number): string {
  const trillion = Math.floor(value / 1_000_000_000_000);
  const billion = Math.floor((value % 1_000_000_000_000) / 100_000_000);
  if (trillion > 0) {
    return `${trillion.toLocaleString()}兆${billion > 0 ? `${billion.toLocaleString()}億` : ""}円`;
  }
  if (billion > 0) {
    return `${billion.toLocaleString()}億円`;
  }
  const million = Math.floor(value / 1000);
  return `${million.toLocaleString()}万円`;
}

export default function Home() {
  const revenueTotal = calculateTotal(revenueData);
  const expenditureTotal = calculateTotal(expenditureData);
  const diff = revenueTotal - expenditureTotal;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-slate-800 dark:to-slate-900 text-foreground">
      <header className="py-16 text-center">
        <motion.h1
          className="text-3xl sm:text-5xl font-bold mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          令和7年度 国家予算可視化
        </motion.h1>
        <motion.p
          className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          日本の国家予算をインタラクティブなグラフで探索できます
        </motion.p>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20">
        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-gray-500 mb-2">歳入総額</p>
            <p className="text-2xl font-semibold">{formatCurrency(revenueTotal)}</p>
          </div>
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-gray-500 mb-2">歳出総額</p>
            <p className="text-2xl font-semibold">{formatCurrency(expenditureTotal)}</p>
          </div>
          <div className="glass-card p-6 text-center">
            <p className="text-sm text-gray-500 mb-2">収支差額</p>
            <p className={`text-2xl font-semibold ${diff >= 0 ? "text-green-600" : "text-red-600"}`}>{diff >= 0 ? "+" : ""}{formatCurrency(Math.abs(diff))}</p>
          </div>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="glass-card p-4">
            <InteractivePieChart title="歳入" data={revenueData} className="h-full" />
          </div>
          <div className="glass-card p-4">
            <InteractivePieChart title="歳出" data={expenditureData} className="h-full" />
          </div>
        </motion.div>

        <motion.section
          className="mt-20 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-xl font-semibold mb-6 text-center">使い方</h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="mr-3 text-blue-600">●</span>
              円グラフのセグメントをクリックして詳細を表示できます
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-green-600">●</span>
              セグメントにマウスを重ねると金額が表示されます
            </li>
            <li className="flex items-start">
              <span className="mr-3 text-purple-600">●</span>
              パンくずナビゲーションから上位階層に戻れます
            </li>
          </ul>
        </motion.section>
      </main>

      <footer className="text-center text-sm text-gray-600 pb-10">
        © 2025 国家予算可視化システム | データソース: 令和7年度一般会計予算
      </footer>
    </div>
  );
}
