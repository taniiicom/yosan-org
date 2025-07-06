import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Comment {
  username: string;
  text: string;
}

export interface Dataset {
  id?: string;
  name: string;
  description?: string;
  revenue: Record<string, unknown>;
  expenditure: Record<string, unknown>;
  shareUrl?: string;
  comments?: Comment[];
  likedBy?: string[];
  likes?: number;
  createdAt?: { seconds: number } | number;
}

export interface FirestoreBudget {
  name: string;
  description?: string;
  revenue: string;
  expenditure: string;
  userId: string;
  createdAt: { seconds: number } | number;
}

export interface FirestoreComment {
  budgetId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: { seconds: number } | number;
}

export interface FirestoreLike {
  budgetId: string;
  userId: string;
  createdAt: { seconds: number } | number;
}

// Budget operations
export const saveBudget = async (
  userId: string,
  name: string,
  description: string,
  revenue: Record<string, unknown>,
  expenditure: Record<string, unknown>
): Promise<string> => {
  const docRef = await addDoc(collection(db, "budgets"), {
    userId,
    name,
    description,
    revenue: JSON.stringify(revenue),
    expenditure: JSON.stringify(expenditure),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getBudget = async (budgetId: string): Promise<Dataset | null> => {
  try {
    const snap = await getDoc(doc(db, "budgets", budgetId));
    if (!snap.exists()) return null;

    const data = snap.data() as FirestoreBudget;
    const [comments, likes] = await Promise.all([
      getComments(budgetId),
      getLikes(budgetId),
    ]);

    return {
      id: budgetId,
      name: data.name,
      description: data.description,
      revenue: JSON.parse(data.revenue),
      expenditure: JSON.parse(data.expenditure),
      comments,
      likedBy: likes.map((like) => like.userId),
      likes: likes.length,
      shareUrl: `${window.location.origin}/idea/${budgetId}`,
    };
  } catch (error) {
    console.error("Error getting budget:", error);
    return null;
  }
};

export const getCommunityBudgets = async (): Promise<Dataset[]> => {
  try {
    const snap = await getDocs(collection(db, "budgets"));

    const budgets = await Promise.all(
      snap.docs.map(async (doc) => {
        const data = doc.data() as FirestoreBudget;
        const [comments, likes] = await Promise.all([
          getComments(doc.id),
          getLikes(doc.id),
        ]);

        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          revenue: JSON.parse(data.revenue),
          expenditure: JSON.parse(data.expenditure),
          comments,
          likedBy: likes.map((like) => like.userId),
          likes: likes.length,
          shareUrl: `${window.location.origin}/idea/${doc.id}`,
          createdAt: data.createdAt,
        };
      })
    );

    // Sort on client side by createdAt (newest first)
    budgets.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      const aTime =
        typeof a.createdAt === "object" && "seconds" in a.createdAt
          ? a.createdAt.seconds
          : (a.createdAt as number);
      const bTime =
        typeof b.createdAt === "object" && "seconds" in b.createdAt
          ? b.createdAt.seconds
          : (b.createdAt as number);
      return bTime - aTime; // Descending order (newest first)
    });

    return budgets.slice(0, 20); // Limit to 20 results
  } catch (error) {
    console.error("Error getting community budgets:", error);
    return [];
  }
};

// Comment operations
export const addComment = async (
  budgetId: string,
  userId: string,
  username: string,
  text: string
): Promise<void> => {
  await addDoc(collection(db, "comments"), {
    budgetId,
    userId,
    username,
    text,
    createdAt: serverTimestamp(),
  });
};

export const getComments = async (budgetId: string): Promise<Comment[]> => {
  try {
    const q = query(
      collection(db, "comments"),
      where("budgetId", "==", budgetId)
    );
    const snap = await getDocs(q);
    const comments = snap.docs.map((doc) => {
      const data = doc.data() as FirestoreComment;
      return {
        username: data.username,
        text: data.text,
        createdAt: data.createdAt,
      };
    });
    // Sort on client side to avoid index requirement
    comments.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      // Handle both Timestamp and seconds-based objects
      const aTime =
        typeof a.createdAt === "object" && "seconds" in a.createdAt
          ? a.createdAt.seconds
          : (a.createdAt as number);
      const bTime =
        typeof b.createdAt === "object" && "seconds" in b.createdAt
          ? b.createdAt.seconds
          : (b.createdAt as number);
      return aTime - bTime;
    });
    return comments.map(({ username, text }) => ({ username, text }));
  } catch (error) {
    console.error("Error getting comments:", error);
    return [];
  }
};

// Like operations
export const addLike = async (
  budgetId: string,
  userId: string
): Promise<void> => {
  await addDoc(collection(db, "likes"), {
    budgetId,
    userId,
    createdAt: serverTimestamp(),
  });
};

export const removeLike = async (
  budgetId: string,
  userId: string
): Promise<void> => {
  const q = query(
    collection(db, "likes"),
    where("budgetId", "==", budgetId),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);

  if (!snap.empty) {
    await deleteDoc(snap.docs[0].ref);
  }
};

export const getLikes = async (budgetId: string): Promise<FirestoreLike[]> => {
  try {
    const q = query(collection(db, "likes"), where("budgetId", "==", budgetId));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => doc.data() as FirestoreLike);
  } catch (error) {
    console.error("Error getting likes:", error);
    return [];
  }
};

export const toggleLike = async (
  budgetId: string,
  userId: string
): Promise<boolean> => {
  try {
    const q = query(
      collection(db, "likes"),
      where("budgetId", "==", budgetId),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      // Add like
      await addLike(budgetId, userId);
      return true; // liked
    } else {
      // Remove like
      await deleteDoc(snap.docs[0].ref);
      return false; // unliked
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};
