'use client'

import { useAuth } from '@/lib/auth';
import { Box, Button, Stack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, loginGoogle, loginTwitter } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push('/');
  }, [user, router]);

  return (
    <Box p={6} textAlign="center">
      <Stack spacing={4} maxW="sm" mx="auto">
        <Button colorScheme="blue" onClick={loginGoogle}>
          Googleでログイン
        </Button>
        <Button colorScheme="twitter" onClick={loginTwitter}>
          Twitterでログイン
        </Button>
      </Stack>
    </Box>
  );
}
