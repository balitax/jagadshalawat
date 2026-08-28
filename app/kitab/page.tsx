import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { KitabClient } from "./client";

export const metadata: Metadata = {
  title: "Kitab Kuning — Jagad Shalawat",
  description:
    "Kumpulan kitab kuning klasik Islam dengan teks arab dan terjemahan bahasa Indonesia.",
};

export default function KitabPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-20 sm:py-28">
        <KitabClient />
      </main>
      <Footer />
    </>
  );
}
