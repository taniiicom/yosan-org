"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { motion } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
} from "@chakra-ui/react";

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
          borderWidth: 0,
          hoverBorderWidth: 0,
          hoverOffset: 0,
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        bg="white"
        borderWidth="1px"
        borderColor="gray.200"
        _dark={{ bg: "gray.800", borderColor: "gray.700" }}
        rounded="2xl"
        p={6}
        shadow="sm"
        className={className}
      >
        <Flex justify="space-between" mb={{ base: 6, sm: 8 }}>
          <Flex align="center" gap={{ base: 3, sm: 4 }} minW={0}>
            <Flex
              w={{ base: 10, sm: 12 }}
              h={{ base: 10, sm: 12 }}
              align="center"
              justify="center"
              bgGradient="linear(to-br, blue.500, purple.500)"
              color="white"
              rounded={{ base: "xl", sm: "2xl" }}
              shadow="sm"
              flexShrink={0}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
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
            </Flex>
            <Text
              fontSize={{ base: "lg", sm: "xl", lg: "2xl", xl: "3xl" }}
              fontWeight="bold"
              bgGradient="linear(to-r, gray.800, gray.600)"
              bgClip="text"
              noOfLines={1}
            >
              {title}
            </Text>
          </Flex>
          {drillPath.length > 0 && (
            <IconButton
              aria-label="戻る"
              onClick={goBack}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="gray">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              }
              variant="solid"
              colorScheme="purple"
              rounded="full"
              size="lg"
              as={motion.button}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              shadow="sm"
            />
          )}
        </Flex>

        {drillPath.length > 0 && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <Breadcrumb
              mb={{ base: 6, sm: 8 }}
              px={3}
              py={3}
              rounded={{ base: "xl", sm: "2xl" }}
              fontSize={{ base: "xs", sm: "sm" }}
              bg="gray.50"
              borderWidth="1px"
              borderColor="gray.200"
              _dark={{ bg: "gray.700", borderColor: "gray.600" }}
              separator={<Text mx={2} color="gray.400">/</Text>}
            >
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => setDrillPath([])}>トップ</BreadcrumbLink>
              </BreadcrumbItem>
              {drillPath.map((path, index) => (
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink onClick={() => handleBreadcrumbClick(index)} maxW={{ base: 32, sm: 48 }} isTruncated>
                    {path.name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          </motion.nav>
        )}

        <Flex
          h={{ base: 72, sm: 80, lg: 96, xl: 420 }}
          align="center"
          justify="center"
          bg="gray.50"
          borderWidth="1px"
          borderColor="gray.200"
          _dark={{ bg: "gray.800", borderColor: "gray.700" }}
          rounded={{ base: "xl", sm: "2xl" }}
        >
          <Box w="full" h="full" p={{ base: 3, sm: 4, lg: 6 }}>
            <Doughnut data={chartData} options={options} />
          </Box>
        </Flex>

        <SimpleGrid mt={8} columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap={{ base: 4, sm: 5 }} justifyItems="center">
          {currentData.map((entry, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: "100%" }}
              onClick={() =>
                entry.children &&
                setDrillPath((prev) => [...prev, { name: entry.name, level: prev.length }])
              }
            >
              <Flex
                p={{ base: 4, sm: 5 }}
                rounded={{ base: "lg", sm: "xl" }}
                bg="gray.100"
                borderWidth="1px"
                borderColor="gray.200"
                _dark={{ bg: "gray.700", borderColor: "gray.600" }}
                align="center"
                className={hoveredSegment === entry.name ? "scale-105" : undefined}
              >
                <Box
                  w={{ base: 4, sm: 5 }}
                  h={{ base: 4, sm: 5 }}
                  rounded="full"
                  mr={{ base: 3, sm: 4 }}
                  flexShrink={0}
                  shadow="sm"
                  style={{ backgroundColor: entry.color }}
                />
                <Box flex="1" minW={0}>
                  <Text
                    fontSize={{ base: "xs", sm: "sm" }}
                    fontWeight="medium"
                    noOfLines={1}
                    color={hoveredSegment === entry.name ? "blue.700" : "gray.700"}
                  >
                    {entry.name}
                  </Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={1} mt={{ base: 0.5, sm: 1 }}>
                    {formatCurrency(entry.value)}
                  </Text>
                </Box>
                {entry.children && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    style={{ marginLeft: "0.25rem" }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </Flex>
            </motion.div>
          ))}
        </SimpleGrid>
      </Box>
    </motion.div>
  );
};

export default InteractivePieChart;

