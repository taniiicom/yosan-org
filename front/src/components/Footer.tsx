import { Box, Text, Link } from '@chakra-ui/react'

export default function Footer() {
  return (
    <Box as="footer" borderTopWidth="1px" mt={8} p={4} textAlign="center" fontSize="sm">
      <Text>
        予算書・決算書データベース (
        <Link href="https://www.bb.mof.go.jp/hdocs/bxsselect.html" isExternal>
          https://www.bb.mof.go.jp/hdocs/bxsselect.html
        </Link>
        ) をもとに,{' '}
        <Link href="https://taniii.com" isExternal>
          Taniii
        </Link>{' '}
        が作成
      </Text>
      <Text mt={2}>
        ©{' '}
        <Link href="https://taniii.com" isExternal>
          Taniii
        </Link>{' '}
        <Link href="https://x.com/taniiicom" isExternal>
          @taniiicom
        </Link>
      </Text>
    </Box>
  )
}
