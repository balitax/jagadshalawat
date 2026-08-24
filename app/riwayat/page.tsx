import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RiwayatClient } from "./client";

export const metadata: Metadata = {
  title: "Riwayat Donasi — Jagad Shalawat",
  description:
    "Riwayat donasi yang tersalurkan untuk Jagad Shalawat — tercatat transparan dengan penuh amanah.",
};

export default function RiwayatPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-20 sm:py-28">
        <RiwayatClient />
      </main>
      <Footer />
    </>
  );
}
