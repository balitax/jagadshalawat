import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { DonationForm } from "@/components/DonationForm";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Donasi — Jagad Shalawat",
  description: "Salurkan donasi anda ke Jagad Shalawat melalui transfer bank, e-money, atau virtual account.",
};

export default function DonasiPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <DonationForm />
      </main>
      <Footer />
    </>
  );
}
