"use client";

import Home from "../../page";
import { useEffect, useState, use } from "react";
import { getBudget } from "@/lib/firestore";

interface IdeaPageProps {
  params: Promise<{ id: string }>;
}

export default function IdeaPage({ params }: IdeaPageProps) {
  const { id } = use(params);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const dataset = await getBudget(id);
        if (dataset) {
          localStorage.setItem("sharedDataset", JSON.stringify(dataset));
        }
      } catch (e) {
        console.error("Error loading budget:", e);
      } finally {
        setReady(true);
      }
    };
    load();
  }, [id]);

  return ready ? <Home /> : null;
}
