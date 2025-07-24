"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import NoSSR from "../components/NoSSR";
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
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
} from "@chakra-ui/react";
import {
  FaGithub,
  FaHeart,
  FaHandHoldingUsd,
  FaStar,
  FaSignInAlt,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
  saveBudget,
  getCommunityBudgets,
  addComment,
  toggleLike,
  type Dataset,
  type Comment,
} from "../lib/firestore";
import { useAuth } from "@/lib/auth";
import defaultRevenue from "../data/japan/2025/revenue.json";
import defaultExpenditure from "../data/japan/2025/expenditure.json";

// Import data for all available years
import revenue2024 from "../data/japan/2024/revenue.json";
import expenditure2024 from "../data/japan/2024/expenditure.json";
import revenue2023 from "../data/japan/2023/revenue.json";
import expenditure2023 from "../data/japan/2023/expenditure.json";
import revenue2022 from "../data/japan/2022/revenue.json";
import expenditure2022 from "../data/japan/2022/expenditure.json";
import revenue2021 from "../data/japan/2021/revenue.json";
import expenditure2021 from "../data/japan/2021/expenditure.json";
import revenue2020 from "../data/japan/2020/revenue.json";
import expenditure2020 from "../data/japan/2020/expenditure.json";
import revenue2019 from "../data/japan/2019/revenue.json";
import expenditure2019 from "../data/japan/2019/expenditure.json";
import revenue2018 from "../data/japan/2018/revenue.json";
import expenditure2018 from "../data/japan/2018/expenditure.json";
import revenue2017 from "../data/japan/2017/revenue.json";
import expenditure2017 from "../data/japan/2017/expenditure.json";
import revenue2016 from "../data/japan/2016/revenue.json";
import expenditure2016 from "../data/japan/2016/expenditure.json";
import revenue2015 from "../data/japan/2015/revenue.json";
import expenditure2015 from "../data/japan/2015/expenditure.json";
import revenue2014 from "../data/japan/2014/revenue.json";
import expenditure2014 from "../data/japan/2014/expenditure.json";
import revenue2013 from "../data/japan/2013/revenue.json";
import expenditure2013 from "../data/japan/2013/expenditure.json";
import revenue2012 from "../data/japan/2012/revenue.json";
import expenditure2012 from "../data/japan/2012/expenditure.json";
import revenue2011 from "../data/japan/2011/revenue.json";
import expenditure2011 from "../data/japan/2011/expenditure.json";
import Footer from "../components/Footer";

const BudgetChart = dynamic(() => import("../components/BudgetChart"), {
  ssr: false,
  loading: () => (
    <Box textAlign="center" p={10}>
      Loading...
    </Box>
  ),
});

