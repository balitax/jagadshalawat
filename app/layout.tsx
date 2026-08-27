import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Amiri } from "next/font/google";
import "./globals.css";
import { RevealObserver } from "@/components/RevealObserver";
import { DevServiceWorkerCleanup } from "@/components/DevServiceWorkerCleanup";
import { ThemeProvider } from "@/components/ThemeProvider";

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

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Jagad Shalawat — Komunitas Dzikir & Shalawat",
  description:
    "Komunitas dzikir dan shalawat Jagad Shalawat. Jadwal kegiatan, donasi, artikel, dan dokumentasi kegiatan komunitas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-theme="dark"
      suppressHydrationWarning
      className={`${cormorant.variable} ${inter.variable} ${amiri.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-parchment">
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'dark')`,
          }}
        />
        {process.env.NODE_ENV === "development" && <DevServiceWorkerCleanup />}
        <RevealObserver />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
