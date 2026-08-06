import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? "http";
  const baseUrl = new URL(`${protocol}://${host}`);
  const title = "MemePop | 中文笑点实验室";
  const description = "从中文互联网文化信号里提炼笑点，由 AI 原创改写并经过双重审稿的中文笑话流。";
  const socialImage = new URL("/og-v2.png", baseUrl).toString();

  return {
    metadataBase: baseUrl,
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: baseUrl,
      locale: "zh_CN",
      images: [{ url: socialImage, width: 1731, height: 909, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage]
    }
  };
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
