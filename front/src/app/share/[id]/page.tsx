'use client'

import dynamic from 'next/dynamic';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Box, Heading, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const BudgetChart = dynamic(() => import('@/components/BudgetChart'), {
  ssr: false,
});

interface SharedDataset {
  name: string;
  description: string;
  revenue: Record<string, unknown>;
  expenditure: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SharePage({ params }: { params: { id: string } } & any) {
  const [data, setData] = useState<SharedDataset | null>(null);

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'budgets', params.id));
      if (snap.exists()) {
        type FirestoreBudget = { name: string; description: string; revenue: string; expenditure: string };
        const d = snap.data() as FirestoreBudget;
        setData({
          name: d.name,
          description: d.description,
          revenue: JSON.parse(d.revenue),
          expenditure: JSON.parse(d.expenditure),
        });
      }
    };
    load();
  }, [params.id]);

  if (!data) return <Box p={10}>Loading...</Box>;

  return (
    <Box p={6} maxW="4xl" mx="auto">
      <Heading mb={2}>{data.name}</Heading>
      {data.description && <Text mb={4}>{data.description}</Text>}
      <BudgetChart title="歳入" data={data.revenue} />
      <BudgetChart title="歳出" data={data.expenditure} />
      <Box mt={6}>
        <Link href="/">トップへ戻る</Link>
      </Box>
    </Box>
  );
}
