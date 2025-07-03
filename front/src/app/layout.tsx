import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
