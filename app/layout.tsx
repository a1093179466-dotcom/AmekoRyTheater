import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AmekoRyTheater",
  description: "Personal Creation Theater",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        {modal}
      </body>
    </html>
  );
}