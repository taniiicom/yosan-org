import {
  Box,
  Text,
  Link,
  Flex,
  Image,
  SimpleGrid,
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
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Box>
            <Text fontWeight="bold" mb={1}>
              あとがき
            </Text>
            <Text fontSize="sm">
              私たちは，自分自身の月の収入や支出，「食費にいくら使っているか」とかを大体把握していると思います. しかし, 国の収入と支出はどうでしょうか?
            </Text>
          </Box>
          <Box textAlign={{ base: "center", md: "right" }}>
            <Text fontSize="sm" mb={2}>
              designed by
            </Text>
            <Box
              bg="white"
              borderWidth="1px"
              borderRadius="md"
              p={3}
            >
              <Flex align="center" gap={3}>
                <Image
                  src="https://taniii.com/img/icon/taniiicom_icon.jpeg"
                  alt="Taniii"
                  boxSize="48px"
                  borderRadius="full"
                />
                <Box textAlign="left">
                  <Text fontWeight="bold">Taniii</Text>
                  <Flex gap={2} my={1}>
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
                  <Text fontSize="xs" color="gray.500">
                    Concept Designer ・ Freelance Web Developer
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Box>
        </SimpleGrid>
        <Text mt={4} textAlign="center">
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
