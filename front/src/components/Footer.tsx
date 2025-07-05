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
            <Text fontSize="sm" whiteSpace="pre-line">
              自分自身の月の収入や支出 (例えば, 「食費にいくら使っているか」とか) はだいたい分かるけど, 国の収入と支出はどうでしょうか?
              {"\n"}
              「何らかの政策をするのに, n 兆円必要」ということだけニュースで言われても, それが『収入全体の何%』で, 『他の予算と比べて, 多いのか・少ないのか』, 『いくら収入を増やすか, 支出を削減すれば実現できるのか』恥ずかしながら私はイメージがつきませんでした.
              {"\n"}
              「支出を節約して減税する」「国債を発行して収入を増やす」「減らせる支出がないから減税できない」... いろんな意見があっていいと思いますが, こういう議論をするとき, 自分自身のお金に関することなら, 家計簿を見たり, 帳簿を見て, 試行錯誤したり, 思案を巡らすはずです.
              {"\n"}
              自分たちの国の予算についても, 自分の払った税金の使い道についても, 一部の人の考えたキャッチフレーズだけで議論するのではなく, みんなが具体的な数字に触れられて, 「ああでもないこうでもない」と試行錯誤して, ボトムアップに集合知を結集できる場所があればいいのにと思い, このサービスを作りました.
            </Text>
          </Box>
          <Box textAlign="left">
            <Text fontSize="sm" mb={2} textAlign="left">
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
