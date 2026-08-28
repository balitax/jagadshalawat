import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { KitabReader } from "./client";

export const metadata: Metadata = {
  title: "Kitab Kuning — Jagad Shalawat",
  description: "Baca kitab kuning dengan teks arab dan terjemahan bahasa Indonesia.",
};

export default function KitabDetailPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <KitabReader />
      </main>
      <Footer />
    </>
  );
}
