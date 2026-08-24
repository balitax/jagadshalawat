import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JadwalClient } from "./client";

export const metadata: Metadata = {
  title: "Jadwal Kegiatan — Jagad Shalawat",
  description:
    "Daftar lengkap jadwal sholawat, dzikir, event, dan kegiatan komunitas Jagad Shalawat.",
};

export default function JadwalPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-20 sm:py-28">
        <JadwalClient />
      </main>
      <Footer />
    </>
  );
}
