import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { ColorModeScript } from '@chakra-ui/react'

export const metadata: Metadata = {
  title: "国家予算シミュレータ yosan.org",
  description:
    "日本の国家予算をインタラクティブに可視化し, 自由に編集しながら試行錯誤し, 自分の考えた予算案をシェアできます",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ColorModeScript initialColorMode='light' />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