// Define budget data for all years
const JAPAN_BUDGET_YEARS = [
  { year: 2025, name: "2025年度", revenue: defaultRevenue, expenditure: defaultExpenditure },
  { year: 2024, name: "2024年度", revenue: revenue2024, expenditure: expenditure2024 },
  { year: 2023, name: "2023年度", revenue: revenue2023, expenditure: expenditure2023 },
  { year: 2022, name: "2022年度", revenue: revenue2022, expenditure: expenditure2022 },
  { year: 2021, name: "2021年度", revenue: revenue2021, expenditure: expenditure2021 },
  { year: 2020, name: "2020年度", revenue: revenue2020, expenditure: expenditure2020 },
  { year: 2019, name: "2019年度", revenue: revenue2019, expenditure: expenditure2019 },
  { year: 2018, name: "2018年度", revenue: revenue2018, expenditure: expenditure2018 },
  { year: 2017, name: "2017年度", revenue: revenue2017, expenditure: expenditure2017 },
  { year: 2016, name: "2016年度", revenue: revenue2016, expenditure: expenditure2016 },
  { year: 2015, name: "2015年度", revenue: revenue2015, expenditure: expenditure2015 },
  { year: 2014, name: "2014年度", revenue: revenue2014, expenditure: expenditure2014 },
  { year: 2013, name: "2013年度", revenue: revenue2013, expenditure: expenditure2013 },
  { year: 2012, name: "2012年度", revenue: revenue2012, expenditure: expenditure2012 },
  { year: 2011, name: "2011年度", revenue: revenue2011, expenditure: expenditure2011 },
];

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
  const { user, logout, updateUsername } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [datasets, setDatasets] = useState<Dataset[]>(
    JAPAN_BUDGET_YEARS.map(year => ({
      id: undefined,
      name: year.name,
      revenue: year.revenue,
      expenditure: year.expenditure,
      comments: [],
      likedBy: [],
      likes: 0,
    }))
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    const saved = localStorage.getItem("savedDatasets");
    if (saved) {
      try {
        const arr: Dataset[] = JSON.parse(saved).map((d: Dataset) => ({
          id: d.id,
          comments: [],
          likedBy: d.likedBy || [],
          likes: d.likedBy ? d.likedBy.length : d.likes || 0,
          ...d,
        }));
        if (arr.length > 0) {
          setDatasets((prev) => [...prev, ...arr]);
        }
      } catch {}
    }
    const shared = localStorage.getItem("sharedDataset");
    if (shared) {
      try {
        const ds: Dataset = JSON.parse(shared);
        ds.comments = ds.comments || [];
        ds.likedBy = ds.likedBy || [];
        ds.likes = ds.likedBy.length;
        if (ds.id && !ds.shareUrl) {
          ds.shareUrl = `${window.location.origin}/idea/${ds.id}`;
        }
        // Insert shared dataset at the beginning
        setDatasets((prev) => [ds, ...prev]);
        setSelected(0);
      } catch {}
      localStorage.removeItem("sharedDataset");
    }
  }, [mounted]);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const budgets = await getCommunityBudgets();
        setCommunity(budgets);
      } catch (error) {
        console.error("Error fetching community budgets:", error);
      }
    };
    fetchCommunity();
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
  const [community, setCommunity] = useState<Dataset[]>([]);
  const [commentText, setCommentText] = useState("");
  // Check if any Japan budget has been shared/modified (has an ID)
  const hasShared = datasets.slice(0, JAPAN_BUDGET_YEARS.length).some(d => d.id !== undefined);

  useEffect(() => {
    const ds = datasets[selected];
    setRevenueInput(JSON.stringify(ds.revenue, null, 2));
    setExpenditureInput(JSON.stringify(ds.expenditure, null, 2));
  }, [selected, datasets]);

  useEffect(() => {
    const ds = datasets[selected];
    if (ds.id) {
      router.replace(`/idea/${ds.id}`);
    } else {
      router.replace("/");
    }
  }, [selected, datasets, router]);

  useEffect(() => {
    setUsername(user?.displayName || "");
  }, [user]);

  const updateDataset = () => {
    try {
      const revenue = JSON.parse(revenueInput);
      const expenditure = JSON.parse(expenditureInput);
      setDatasets((prev) =>
        prev.map((d, i) =>
          i === selected ? { ...d, revenue, expenditure } : d
        )
      );
      setError("");
    } catch {
      setError("JSON の構文エラーがあります");
    }
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
      if (op === "add" && name)
        ds.revenue = addAtPath(ds.revenue, path, name, value || 0);
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
      if (op === "set")
        ds.expenditure = setAtPath(ds.expenditure, path, value || 0);
      if (op === "delete") ds.expenditure = deleteAtPath(ds.expenditure, path);
      if (op === "add" && name)
        ds.expenditure = addAtPath(ds.expenditure, path, name, value || 0);
      updated[selected] = ds;
      return updated;
    });
  };

  const handleAddComment = async () => {
    console.log("handleAddComment called");
    if (!commentText.trim()) {
      console.log("Comment text is empty");
      return;
    }
    if (!user) {
      console.log("User not logged in");
      window.open("/login", "_blank");
      return;
    }
    console.log("User:", user.uid, "Dataset ID:", datasets[selected].id);

    const comment: Comment = {
      username: user.displayName || "名無し",
      text: commentText.trim(),
    };
    setDatasets((prev) => {
      const updated = [...prev];
      const ds = { ...updated[selected] };
      ds.comments = ds.comments ? [...ds.comments, comment] : [comment];
      updated[selected] = ds;
      return updated;
    });

    // Save to Firestore if budget has an ID
    if (datasets[selected].id) {
      const id = datasets[selected].id;
      console.log("Attempting to add comment to Firestore for budget:", id);
      try {
        await addComment(id, user.uid, comment.username, comment.text);
        console.log("Comment added successfully to Firestore");
      } catch (error) {
        console.error("Error adding comment to Firestore:", error);
        // Revert local state on error
        setDatasets((prev) => {
          const updated = [...prev];
          const ds = { ...updated[selected] };
          ds.comments =
            ds.comments?.filter((c, i) => i !== ds.comments!.length - 1) || [];
          updated[selected] = ds;
          return updated;
        });
      }
    } else {
      console.log("No budget ID, skipping Firestore save");
    }
    setCommentText("");
  };

  const handleLike = async () => {
    console.log("handleLike called");
    if (!user) {
      console.log("User not logged in, redirecting to login");
      router.push("/login");
      return;
    }
    const uid = user.uid;
    const cur = datasets[selected];
    const already = cur.likedBy?.includes(uid);
    console.log("User:", uid, "Budget ID:", cur.id, "Already liked:", already);

    // Update local state first
    const newLikedState = !already;
    setDatasets((prev) => {
      const updated = [...prev];
      const ds = { ...updated[selected] };
      ds.likedBy = ds.likedBy || [];
      ds.likedBy = already
        ? ds.likedBy.filter((id) => id !== uid)
        : [...ds.likedBy, uid];
      ds.likes = ds.likedBy.length;
      updated[selected] = ds;
      return updated;
    });

    // Save to Firestore if budget has an ID
    if (cur.id) {
      const id = cur.id;
      console.log("Attempting to handle like in Firestore for budget:", id);
      try {
        const liked = await toggleLike(id, uid);
        console.log(
          `Like ${liked ? "added" : "removed"} successfully to/from Firestore`
        );
      } catch (error) {
        console.error("Error handling like in Firestore:", error);
        // Revert local state on error
        setDatasets((prev) => {
          const updated = [...prev];
          const ds = { ...updated[selected] };
          ds.likedBy = ds.likedBy || [];
          ds.likedBy = newLikedState
            ? ds.likedBy.filter((id) => id !== uid)
            : [...ds.likedBy, uid];
          ds.likes = ds.likedBy.length;
          updated[selected] = ds;
          return updated;
        });
      }
    } else {
      console.log("No budget ID, skipping Firestore operation");
    }
  };

  const [saveName, setSaveName] = useState("");
  const [saveDesc, setSaveDesc] = useState("");
  const [username, setUsername] = useState("");
  const toast = useToast();

  const handleSave = async (name: string, description: string) => {
    const newDs: Dataset = {
      id: current.id,
      name,
      description,
      revenue: current.revenue,
      expenditure: current.expenditure,
      comments: current.comments || [],
      likedBy: current.likedBy || [],
      likes: current.likes || 0,
    };
    if (user) {
      try {
        const budgetId = await saveBudget(
          user.uid,
          name,
          description,
          current.revenue,
          current.expenditure
        );
        newDs.id = budgetId;
        const url = `${window.location.origin}/idea/${budgetId}`;
        newDs.shareUrl = url;
        await navigator.clipboard.writeText(url);
        toast({ description: "共有リンクをコピーしました", status: "success" });
      } catch (error) {
        console.error("Error saving budget:", error);
        toast({ description: "保存に失敗しました", status: "error" });
        return;
      }
    } else {
      const stored = localStorage.getItem("savedDatasets");
      const arr = stored ? JSON.parse(stored) : [];
      arr.push(newDs);
      localStorage.setItem("savedDatasets", JSON.stringify(arr));
    }
    setDatasets((prev) => {
      const updated = [...prev];
      updated[selected] = newDs;
      return updated;
    });
  };

  const copyLink = () => {
    const ds = datasets[selected];
    const url = ds.shareUrl || (ds.id ? `${window.location.origin}/idea/${ds.id}` : null);
    if (url) {
      navigator.clipboard.writeText(url);
      toast({ description: "共有リンクをコピーしました", status: "success" });
    } else {
      toast({ description: "まず保存してください", status: "info" });
    }
  };

  const shareTwitter = () => {
    const ds = datasets[selected];
    const url = ds.shareUrl || (ds.id ? `${window.location.origin}/idea/${ds.id}` : null);
    if (url) {
      const tweet = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}`;
      window.open(tweet, "_blank");
    } else {
      toast({ description: "まず保存してください", status: "info" });
    }
  };

  const current = datasets[selected];

  const revenueTotal = calculateTotal(current.revenue);
  const expenditureTotal = calculateTotal(current.expenditure);

  const {
    isOpen: drawerOpen,
    onOpen: openDrawer,
    onClose: closeDrawer,
  } = useDisclosure();
  const {
    isOpen: saveOpen,
    onOpen: openSave,
    onClose: closeSave,
  } = useDisclosure();
  const {
    isOpen: profileOpen,
    onOpen: openProfile,
    onClose: closeProfile,
  } = useDisclosure();
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    
    const checkBreakpoints = () => {
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        setIsDesktop(width >= 1024); // lg breakpoint
        setIsMobile(width < 768); // md breakpoint
      }
    };

    checkBreakpoints();
    window.addEventListener('resize', checkBreakpoints);
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, [mounted]);

  // Early return during hydration to prevent mismatch
  if (!mounted) {
    return (
      <Box minH="100vh" display="flex" flexDirection="column">
        <Box flex="1" p={6}>
          <Box textAlign="center" p={10}>
            Loading...
          </Box>
        </Box>
      </Box>
    );
  }

  const SidebarContent = ({ onSelect }: { onSelect?: () => void }) => {
    const japanDatasetsCount = JAPAN_BUDGET_YEARS.length;
    const startIndex = hasShared ? 1 : 0;
    const japanDatasets = datasets.slice(startIndex, startIndex + japanDatasetsCount);
    const userDatasets = datasets.slice(startIndex + japanDatasetsCount);
    
    return (
      <Box
        w={{ base: "full", lg: 60 }}
        p={4}
        borderRightWidth="1px"
        bg="gray.50"
        _dark={{ bg: "gray.800" }}
        minH="100vh"
        overflowY="auto"
      >
        {hasShared && (
          <>
            <Heading size="sm" mb={2}>
              今表示している予算案
            </Heading>
            <Stack spacing={2} mb={4}>
              <Button
                variant={selected === 0 ? "solid" : "ghost"}
                colorScheme="blue"
                justifyContent="flex-start"
                textAlign="left"
                whiteSpace="normal"
                onClick={() => {
                  setSelected(0);
                  if (onSelect) onSelect();
                }}
              >
                <Box>
                  <Text>{datasets[0].name}</Text>
                  {datasets[0].description && (
                    <Text fontSize="xs" color="gray.500">
                      {datasets[0].description}
                    </Text>
                  )}
                </Box>
              </Button>
            </Stack>
          </>
        )}
        
        <Heading size="sm" mb={2}>
          日本の予算案
        </Heading>
        <Stack spacing={1} mb={4}>
          {japanDatasets.map((d, i) => {
            const index = i + startIndex;
            return (
              <Button
                key={index}
                variant={selected === index ? "solid" : "ghost"}
                colorScheme="blue"
                justifyContent="flex-start"
                textAlign="left"
                whiteSpace="normal"
                size="sm"
                onClick={() => {
                  setSelected(index);
                  if (onSelect) onSelect();
                }}
              >
                <Text fontSize="sm">{d.name}</Text>
              </Button>
            );
          })}
        </Stack>
        
        {userDatasets.length > 0 && (
          <>
            <Heading size="sm" mb={2}>
              オリジナル
            </Heading>
            <Stack spacing={2} mb={4}>
              {userDatasets.map((d, i) => {
                const index = i + startIndex + japanDatasetsCount;
                return (
                  <Button
                    key={index}
                    variant={selected === index ? "solid" : "ghost"}
                    colorScheme="blue"
                    justifyContent="flex-start"
                    textAlign="left"
                    whiteSpace="normal"
                    onClick={() => {
                      setSelected(index);
                      if (onSelect) onSelect();
                    }}
                  >
                    <Box>
                      <Text>{d.name}</Text>
                      {d.description && (
                        <Text fontSize="xs" color="gray.500">
                          {d.description}
                        </Text>
                      )}
                    </Box>
                  </Button>
                );
              })}
            </Stack>
          </>
        )}
        {community.length > 0 && (
          <>
            <Heading size="sm" mb={2}>
              みんなの予算案
            </Heading>
            <Text fontSize="xs" color="gray.500" mb={2}>
              以下はユーザ投稿コンテンツであり,
              その正しさや不適切でないことを確認していません
            </Text>
            <Stack spacing={2}>
              {community.map((d, i) => (
                <Button
                  key={`c-${i}`}
                  variant="ghost"
                  justifyContent="flex-start"
                  textAlign="left"
                  whiteSpace="normal"
                  onClick={() => {
                    setDatasets((prev) => [...prev, d]);
                    setSelected(datasets.length);
                    if (onSelect) onSelect();
                  }}
                >
                  <Box>
                    <Text>{d.name}</Text>
                    {d.description && (
                      <Text fontSize="xs" color="gray.500">
                        {d.description}
                      </Text>
                    )}
                  </Box>
                </Button>
              ))}
            </Stack>
          </>
        )}
      </Box>
    );
  };

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Flex flex="1">
        <NoSSR>
          {isDesktop ? (
            <SidebarContent />
          ) : (
            <Drawer isOpen={drawerOpen} placement="left" onClose={closeDrawer}>
              <DrawerOverlay />
              <DrawerContent maxW="60">
                <DrawerBody p={0}>
                  <SidebarContent onSelect={closeDrawer} />
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          )}
        </NoSSR>
        <Box flex="1" p={6}>
          <Flex align="center" mb={4} gap={2} justify="space-between">
            <NoSSR>
              {!isDesktop && (
                <IconButton
                  aria-label="メニュー"
                  icon={
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M2 4h16M2 10h16M2 16h16"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                  onClick={openDrawer}
                  variant="outline"
                />
              )}
            </NoSSR>
            <Box flex="1" />
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Button
                  leftIcon={<FaHeart />}
                  variant="outline"
                  colorScheme="pink"
                >
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
              href="https://github.com/taniiicom/yosan-org"
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
            {user ? (
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<Avatar size="sm" src={user.photoURL || undefined} />}
                  variant="outline"
                />
                <MenuList>
                  <MenuItem onClick={openProfile}>プロフィール設定</MenuItem>
                  <MenuItem onClick={logout}>ログアウト</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <NoSSR>
                {isMobile ? (
                  <IconButton
                    aria-label="ログイン"
                    icon={<FaSignInAlt />}
                    variant="outline"
                    onClick={() => window.open("/login", "_blank")}
                  />
                ) : (
                  <Button
                    leftIcon={<FaSignInAlt />}
                    onClick={() => window.open("/login", "_blank")}
                  >
                    ログイン
                  </Button>
                )}
              </NoSSR>
            )}
          </Flex>
          <Stack gap={8}>
            <Box textAlign="center">
              <Heading
                bgGradient="linear(to-r, purple.500, blue.500)"
                bgClip="text"
                fontSize="xl"
                fontWeight="bold"
              >
                国家予算シミュレータ
              </Heading>
              <Heading
                bgGradient="linear(to-r, purple.500, blue.500)"
                bgClip="text"
                fontSize="5xl"
                fontWeight="bold"
              >
                yosan.org
              </Heading>
              <Text color="gray.600" fontSize="sm" mt={2}>
                日本の国家予算をインタラクティブに可視化し,
                自由に編集しながら試行錯誤し, 自分の考えた予算案をシェアできます
              </Text>
            </Box>

            <Flex flexWrap="wrap" align="center" gap={4}>
              <Button onClick={updateDataset}>グラフ更新</Button>
              <Button
                onClick={() => {
                  if (!user) {
                    window.open("/login", "_blank");
                    return;
                  }
                  setSaveName("");
                  setSaveDesc("");
                  openSave();
                }}
                colorScheme="green"
                variant="outline"
              >
                保存
              </Button>
              <Button
                onClick={shareTwitter}
                colorScheme="twitter"
                variant="outline"
              >
                Twitter にシェア
              </Button>
              <Button onClick={copyLink} variant="outline" colorScheme="gray">
                リンク共有
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

            <Box mt={4}>
              <Heading size="sm" mb={2}>
                コメント
              </Heading>
              <Stack spacing={2} maxH="40" overflowY="auto">
                {current.comments?.map((c, i) => (
                  <Box
                    key={i}
                    p={2}
                    borderWidth="1px"
                    borderRadius="md"
                    bg="white"
                    _dark={{ bg: "gray.700" }}
                  >
                    <Text fontWeight="bold" fontSize="sm">
                      {c.username}
                    </Text>
                    <Text fontSize="sm">{c.text}</Text>
                  </Box>
                ))}
              </Stack>
              <Flex mt={2} gap={2}>
                <Input
                  flex="1"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="コメントを入力"
                />
                <Button onClick={handleAddComment}>投稿</Button>
              </Flex>
            </Box>

            <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
              <Box
                p={4}
                borderWidth="1px"
                borderRadius="xl"
                bg="gray.50"
                _dark={{ bg: "gray.700" }}
              >
                <Text fontWeight="semibold" mb={2}>
                  Revenue JSON
                </Text>
                <Textarea
                  h="16rem"
                  value={revenueInput}
                  onChange={(e) => setRevenueInput(e.target.value)}
                />
                <Text mt={2} fontSize="sm" textAlign="right">
                  合計: {revenueTotal.toLocaleString()} 円
                </Text>
              </Box>
              <Box
                p={4}
                borderWidth="1px"
                borderRadius="xl"
                bg="gray.50"
                _dark={{ bg: "gray.700" }}
              >
                <Text fontWeight="semibold" mb={2}>
                  Expenditure JSON
                </Text>
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
      <Button
        leftIcon={<FaHeart />}
        variant={
          user && current.likedBy?.includes(user.uid) ? "solid" : "outline"
        }
        colorScheme="pink"
        position="fixed"
        bottom="4"
        right="4"
        onClick={handleLike}
        borderRadius="full"
      >
        {current.likes}
      </Button>
      <Modal isOpen={saveOpen} onClose={closeSave}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>データ保存</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>名前</FormLabel>
              <Input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>説明</FormLabel>
              <Textarea
                value={saveDesc}
                onChange={(e) => setSaveDesc(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={closeSave}>
              キャンセル
            </Button>
            <Button
              colorScheme="green"
              onClick={() => {
                if (!saveName.trim()) return;
                handleSave(saveName.trim(), saveDesc);
                closeSave();
              }}
              isDisabled={!saveName.trim()}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={profileOpen} onClose={closeProfile}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>プロフィール設定</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>表示名</FormLabel>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={closeProfile}>
              キャンセル
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => {
                if (!username.trim()) return;
                updateUsername(username.trim());
                closeProfile();
              }}
              isDisabled={!username.trim()}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
