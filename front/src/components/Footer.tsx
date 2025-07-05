import { Box, Text, Link } from '@chakra-ui/react'

export default function Footer() {
  return (
    <Box as="footer" mt={8} fontSize="sm">
      <Box
        borderTopWidth="1px"
        p={4}
        textAlign="center"
        bg="gray.50"
        _dark={{ bg: "gray.800" }}
      >
        <Text>
          政府の予算書・決算書データベース (
          <Link href="https://www.bb.mof.go.jp/hdocs/bxsselect.html" isExternal>
            https://www.bb.mof.go.jp/hdocs/bxsselect.html
          </Link>
          ) をもとに,
          <Link href="https://taniii.com" isExternal>
            {' '}Taniii
          </Link>
          {' '}が作成
        </Text>
      </Box>
      <Box
        borderTopWidth="1px"
        p={3}
        textAlign="center"
        bg="gray.100"
        _dark={{ bg: "gray.700" }}
      >
        <Text>
          ©{' '}
          <Link href="https://taniii.com" isExternal>
            Taniii
          </Link>{' '}
          <Link href="https://x.com/taniiicom" isExternal>
            @taniiicom
          </Link>
        </Text>
      </Box>
    </Box>
  )
}
