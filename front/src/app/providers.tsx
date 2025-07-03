'use client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({ config: { initialColorMode: 'light', useSystemColorMode: true } });

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}
