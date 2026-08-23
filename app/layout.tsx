import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { RevealObserver } from "@/components/RevealObserver";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jagad Shalawat — Kas & Donasi",
  description:
    "Pencatatan kas dan donasi komunitas Jagad Shalawat. Madrasah dan program yang kami kelola bergerak berkat kepercayaan dan dukungan Anda.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-parchment">
        <RevealObserver />
        {children}
      </body>
    </html>
  );
}
