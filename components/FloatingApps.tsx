"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FloatingAppButton,
  PrayerIcon,
  CalculatorIcon,
  QuranIcon,
  KitabIcon,
  DuaIcon,
  CalendarIcon,
} from "@/components/FloatingAppButton";
import { HijriCalendar } from "@/components/HijriCalendar";
import { DoaHarian } from "@/components/DoaHarian";
import { ZakatCalculator } from "@/components/ZakatCalculator";
import { JadwalSholat } from "@/components/JadwalSholat";

type AppType = "jadwal" | "zakat" | "doa" | "hijriah" | null;

export function FloatingApps() {
  const router = useRouter();
  const [activeApp, setActiveApp] = useState<AppType>(null);

  const toggleApp = (app: AppType) => {
    setActiveApp((prev) => (prev === app ? null : app));
  };

  return (
    <>
      {/* Floating Buttons — stacked vertically */}
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-3 sm:bottom-8 sm:right-8">
        <FloatingAppButton
          icon={<CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Kalender Hijriah"
          color="blue"
          onClick={() => toggleApp("hijriah")}
        />
        <FloatingAppButton
          icon={<DuaIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Doa Harian"
          color="gold"
          onClick={() => toggleApp("doa")}
        />
        <FloatingAppButton
          icon={<QuranIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Alquran"
          color="emerald"
          onClick={() => router.push("/quran")}
        />
        <FloatingAppButton
          icon={<KitabIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Kitab Kuning"
          color="gold"
          onClick={() => router.push("/kitab")}
        />

        <FloatingAppButton
          icon={<CalculatorIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Kalkulator Zakat"
          color="blue"
          onClick={() => toggleApp("zakat")}
        />
        <FloatingAppButton
          icon={<PrayerIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Jadwal Sholat"
          color="emerald"
          onClick={() => toggleApp("jadwal")}
        />
      </div>

      {/* Backdrop */}
      {activeApp && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm transition-opacity"
          onClick={() => setActiveApp(null)}
        />
      )}

      {/* ─── Jadwal Sholat ─── */}
      <JadwalSholat
        isOpen={activeApp === "jadwal"}
        onClose={() => setActiveApp(null)}
      />



      {/* ─── Kalkulator Zakat ─── */}
      <ZakatCalculator
        isOpen={activeApp === "zakat"}
        onClose={() => setActiveApp(null)}
      />

      {/* ─── Doa Harian ─── */}
      <DoaHarian isOpen={activeApp === "doa"} onClose={() => setActiveApp(null)} />

      {/* ─── Kalender Hijriah ─── */}
      <HijriCalendar
        isOpen={activeApp === "hijriah"}
        onClose={() => setActiveApp(null)}
      />
    </>
  );
}
