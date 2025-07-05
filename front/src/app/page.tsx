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
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  IconButton,
  FormControl,
  FormLabel,
  Switch,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  ButtonGroup,
  useDisclosure,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaGithub, FaHeart, FaHandHoldingUsd, FaStar } from "react-icons/fa";
import defaultRevenue from "../data/japan/2025/revenue.json";
import defaultExpenditure from "../data/japan/2025/expenditure.json";
import Footer from "../components/Footer";

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

const setAtPath = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: Record<string, any>,
  path: string[],
  value: number
) => {
  const cloned = structuredClone(obj);
  let cur = cloned;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (typeof cur[key] !== "object" || cur[key] === null) {
      cur[key] = {};
    }
    cur = cur[key];
  }
  cur[path[path.length - 1]] = value;
  return cloned;
};

const deleteAtPath = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: Record<string, any>,
  path: string[]
) => {
  const cloned = structuredClone(obj);
  let cur = cloned;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (typeof cur[key] !== "object" || cur[key] === null) return cloned;
    cur = cur[key];
  }
  delete cur[path[path.length - 1]];
  return cloned;
};

const addAtPath = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: Record<string, any>,
  path: string[],
  name: string,
  value: number
) => {
  const cloned = structuredClone(obj);
  let cur = cloned;
  for (const key of path) {
    if (typeof cur[key] !== "object" || cur[key] === null) {
      cur[key] = {};
    }
    cur = cur[key];
  }
  cur[name] = value;
  return cloned;
};

