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
        <Button
          bg="#DB4437"
          color="white"
          _hover={{ bg: '#c23321' }}
          onClick={loginGoogle}
        >
          Googleでログイン
        </Button>
        <Button
          bg="#1DA1F2"
          color="white"
          _hover={{ bg: '#0d95e8' }}
          onClick={loginTwitter}
        >
          Twitterでログイン
        </Button>
        <Box fontSize="sm" color="gray.600">
          `Twitter でログイン` ができない場合は, 同じメールアドレスで過去に `Google
          でログイン` をしたことがある可能性があります. `Google でログイン` を
          試してみてください.
        </Box>
      </Stack>
    </Box>
  );
}
