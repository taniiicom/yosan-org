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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-gray-100">
      <section className="flex-1 flex flex-col justify-center items-center text-center py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <motion.h1
          className="text-4xl sm:text-6xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          令和7年度 国家予算可視化
        </motion.h1>
        <motion.p
          className="text-sm sm:text-lg max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          日本の国家予算をインタラクティブなグラフで探索できます
        </motion.p>
      </section>

      <main className="max-w-5xl w-full mx-auto px-4 py-16 space-y-16">
        <motion.section
          className="grid gap-8 sm:grid-cols-3 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <p className="text-sm text-gray-500">歳入総額</p>
            <p className="text-3xl font-semibold mt-2">{formatCurrency(revenueTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">歳出総額</p>
            <p className="text-3xl font-semibold mt-2">{formatCurrency(expenditureTotal)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">収支差額</p>
            <p className={`text-3xl font-semibold mt-2 ${diff >= 0 ? "text-green-600" : "text-red-500"}`}>{diff >= 0 ? "+" : ""}{formatCurrency(Math.abs(diff))}</p>
          </div>
        </motion.section>

        <motion.section
          className="grid gap-12 md:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <InteractivePieChart title="歳入" data={revenueData} className="h-full" />
          <InteractivePieChart title="歳出" data={expenditureData} className="h-full" />
        </motion.section>

        <motion.section
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold mb-6 text-center">使い方</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-indigo-600 mr-2">●</span>円グラフをクリックすると詳細を表示します
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">●</span>ホバーで金額を確認できます
            </li>
            <li className="flex items-start">
              <span className="text-pink-600 mr-2">●</span>パンくずナビゲーションから上位階層に戻れます
            </li>
          </ul>
        </motion.section>
      </main>

      <footer className="py-10 text-center text-sm text-gray-500">
        © 2025 国家予算可視化システム | データソース: 令和7年度一般会計予算
      </footer>
    </div>
  );
}
