"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import revenueData from "../data/japan/2025/revenue.json";
import expenditureData from "../data/japan/2025/expenditure.json";

const InteractivePieChart = dynamic(() => import("../components/BudgetChart"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="mt-4 text-gray-600 text-center">
          チャートを読み込み中...
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
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

  const revenueTotal = calculateTotal(revenueData);
  const expenditureTotal = calculateTotal(expenditureData);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.header
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-3 sm:mb-4"
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
                令和7年度 国家予算可視化
              </h1>
            </motion.div>
            <motion.p
              className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-3xl mx-auto leading-relaxed px-2 sm:px-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              日本の国家予算をインタラクティブな円グラフで探索できます
            </motion.p>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  歳入総額
                </p>
                <p className="text-2xl font-semibold text-gray-900 truncate">
                  {formatCurrency(revenueTotal)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  歳出総額
                </p>
                <p className="text-2xl font-semibold text-gray-900 truncate">
                  {formatCurrency(expenditureTotal)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors duration-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  収支差額
                </p>
                <p
                  className={`text-2xl font-semibold truncate ${
                    revenueTotal - expenditureTotal >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {revenueTotal - expenditureTotal >= 0 ? "+" : ""}
                  {formatCurrency(Math.abs(revenueTotal - expenditureTotal))}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 xl:gap-12"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-full"
          >
            <InteractivePieChart
              title="歳入"
              data={revenueData}
              className="h-full hover:shadow-2xl transition-shadow duration-300"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-full"
          >
            <InteractivePieChart
              title="歳出"
              data={expenditureData}
              className="h-full hover:shadow-2xl transition-shadow duration-300"
            />
          </motion.div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          className="mt-12 sm:mt-16 lg:mt-20 bg-gray-50 rounded-lg p-6 sm:p-8 border border-gray-200"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
            使い方
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  クリックで詳細表示
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  円グラフのセグメントをクリックすると、より詳細な内訳を確認できます
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v0"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  ホバーで金額確認
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  セグメントにマウスを重ねると、具体的な金額がツールチップで表示されます
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
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
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  パンくずで階層移動
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  「戻る」ボタンやパンくずナビゲーションで上位階層に戻ることができます
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        className="mt-16 sm:mt-20 lg:mt-24 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              © 2025 国家予算可視化システム | データソース:
              令和7年度一般会計予算
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
