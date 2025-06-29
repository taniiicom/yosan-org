'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

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
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
    '#F1948A', '#AED6F1', '#A3E4D7', '#F9E79F', '#D5A6BD', '#A9DFBF',
    '#F5B7B1', '#D2B4DE', '#AED6F1', '#A3E4D7', '#F9E79F', '#A9DFBF'
  ];
  
  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }
  
  // Generate additional colors if needed
  const colors = [...baseColors];
  for (let i = baseColors.length; i < count; i++) {
    const hue = (360 / count) * i;
    const saturation = 60 + (i % 3) * 10; // Vary saturation
    const lightness = 60 + (i % 4) * 5;   // Vary lightness
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
};

const processDataForChart = (data: Record<string, unknown>): ChartData[] => {
  if (!data) return [];
  
  const entries = Object.entries(data);
  const colors = generateColorPalette(entries.length);
  
  return entries.map(([key, value], index) => {
    if (typeof value === 'number') {
      return {
        name: key,
        value,
        color: colors[index]
      };
    } else if (typeof value === 'object' && value !== null) {
      const total = calculateTotal(value as Record<string, unknown>);
      return {
        name: key,
        value: total,
        children: value as Record<string, unknown>,
        color: colors[index]
      };
    }
    return {
      name: key,
      value: 0,
      color: colors[index]
    };
  }).filter(item => item.value > 0);
};

const calculateTotal = (obj: Record<string, unknown>): number => {
  let total = 0;
  
  for (const value of Object.values(obj)) {
    if (typeof value === 'number') {
      total += value;
    } else if (typeof value === 'object' && value !== null) {
      total += calculateTotal(value as Record<string, unknown>);
    }
  }
  
  return total;
};

const formatCurrency = (value: number): string => {
  const billion = Math.floor(value / 1000000);
  const million = Math.floor((value % 1000000) / 1000);
  
  if (billion > 0) {
    return `${billion.toLocaleString()}億${million > 0 ? `${million.toLocaleString()}万` : ''}円`;
  } else if (million > 0) {
    return `${million.toLocaleString()}万円`;
  } else {
    return `${value.toLocaleString()}千円`;
  }
};

interface InteractivePieChartProps {
  title: string;
  data: Record<string, unknown>;
  className?: string;
}

const InteractivePieChart: React.FC<InteractivePieChartProps> = ({ title, data, className }) => {
  const [drillPath, setDrillPath] = useState<DrillPath[]>([]);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const currentData = useMemo(() => {
    let current = data;
    for (const pathItem of drillPath) {
      if (current[pathItem.name] && typeof current[pathItem.name] === 'object') {
        current = current[pathItem.name] as Record<string, unknown>;
      }
    }
    return processDataForChart(current);
  }, [data, drillPath]);

  const chartData = useMemo(() => {
    return {
      labels: currentData.map(item => item.name),
      datasets: [
        {
          data: currentData.map(item => item.value),
          backgroundColor: currentData.map(item => item.color),
          borderColor: currentData.map(item => item.color),
          borderWidth: 2,
          hoverBorderWidth: 4,
          hoverOffset: 20,
        },
      ],
    };
  }, [currentData]);

  const options = useMemo(() => ({
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
          setDrillPath(prev => [...prev, { name: item.name, level: prev.length }]);
        }
      }
    },
  }), [currentData]);

  const handleBreadcrumbClick = useCallback((index: number) => {
    setDrillPath(prev => prev.slice(0, index + 1));
  }, []);

  const goBack = useCallback(() => {
    setDrillPath(prev => prev.slice(0, -1));
  }, []);

  return (
    <motion.div 
      className={`bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 ${className || ''}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            title === '歳入' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-red-500 to-pink-600'
          }`}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {title === '歳入' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              )}
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>
        {drillPath.length > 0 && (
          <motion.button
            onClick={goBack}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            戻る
          </motion.button>
        )}
      </div>

      {drillPath.length > 0 && (
        <motion.nav 
          className="mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-200/50"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <ol className="flex items-center space-x-2 text-sm text-gray-600 flex-wrap">
            <li>
              <button
                onClick={() => setDrillPath([])}
                className="px-3 py-1 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
              >
                トップ
              </button>
            </li>
            {drillPath.map((path, index) => (
              <React.Fragment key={index}>
                <li className="text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </li>
                <li>
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    className="px-3 py-1 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-all duration-200"
                  >
                    {path.name}
                  </button>
                </li>
              </React.Fragment>
            ))}
          </ol>
        </motion.nav>
      )}

      <div className="h-96 flex items-center justify-center mb-6 bg-gradient-to-br from-gray-50/50 to-white/50 rounded-2xl border border-gray-100/50">
        <div className="w-full h-full p-4">
          <Doughnut data={chartData} options={options} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {currentData.slice(0, 12).map((entry, index) => (
          <motion.div 
            key={index} 
            className={`flex items-center p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
              hoveredSegment === entry.name 
                ? 'bg-blue-50 border-blue-200 shadow-md' 
                : 'bg-white/50 border-gray-200/50 hover:bg-gray-50/50'
            } ${entry.children ? 'hover:shadow-lg' : ''}`}
            onClick={() => entry.children && setDrillPath(prev => [...prev, { name: entry.name, level: prev.length }])}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div
              className="w-4 h-4 rounded-full mr-3 flex-shrink-0 shadow-sm"
              style={{ backgroundColor: entry.color }}
            />
            <div className="min-w-0 flex-1">
              <span 
                className={`block text-sm font-medium truncate transition-colors ${
                  hoveredSegment === entry.name ? 'text-blue-700' : 'text-gray-700'
                }`}
                title={`${entry.name}: ${formatCurrency(entry.value)}`}
              >
                {entry.name}
              </span>
              <span className="block text-xs text-gray-500 truncate">
                {formatCurrency(entry.value)}
              </span>
            </div>
            {entry.children && (
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </motion.div>
        ))}
        {currentData.length > 12 && (
          <div className="flex items-center justify-center p-3 rounded-xl bg-gray-100/50 border border-gray-200/50">
            <span className="text-sm text-gray-500 font-medium">
              +{currentData.length - 12} more...
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InteractivePieChart;