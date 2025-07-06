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
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useBreakpointValue,
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
  collection,
  addDoc,
  getDocs,
  query,
  limit,
  serverTimestamp,
  orderBy,
  where,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "@/lib/auth";
import defaultRevenue from "../data/japan/2025/revenue.json";
import defaultExpenditure from "../data/japan/2025/expenditure.json";
import Footer from "../components/Footer";

const BudgetChart = dynamic(() => import("../components/BudgetChart"), {
  ssr: false,
  loading: () => <Box textAlign="center" p={10}>Loading...</Box>,
});

interface Comment {
  username: string;
  text: string;
}

interface Dataset {
  id?: string;
  name: string;
  description?: string;
  revenue: Record<string, unknown>;
  expenditure: Record<string, unknown>;
  shareUrl?: string;
  comments?: Comment[];
  likedBy?: string[];
  likes?: number;
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
  const { user, logout, updateUsername } = useAuth();
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([
    {
      id: undefined,
      name: "Japan 2025",
      revenue: defaultRevenue,
      expenditure: defaultExpenditure,
      comments: [],
      likedBy: [],
      likes: 0,
    },
  ]);

  useEffect(() => {
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
    const shared = localStorage.getItem('sharedDataset');
    if (shared) {
      try {
        const ds: Dataset = JSON.parse(shared);
        ds.comments = ds.comments || [];
        ds.likedBy = ds.likedBy || [];
        ds.likes = ds.likedBy.length;
        if (ds.id && !ds.shareUrl) {
          ds.shareUrl = `${window.location.origin}/idea/${ds.id}`;
        }
        setDatasets((prev) => [ds, ...prev]);
        setSelected(0);
      } catch {}
      localStorage.removeItem('sharedDataset');
    }
  }, []);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const q = query(
          collection(db, 'budgets'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snap = await getDocs(q);
        type FirestoreBudget = {
          name: string;
          description?: string;
          revenue: string;
          expenditure: string;
        };
        const arr: Dataset[] = await Promise.all(
          snap.docs.map(async (d) => {
            const data = d.data() as FirestoreBudget;
            const commentsSnap = await getDocs(
              query(
                collection(db, 'comments'),
                where('budgetId', '==', d.id),
                orderBy('createdAt', 'asc')
              )
            );
            const likesSnap = await getDocs(
              query(collection(db, 'likes'), where('budgetId', '==', d.id))
            );
            const comments: Comment[] = commentsSnap.docs.map((c) => ({
              username: c.data().username as string,
              text: c.data().text as string,
            }));
            const likedBy = likesSnap.docs.map((l) => l.data().userId as string);
            return {
              id: d.id,
              name: data.name,
              description: data.description,
              revenue: JSON.parse(data.revenue),
              expenditure: JSON.parse(data.expenditure),
              shareUrl: `${window.location.origin}/idea/${d.id}`,
              comments,
              likedBy,
              likes: likedBy.length,
            };
          })
        );
        setCommunity(arr);
      } catch {
        // ignore
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
  const hasShared = datasets[0]?.id !== undefined;

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
      router.replace('/');
    }
  }, [selected, datasets, router]);

  useEffect(() => {
    setUsername(user?.displayName || '');
  }, [user]);

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

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    if (!user) {
      window.open('/login', '_blank');
      return;
    }
    const comment: Comment = {
      username: user.displayName || '名無し',
      text: commentText.trim(),
    };
    setDatasets((prev) => {
      const updated = [...prev];
      const ds = { ...updated[selected] };
      ds.comments = ds.comments ? [...ds.comments, comment] : [comment];
      updated[selected] = ds;
      return updated;
    });
    if (datasets[selected].id) {
      const id = datasets[selected].id;
      try {
        await addDoc(collection(db, 'comments'), {
          budgetId: id,
          userId: user.uid,
          username: comment.username,
          text: comment.text,
          createdAt: serverTimestamp(),
        });
      } catch {
        // ignore
      }
    }
    setCommentText('');
  };

  const handleLike = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    const uid = user.uid;
    const cur = datasets[selected];
    const already = cur.likedBy?.includes(uid);
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
    if (cur.id) {
      const id = cur.id;
      try {
        const likeQuery = query(
          collection(db, 'likes'),
          where('budgetId', '==', id),
          where('userId', '==', uid)
        );
        const likeSnap = await getDocs(likeQuery);
        if (likeSnap.empty) {
          await addDoc(collection(db, 'likes'), {
            budgetId: id,
            userId: uid,
            createdAt: serverTimestamp(),
          });
        } else {
          await deleteDoc(likeSnap.docs[0].ref);
        }
      } catch {
        // ignore
      }
    }
  };

  const [saveName, setSaveName] = useState('');
  const [saveDesc, setSaveDesc] = useState('');
  const [username, setUsername] = useState('');
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
        const docRef = await addDoc(collection(db, 'budgets'), {
          userId: user.uid,
          name,
          description,
          revenue: JSON.stringify(current.revenue),
          expenditure: JSON.stringify(current.expenditure),
          createdAt: serverTimestamp(),
        });
        newDs.id = docRef.id;
        const url = `${window.location.origin}/idea/${docRef.id}`;
        newDs.shareUrl = url;
        await navigator.clipboard.writeText(url);
        toast({ description: '共有リンクをコピーしました', status: 'success' });
      } catch {
        toast({ description: '保存に失敗しました', status: 'error' });
        return;
      }
    } else {
      const stored = localStorage.getItem('savedDatasets');
      const arr = stored ? JSON.parse(stored) : [];
      arr.push(newDs);
      localStorage.setItem('savedDatasets', JSON.stringify(arr));
    }
    setDatasets((prev) => {
      const updated = [...prev];
      updated[selected] = newDs;
      return updated;
    });
  };

  const copyLink = () => {
    const ds = datasets[selected];
    const url =
      ds.shareUrl || (ds.id ? `${window.location.origin}/idea/${ds.id}` : null);
    if (url) {
      navigator.clipboard.writeText(url);
      toast({ description: '共有リンクをコピーしました', status: 'success' });
    } else {
      toast({ description: 'まず保存してください', status: 'info' });
    }
  };

  const shareTwitter = () => {
    const ds = datasets[selected];
    const url =
      ds.shareUrl || (ds.id ? `${window.location.origin}/idea/${ds.id}` : null);
    if (url) {
      const tweet = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
      window.open(tweet, '_blank');
    } else {
      toast({ description: 'まず保存してください', status: 'info' });
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
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const isMobile = useBreakpointValue({ base: true, md: false });

  const SidebarContent = ({ onSelect }: { onSelect?: () => void }) => (
    <Box
      w={{ base: 'full', lg: 60 }}
      p={4}
      borderRightWidth='1px'
      bg='gray.50'
      _dark={{ bg: 'gray.800' }}
      minH='100vh'
    >
      <Heading size='sm' mb={2}>
        オリジナル
      </Heading>
      <Stack spacing={2}>
        {datasets
          .slice(hasShared ? 1 : 0, hasShared ? 2 : 1)
          .map((d, i) => {
            const index = i + (hasShared ? 1 : 0);
            return (
              <Button
                key={index}
                variant={selected === index ? 'solid' : 'ghost'}
                colorScheme='blue'
                justifyContent='flex-start'
                textAlign='left'
                whiteSpace='normal'
                onClick={() => {
                  setSelected(index);
                  if (onSelect) onSelect();
                }}
              >
                <Box>
                  <Text>{d.name}</Text>
                  {d.description && (
                    <Text fontSize='xs' color='gray.500'>
                      {d.description}
                    </Text>
                  )}
                </Box>
              </Button>
            );
          })}
      </Stack>
      {hasShared && (
        <>
          <Heading size='sm' mt={6} mb={2}>
            今表示している予算案
          </Heading>
          <Stack spacing={2}>
            <Button
              variant={selected === 0 ? 'solid' : 'ghost'}
              colorScheme='blue'
              justifyContent='flex-start'
              textAlign='left'
              whiteSpace='normal'
              onClick={() => {
                setSelected(0);
                if (onSelect) onSelect();
              }}
            >
              <Box>
                <Text>{datasets[0].name}</Text>
                {datasets[0].description && (
                  <Text fontSize='xs' color='gray.500'>
                    {datasets[0].description}
                  </Text>
                )}
              </Box>
            </Button>
          </Stack>
        </>
      )}
      {community.length > 0 && (
        <>
          <Heading size='sm' mt={6} mb={2}>
            みんなの予算案
          </Heading>
          <Stack spacing={2}>
            {community.map((d, i) => (
              <Button
                key={`c-${i}`}
                variant='ghost'
                justifyContent='flex-start'
                textAlign='left'
                whiteSpace='normal'
                onClick={() => {
                  setDatasets((prev) => [...prev, d]);
                  setSelected(datasets.length);
                  if (onSelect) onSelect();
                }}
              >
                <Box>
                  <Text>{d.name}</Text>
                  {d.description && (
                    <Text fontSize='xs' color='gray.500'>
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

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Flex flex="1">
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
                onClick={openDrawer}
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
            {user ? (
              <Menu>
                <MenuButton as={IconButton} icon={<Avatar size="sm" src={user.photoURL || undefined} />} variant="outline" />
                <MenuList>
                  <MenuItem onClick={openProfile}>プロフィール設定</MenuItem>
                  <MenuItem onClick={logout}>ログアウト</MenuItem>
                </MenuList>
              </Menu>
            ) : isMobile ? (
              <IconButton
                aria-label="ログイン"
                icon={<FaSignInAlt />}
                variant="outline"
                onClick={() => window.open('/login', '_blank')}
              />
            ) : (
              <Button leftIcon={<FaSignInAlt />} onClick={() => window.open('/login', '_blank')}>
                ログイン
              </Button>
            )}
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
          <Button
            onClick={() => {
              if (!user) {
                window.open('/login', '_blank');
                return;
              }
              setSaveName('');
              setSaveDesc('');
              openSave();
            }}
            colorScheme="green"
            variant="outline"
          >
            保存
          </Button>
          <Button onClick={shareTwitter} colorScheme="twitter" variant="outline">
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
          <Heading size="sm" mb={2}>コメント</Heading>
          <Stack spacing={2} maxH="40" overflowY="auto">
            {current.comments?.map((c, i) => (
              <Box key={i} p={2} borderWidth="1px" borderRadius="md" bg="white" _dark={{ bg: 'gray.700' }}>
                <Text fontWeight="bold" fontSize="sm">
                  {c.username}
                </Text>
                <Text fontSize="sm">{c.text}</Text>
              </Box>
            ))}
          </Stack>
          <Flex mt={2} gap={2}>
            <Input flex="1" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="コメントを入力" />
            <Button onClick={handleAddComment}>投稿</Button>
          </Flex>
        </Box>

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
      <Button
        leftIcon={<FaHeart />}
        variant={user && current.likedBy?.includes(user.uid) ? 'solid' : 'outline'}
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
              <Textarea value={saveDesc} onChange={(e) => setSaveDesc(e.target.value)} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={closeSave}>キャンセル</Button>
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
              <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={closeProfile}>キャンセル</Button>
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

