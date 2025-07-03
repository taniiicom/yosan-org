"use client";

import dynamic from "next/dynamic";
import { Box, Container, Heading, Text, SimpleGrid, Flex } from "@chakra-ui/react";
import { motion } from "framer-motion";
import revenueData from "../data/japan/2025/revenue.json";
import expenditureData from "../data/japan/2025/expenditure.json";

const InteractivePieChart = dynamic(() => import("../components/BudgetChart"), {
  ssr: false,
  loading: () => (
    <Flex align="center" justify="center" h="96">
      <Box>
        <Box
          w="16"
          h="16"
          borderWidth="4px"
          borderColor="blue.200"
          borderTopColor="blue.500"
          rounded="full"
          borderStyle="solid"
          className="animate-spin"
        />
        <Text mt={4} color="gray.600" textAlign="center">
          チャートを読み込み中...
        </Text>
      </Box>
    </Flex>
  ),
});

const MotionBox = motion(Box);

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
      return `${trillion.toLocaleString()}兆${billion > 0 ? `${billion.toLocaleString()}億` : ""}円`;
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
    <Box minH="100vh">
      {/* Header */}
      <motion.header initial={{ y: -100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}>
        <Container py={{ base: 6, md: 12 }} textAlign="center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Heading fontSize={{ base: "2xl", md: "4xl" }} fontWeight="bold">
              令和7年度 国家予算可視化
            </Heading>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <Text color="gray.600" fontSize={{ base: "sm", md: "lg" }} maxW="3xl" mx="auto" mt={2}>
              日本の国家予算をインタラクティブな円グラフで探索できます
            </Text>
          </motion.p>
        </Container>
      </motion.header>

      {/* Stats */}
      <Container py={{ base: 8, md: 16 }}>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8} mb={16}>
            <Box className="clay-raised" _hover={{ transform: "scale(1.05)" }} transition="transform 0.3s">
              <Flex align="center" gap={4}>
                <Box className="clay-inset" w={12} h={12} rounded="lg" display="flex" alignItems="center" justifyContent="center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </Box>
                <Box minW={0} flex="1">
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                    歳入総額
                  </Text>
                  <Text fontSize="2xl" fontWeight="semibold" noOfLines={1}>
                    {formatCurrency(revenueTotal)}
                  </Text>
                </Box>
              </Flex>
            </Box>
            <Box className="clay-raised" _hover={{ transform: "scale(1.05)" }} transition="transform 0.3s">
              <Flex align="center" gap={4}>
                <Box className="clay-inset" w={12} h={12} rounded="lg" display="flex" alignItems="center" justifyContent="center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </Box>
                <Box minW={0} flex="1">
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                    歳出総額
                  </Text>
                  <Text fontSize="2xl" fontWeight="semibold" noOfLines={1}>
                    {formatCurrency(expenditureTotal)}
                  </Text>
                </Box>
              </Flex>
            </Box>
            <Box className="clay-raised" _hover={{ transform: "scale(1.05)" }} transition="transform 0.3s">
              <Flex align="center" gap={4}>
                <Box className="clay-inset" w={12} h={12} rounded="lg" display="flex" alignItems="center" justifyContent="center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </Box>
                <Box minW={0} flex="1">
                  <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={1}>
                    収支差額
                  </Text>
                  <Text
                    fontSize="2xl"
                    fontWeight="semibold"
                    color={revenueTotal - expenditureTotal >= 0 ? "green.600" : "red.600"}
                    noOfLines={1}
                  >
                    {revenueTotal - expenditureTotal >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(revenueTotal - expenditureTotal))}
                  </Text>
                </Box>
              </Flex>
            </Box>
          </SimpleGrid>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Flex wrap="wrap" justify="center" gap={8}>
            <MotionBox whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }} w={{ base: "full", lg: "45%" }} flexGrow={1}>
              <InteractivePieChart title="歳入" data={revenueData} className="h-full" />
            </MotionBox>
            <MotionBox whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 300 }} w={{ base: "full", lg: "45%" }} flexGrow={1}>
              <InteractivePieChart title="歳出" data={expenditureData} className="h-full" />
            </MotionBox>
          </Flex>
        </motion.div>

        <MotionBox
          className="clay-raised"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          mt={16}
        >
          <Heading as="h3" fontSize={{ base: "xl", md: "2xl" }} mb={6}>
            使い方
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            <Flex align="start" gap={4}>
              <Box className="clay-inset" w={10} h={10} rounded="lg" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>
                  クリックで詳細表示
                </Text>
                <Text fontSize="sm" color="gray.600">
                  円グラフのセグメントをクリックすると、より詳細な内訳を確認できます
                </Text>
              </Box>
            </Flex>
            <Flex align="start" gap={4}>
              <Box className="clay-inset" w={10} h={10} rounded="lg" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v0" />
                </svg>
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>
                  ホバーで金額確認
                </Text>
                <Text fontSize="sm" color="gray.600">
                  セグメントにマウスを重ねると、具体的な金額がツールチップで表示されます
                </Text>
              </Box>
            </Flex>
            <Flex align="start" gap={4}>
              <Box className="clay-inset" w={10} h={10} rounded="lg" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>
                  パンくずで階層移動
                </Text>
                <Text fontSize="sm" color="gray.600">
                  「戻る」ボタンやパンくずナビゲーションで上位階層に戻ることができます
                </Text>
              </Box>
            </Flex>
          </SimpleGrid>
        </MotionBox>
      </Container>

      {/* Footer */}
      <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.2 }}>
        <Box py={8} textAlign="center">
          <Text fontSize="sm" color="gray.600">
            © 2025 国家予算可視化システム | データソース: 令和7年度一般会計予算
          </Text>
        </Box>
      </motion.footer>
    </Box>
  );
}
