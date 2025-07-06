import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "国家予算シミュレータ yosan.org",
  description:
    "日本の国家予算をインタラクティブに可視化し, 自由に編集しながら試行錯誤し, 自分の考えた予算案をシェアできます",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
