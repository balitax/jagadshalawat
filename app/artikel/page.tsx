import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArtikelClient } from "./client";

export const metadata: Metadata = {
  title: "Artikel & Pengumuman — Jagad Shalawat",
  description:
    "Kabar terkini seputar kegiatan dan informasi komunitas Jagad Shalawat.",
};

export default function ArtikelPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 py-20 sm:py-28">
        <ArtikelClient />
      </main>
      <Footer />
    </>
  );
}
