import { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { CampaignSection } from "@/components/CampaignSection";
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
        <Suspense>
          <DonationForm />
        </Suspense>
        <CampaignSection />
      </main>
      <Footer />
    </>
  );
}
