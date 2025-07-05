import {
  Box,
  Text,
  Link,
  Flex,
  Image,
  Stack,
} from '@chakra-ui/react'
import { FaTwitter, FaGithub, FaInstagram } from 'react-icons/fa'

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
        p={4}
        bg="#faf7f3"
        _dark={{ bg: "gray.700" }}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          gap={4}
        >
          <Box flex="1">
            <Text fontWeight="bold" mb={1}>
              あとがき
            </Text>
            <Text fontSize="sm">
              私たちは，自分自身の月の収入や支出，「食費にいくら使っているか」とかを大体把握していると思います. しかし, 国の収入と支出はどうでしょうか?
            </Text>
          </Box>
          <Box textAlign={{ base: "center", md: "right" }} flexShrink={0}>
            <Text fontSize="sm" mb={2}>
              designed by
            </Text>
            <Box
              borderWidth="1px"
              borderRadius="md"
              p={3}
              w={{ base: "full", md: "12rem" }}
            >
              <Stack spacing={2} align="center">
                <Image
                  src="https://taniii.com/img/icon/taniiicom_icon.jpeg"
                  alt="Taniii"
                  boxSize="48px"
                  borderRadius="full"
                />
                <Text fontWeight="bold">Taniii</Text>
                <Flex gap={2}>
                  <Link href="https://x.com/taniiicom" isExternal>
                    <FaTwitter />
                  </Link>
                  <Link href="https://github.com/taniiicom" isExternal>
                    <FaGithub />
                  </Link>
                  <Link href="https://www.instagram.com/taniiicom" isExternal>
                    <FaInstagram />
                  </Link>
                </Flex>
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  Concept Designer ・ Freelance Web Developer
                </Text>
              </Stack>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  )
}
