import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { DonationHistory } from "@/components/DonationHistory";
import { UpcomingSchedule } from "@/components/UpcomingSchedule";
import { LatestArticles } from "@/components/LatestArticles";
import { PhotoGallery } from "@/components/PhotoGallery";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <UpcomingSchedule />
        <DonationHistory />
        <LatestArticles />
        <PhotoGallery />
      </main>
      <Footer />
    </>
  );
}
