import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Early Token Detector - Solana + Base Auto-Trading Bot",
  description:
    "Detect early tokens on Solana and Base chains. Auto-trade with SMA, RSI indicators. BYOK security. Rug pull detection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${mono.variable} font-mono bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
