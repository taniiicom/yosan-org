'use client'

import Home from '../../page'
import { useEffect, useState } from 'react'
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function IdeaPage({ params }: any) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'budgets', params.id))
      if (snap.exists()) {
        type FirestoreBudget = {
          name: string
          description?: string
          revenue: string
          expenditure: string
        }
        const d = snap.data() as FirestoreBudget
        const commentsSnap = await getDocs(
          query(
            collection(db, 'comments'),
            where('budgetId', '==', params.id),
            orderBy('createdAt', 'asc')
          )
        )
        const likesSnap = await getDocs(
          query(collection(db, 'likes'), where('budgetId', '==', params.id))
        )
        const comments = commentsSnap.docs.map((c) => ({
          username: c.data().username as string,
          text: c.data().text as string,
        }))
        const likedBy = likesSnap.docs.map((l) => l.data().userId as string)
        const dataset = {
          name: d.name,
          description: d.description,
          revenue: JSON.parse(d.revenue),
          expenditure: JSON.parse(d.expenditure),
          comments,
          likedBy,
          likes: likedBy.length,
          shareUrl: `${window.location.origin}/idea/${params.id}`,
        }
        localStorage.setItem('sharedDataset', JSON.stringify(dataset))
      }
      setReady(true)
    }
    load()
  }, [params.id])
  return ready ? <Home /> : null
}
