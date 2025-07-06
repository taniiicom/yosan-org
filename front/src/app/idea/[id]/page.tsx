'use client'

import Home from '../../page'
import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
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
        const dataset = {
          name: d.name,
          description: d.description,
          revenue: JSON.parse(d.revenue),
          expenditure: JSON.parse(d.expenditure),
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
