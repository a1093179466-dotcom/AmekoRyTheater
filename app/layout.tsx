import type { Metadata } from "next";
import FeedbackProvider from "@/components/FeedbackProvider";
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
        <FeedbackProvider>
          {children}
          {modal}
        </FeedbackProvider>
      </body>
    </html>
  );
}