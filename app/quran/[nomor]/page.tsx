import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { QuranReader } from "./client";

export const metadata: Metadata = {
  title: "Al-Quran — Jagad Shalawat",
  description: "Baca Al-Quran digital dengan terjemahan bahasa Indonesia.",
};

export default function SurahPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <QuranReader />
      </main>
      <Footer />
    </>
  );
}
