import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { PaymentMethods } from "@/components/PaymentMethods";
import { DonationForm } from "@/components/DonationForm";
import { DonationHistory } from "@/components/DonationHistory";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <PaymentMethods />
        <DonationForm />
        <DonationHistory />
      </main>
      <Footer />
    </>
  );
}
