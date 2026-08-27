import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { QuranClient } from "./client";

export const metadata: Metadata = {
  title: "Al-Quran — Jagad Shalawat",
  description: "Baca Al-Quran digital dengan terjemahan bahasa Indonesia.",
};

export default function QuranPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-20 sm:py-28">
        <QuranClient />
      </main>
      <Footer />
    </>
  );
}
