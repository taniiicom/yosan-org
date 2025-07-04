"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Flex,
  Textarea,
  SimpleGrid,
  Stack,
  chakra,
} from "@chakra-ui/react";
import defaultRevenue from "../data/japan/2025/revenue.json";
import defaultExpenditure from "../data/japan/2025/expenditure.json";

const BudgetChart = dynamic(() => import("../components/BudgetChart"), {
  ssr: false,
  loading: () => <Box textAlign="center" p={10}>Loading...</Box>,
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
    <Box minH="100vh" p={6}>
      <Stack gap={8}>
        <Box textAlign="center">
          <Heading
            bgGradient="linear(to-r, purple.500, blue.500)"
            bgClip="text"
            fontSize="3xl"
            fontWeight="bold"
          >
            国家予算シミュレータ
          </Heading>
          <Text color="gray.600" fontSize="sm">
            データセットを編集してグラフに反映できます
          </Text>
        </Box>

        <Flex flexWrap="wrap" align="flex-end" gap={4}>
          <chakra.select
            w="auto"
            value={selected}
            onChange={(e) => setSelected(Number(e.target.value))}
            px={3}
            py={2}
            borderWidth="1px"
            borderRadius="md"
          >
            {datasets.map((d, i) => (
              <option key={i} value={i}>
                {d.name}
              </option>
            ))}
          </chakra.select>
          <Button onClick={addDataset}>データセット追加</Button>
          <Button onClick={updateDataset}>グラフ更新</Button>
          {error && (
            <Text color="red.500" ml={4} fontSize="sm">
              {error}
            </Text>
          )}
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          <BudgetChart title="歳入" data={current.revenue} />
          <BudgetChart title="歳出" data={current.expenditure} />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          <Box p={4} borderWidth="1px" borderRadius="xl" bg="gray.50" _dark={{ bg: 'gray.700' }}>
            <Text fontWeight="semibold" mb={2}>Revenue JSON</Text>
            <Textarea
              h="16rem"
              value={revenueInput}
              onChange={(e) => setRevenueInput(e.target.value)}
            />
            <Text mt={2} fontSize="sm" textAlign="right">
              合計: {revenueTotal.toLocaleString()} 円
            </Text>
          </Box>
          <Box p={4} borderWidth="1px" borderRadius="xl" bg="gray.50" _dark={{ bg: 'gray.700' }}>
            <Text fontWeight="semibold" mb={2}>Expenditure JSON</Text>
            <Textarea
              h="16rem"
              value={expenditureInput}
              onChange={(e) => setExpenditureInput(e.target.value)}
            />
            <Text mt={2} fontSize="sm" textAlign="right">
              合計: {expenditureTotal.toLocaleString()} 円
            </Text>
          </Box>
        </SimpleGrid>
      </Stack>
    </Box>
  );
}

