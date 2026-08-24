"use client";

import { useState } from "react";
import {
  FloatingAppButton,
  PrayerIcon,
  CompassIcon,
  CalculatorIcon,
  QuranIcon,
  DuaIcon,
  CalendarIcon,
} from "@/components/FloatingAppButton";

type AppType = "jadwal" | "kiblat" | "zakat" | "quran" | "doa" | "hijriah" | null;

export function FloatingApps() {
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
          onClick={() => toggleApp("quran")}
        />
        <FloatingAppButton
          icon={<CompassIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
          label="Arah Kiblat"
          color="gold"
          onClick={() => toggleApp("kiblat")}
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
      {activeApp === "jadwal" && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100%-3rem)] max-w-sm sm:bottom-28 sm:right-8">
          <div className="rounded-3xl border border-gold/20 bg-ink-2/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PrayerIcon className="h-5 w-5 text-emerald-js" />
                <h3 className="font-display text-lg font-bold text-gradient-gold">
                  Jadwal Sholat
                </h3>
              </div>
              <button
                onClick={() => setActiveApp(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-parchment-3 transition hover:bg-gold/20 hover:text-parchment"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-parchment-2">
              Mini app jadwal sholat akan segera hadir...
            </p>
          </div>
        </div>
      )}

      {/* ─── Arah Kiblat ─── */}
      {activeApp === "kiblat" && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100%-3rem)] max-w-sm sm:bottom-28 sm:right-8">
          <div className="rounded-3xl border border-gold/20 bg-ink-2/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CompassIcon className="h-5 w-5 text-gold" />
                <h3 className="font-display text-lg font-bold text-gradient-gold">
                  Arah Kiblat
                </h3>
              </div>
              <button
                onClick={() => setActiveApp(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-parchment-3 transition hover:bg-gold/20 hover:text-parchment"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-parchment-2">
              Mini app arah kiblat akan segera hadir...
            </p>
          </div>
        </div>
      )}

      {/* ─── Kalkulator Zakat ─── */}
      {activeApp === "zakat" && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100%-3rem)] max-w-sm sm:bottom-28 sm:right-8">
          <div className="rounded-3xl border border-gold/20 bg-ink-2/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalculatorIcon className="h-5 w-5 text-sky-500" />
                <h3 className="font-display text-lg font-bold text-gradient-gold">
                  Kalkulator Zakat
                </h3>
              </div>
              <button
                onClick={() => setActiveApp(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-parchment-3 transition hover:bg-gold/20 hover:text-parchment"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-parchment-2">
              Mini app kalkulator zakat akan segera hadir...
            </p>
          </div>
        </div>
      )}

      {/* ─── Alquran ─── */}
      {activeApp === "quran" && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100%-3rem)] max-w-sm sm:bottom-28 sm:right-8">
          <div className="rounded-3xl border border-gold/20 bg-ink-2/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QuranIcon className="h-5 w-5 text-emerald-js" />
                <h3 className="font-display text-lg font-bold text-gradient-gold">
                  Alquran
                </h3>
              </div>
              <button
                onClick={() => setActiveApp(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-parchment-3 transition hover:bg-gold/20 hover:text-parchment"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-parchment-2">
              Mini app Alquran akan segera hadir...
            </p>
          </div>
        </div>
      )}

      {/* ─── Doa Harian ─── */}
      {activeApp === "doa" && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100%-3rem)] max-w-sm sm:bottom-28 sm:right-8">
          <div className="rounded-3xl border border-gold/20 bg-ink-2/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DuaIcon className="h-5 w-5 text-gold" />
                <h3 className="font-display text-lg font-bold text-gradient-gold">
                  Doa Harian
                </h3>
              </div>
              <button
                onClick={() => setActiveApp(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-parchment-3 transition hover:bg-gold/20 hover:text-parchment"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-parchment-2">
              Mini app doa harian akan segera hadir...
            </p>
          </div>
        </div>
      )}

      {/* ─── Kalender Hijriah ─── */}
      {activeApp === "hijriah" && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100%-3rem)] max-w-sm sm:bottom-28 sm:right-8">
          <div className="rounded-3xl border border-gold/20 bg-ink-2/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-sky-500" />
                <h3 className="font-display text-lg font-bold text-gradient-gold">
                  Kalender Hijriah
                </h3>
              </div>
              <button
                onClick={() => setActiveApp(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/10 text-parchment-3 transition hover:bg-gold/20 hover:text-parchment"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-parchment-2">
              Mini app kalender hijriah akan segera hadir...
            </p>
          </div>
        </div>
      )}
    </>
  );
}
