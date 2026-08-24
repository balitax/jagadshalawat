import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GaleriClient } from "./client";

export const metadata: Metadata = {
  title: "Galeri Foto — Jagad Shalawat",
  description:
    "Dokumentasi momen kegiatan sholawat dan dzikir komunitas Jagad Shalawat.",
};

export default function GaleriPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-20 sm:py-28">
        <GaleriClient />
      </main>
      <Footer />
    </>
  );
}
