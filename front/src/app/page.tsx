"use client";

import dynamic from "next/dynamic";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  useColorModeValue,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon, CheckCircleIcon } from "@chakra-ui/icons";
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

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: React.ReactElement; color: string }) {
  return (
    <MotionBox
      p={6}
      rounded="lg"
      shadow="md"
      bg={useColorModeValue("white", "gray.700")}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      <Flex align="center" gap={4}>
        <Box color={color}>{icon}</Box>
        <Stat>
          <StatLabel color="gray.500">{label}</StatLabel>
          <StatNumber fontSize="2xl">{value}</StatNumber>
        </Stat>
      </Flex>
    </MotionBox>
  );
}

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
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.800')} py={10}>
      <Container maxW="6xl">
        <MotionBox textAlign="center" mb={10} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Heading size="lg" mb={2}>
            令和7年度 国家予算ダッシュボード
          </Heading>
          <Text color="gray.500">日本の国家予算をインタラクティブに確認できます</Text>
        </MotionBox>

        <MotionBox mb={10} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <StatCard
              label="歳入総額"
              value={formatCurrency(revenueTotal)}
              icon={<AddIcon boxSize={6} />}
              color="green.400"
            />
            <StatCard
              label="歳出総額"
              value={formatCurrency(expenditureTotal)}
              icon={<MinusIcon boxSize={6} />}
              color="red.400"
            />
            <StatCard
              label="収支差額"
              value={`${revenueTotal - expenditureTotal >= 0 ? '+' : ''}${formatCurrency(
                Math.abs(revenueTotal - expenditureTotal)
              )}`}
              icon={<CheckCircleIcon boxSize={6} />}
              color={revenueTotal - expenditureTotal >= 0 ? 'green.400' : 'red.400'}
            />
          </SimpleGrid>
        </MotionBox>

        <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
            <GridItem>
              <InteractivePieChart title="歳入" data={revenueData} className="h-full" />
            </GridItem>
            <GridItem>
              <InteractivePieChart title="歳出" data={expenditureData} className="h-full" />
            </GridItem>
          </Grid>
        </MotionBox>

        <MotionBox mt={10} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Heading size="md" mb={6} textAlign="center">
            使い方
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Flex direction="column" align="center" textAlign="center" p={4} rounded="lg" bg={useColorModeValue('white', 'gray.700')} shadow="md">
              <AddIcon boxSize={5} color="blue.400" mb={2} />
              <Text fontWeight="medium">クリックで詳細表示</Text>
              <Text fontSize="sm" color="gray.500">円グラフのセグメントをクリックすると、詳細な内訳を表示します</Text>
            </Flex>
            <Flex direction="column" align="center" textAlign="center" p={4} rounded="lg" bg={useColorModeValue('white', 'gray.700')} shadow="md">
              <MinusIcon boxSize={5} color="green.400" mb={2} />
              <Text fontWeight="medium">ホバーで金額確認</Text>
              <Text fontSize="sm" color="gray.500">セグメントにマウスを重ねると金額が表示されます</Text>
            </Flex>
            <Flex direction="column" align="center" textAlign="center" p={4} rounded="lg" bg={useColorModeValue('white', 'gray.700')} shadow="md">
              <CheckCircleIcon boxSize={5} color="purple.400" mb={2} />
              <Text fontWeight="medium">パンくずで階層移動</Text>
              <Text fontSize="sm" color="gray.500">戻るボタンやパンくずで上位階層へ戻れます</Text>
            </Flex>
          </SimpleGrid>
        </MotionBox>

        <Box textAlign="center" mt={10} color="gray.500" fontSize="sm">
          © 2025 国家予算可視化システム | データソース: 令和7年度一般会計予算
        </Box>
      </Container>
    </Box>
  );
}
