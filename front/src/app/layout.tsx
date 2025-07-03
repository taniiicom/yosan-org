import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { ColorModeScript } from "@chakra-ui/react";


export const metadata: Metadata = {
  title: "令和7年度 国家予算可視化システム",
  description:
    "日本の国家予算をインタラクティブな円グラフで探索できる可視化システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <ColorModeScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
