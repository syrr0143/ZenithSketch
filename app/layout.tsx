import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Room } from "./Room";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ZenithSketch - Creativity at its peak",
  description: "A creative application using fabric.js and liveblocks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Room>
          {children}
        </Room>
      </body>
    </html>
  );
}
