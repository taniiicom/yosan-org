'use client'

import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { AuthProvider } from '@/lib/auth'

// Create a theme with consistent initial color mode
const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider 
      theme={theme} 
      resetCSS 
      toastOptions={{ defaultOptions: { position: 'bottom' } }}
      portalZIndex={40}
    >
      <AuthProvider>{children}</AuthProvider>
    </ChakraProvider>
  );
}