export default function Home() {
  const [datasets, setDatasets] = useState<Dataset[]>([
    { name: "Japan 2025", revenue: defaultRevenue, expenditure: defaultExpenditure },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("savedDatasets");
    if (saved) {
      try {
        const arr: Dataset[] = JSON.parse(saved);
        if (arr.length > 0) {
          setDatasets((prev) => [...prev, ...arr]);
        }
      } catch {}
    }
  }, []);
  const [selected, setSelected] = useState(0);
  const [revenueInput, setRevenueInput] = useState(
    JSON.stringify(defaultRevenue, null, 2)
  );
  const [expenditureInput, setExpenditureInput] = useState(
    JSON.stringify(defaultExpenditure, null, 2)
  );
  const [error, setError] = useState<string>("");
  const [editMode, setEditMode] = useState<"view" | "edit">("view");

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

  const handleRevenueEdit = (
    op: "set" | "delete" | "add",
    path: string[],
    name?: string,
    value?: number
  ) => {
    setDatasets((prev) => {
      const updated = [...prev];
      const ds = { ...updated[selected] };
      if (op === "set") ds.revenue = setAtPath(ds.revenue, path, value || 0);
      if (op === "delete") ds.revenue = deleteAtPath(ds.revenue, path);
      if (op === "add" && name) ds.revenue = addAtPath(ds.revenue, path, name, value || 0);
      updated[selected] = ds;
      return updated;
    });
  };

  const handleExpenditureEdit = (
    op: "set" | "delete" | "add",
    path: string[],
    name?: string,
    value?: number
  ) => {
    setDatasets((prev) => {
      const updated = [...prev];
      const ds = { ...updated[selected] };
      if (op === "set") ds.expenditure = setAtPath(ds.expenditure, path, value || 0);
      if (op === "delete") ds.expenditure = deleteAtPath(ds.expenditure, path);
      if (op === "add" && name) ds.expenditure = addAtPath(ds.expenditure, path, name, value || 0);
      updated[selected] = ds;
      return updated;
    });
  };

  const saveDataset = () => {
    const name = prompt("データセット名", current.name);
    if (!name) return;
    const newDs = { name, revenue: current.revenue, expenditure: current.expenditure };
    const stored = localStorage.getItem("savedDatasets");
    const arr = stored ? JSON.parse(stored) : [];
    arr.push(newDs);
    localStorage.setItem("savedDatasets", JSON.stringify(arr));
    setDatasets((prev) => [...prev, newDs]);
    setSelected(datasets.length);
  };

  const current = datasets[selected];

  const revenueTotal = calculateTotal(current.revenue);
  const expenditureTotal = calculateTotal(current.expenditure);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const isDesktop = useBreakpointValue({ base: false, lg: true });

  const SidebarContent = ({ onSelect }: { onSelect?: () => void }) => (
    <Box
      w={{ base: "full", lg: 60 }}
      p={4}
      borderRightWidth="1px"
      bg="gray.50"
      _dark={{ bg: "gray.800" }}
      minH="100vh"
    >
      <Heading size="sm" mb={4}>
        データセット
      </Heading>
      <Stack spacing={2}>
        {datasets.map((d, i) => (
          <Button
            key={i}
            variant={selected === i ? "solid" : "ghost"}
            colorScheme="blue"
            justifyContent="flex-start"
            onClick={() => {
              setSelected(i);
              if (onSelect) onSelect();
            }}
          >
            {d.name}
          </Button>
        ))}
      </Stack>
      <Button
        mt={4}
        w="full"
        onClick={() => {
          addDataset();
          if (onSelect) onSelect();
        }}
      >
        追加
      </Button>
    </Box>
  );

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Flex flex="1">
        {isDesktop ? (
          <SidebarContent />
        ) : (
          <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent maxW="60">
              <DrawerBody p={0}>
                <SidebarContent onSelect={onClose} />
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        )}
        <Box flex="1" p={6}>
          <Flex align="center" mb={4} gap={2} justify="space-between">
            {!isDesktop && (
              <IconButton
                aria-label="メニュー"
                icon={
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 4h16M2 10h16M2 16h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                }
                onClick={onOpen}
                variant="outline"
              />
            )}
            <Box flex="1" />
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Button leftIcon={<FaHeart />} variant="outline" colorScheme="pink">
                  支援する
                </Button>
              </PopoverTrigger>
              <PopoverContent w="auto">
                <PopoverArrow />
                <PopoverBody>
                  <ButtonGroup size="sm" isAttached variant="solid" gap={2}>
                    <Button
                      as="a"
                      href="https://paypal.me/taniiicom?country.x=JP&locale.x=ja_JP"
                      leftIcon={<FaHandHoldingUsd />}
                      colorScheme="pink"
                    >
                      1回限り
                    </Button>
                    <Button
                      as="a"
                      href="https://taniiicom.fanbox.cc/plans"
                      leftIcon={<FaStar />}
                      colorScheme="pink"
                      variant="outline"
                    >
                      スポンサーになる
                    </Button>
                  </ButtonGroup>
                </PopoverBody>
              </PopoverContent>
            </Popover>
            <Button
              as="a"
              href="https://github.com/taniiicom/budget-simulator"
              target="_blank"
              leftIcon={<FaGithub />}
              variant="outline"
              sx={{
                background:
                  "linear-gradient(white, white) padding-box, linear-gradient(to right, #f56565, #805ad5, #4299e1) border-box",
                border: "2px solid transparent",
              }}
            >
              Open Source
            </Button>
          </Flex>
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

        <Flex flexWrap="wrap" align="center" gap={4}>
          <Button onClick={updateDataset}>グラフ更新</Button>
          <Button onClick={saveDataset} colorScheme="green" variant="outline">
            保存
          </Button>
          {error && (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          )}
          <Box flex="1" />
          <FormControl display="flex" alignItems="center" w="auto">
            <FormLabel htmlFor="edit-mode" mb="0" fontSize="sm">
              編集モード
            </FormLabel>
            <Switch
              id="edit-mode"
              colorScheme="blue"
              isChecked={editMode === "edit"}
              onChange={(e) =>
                setEditMode(e.target.checked ? "edit" : "view")
              }
              ml={2}
            />
          </FormControl>
        </Flex>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          <BudgetChart
            title="歳入"
            data={current.revenue}
            onEdit={handleRevenueEdit}
            editable={editMode === "edit"}
          />
          <BudgetChart
            title="歳出"
            data={current.expenditure}
            onEdit={handleExpenditureEdit}
            editable={editMode === "edit"}
          />
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
      </Flex>
      <Footer />
    </Box>
  );
}

