"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

interface ScheduleItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  type: "sholawat" | "dzikir" | "event" | "meeting";
  status: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  sholawat: { label: "Sholawat", color: "border-gold/30 bg-gold/10 text-gold-2", dot: "bg-gold" },
  dzikir: { label: "Dzikir", color: "border-emerald-js/30 bg-emerald-js/10 text-emerald-300", dot: "bg-emerald-js" },
  event: { label: "Event", color: "border-purple-500/30 bg-purple-500/10 text-purple-300", dot: "bg-purple-500" },
  meeting: { label: "Meeting", color: "border-blue-500/30 bg-blue-500/10 text-blue-300", dot: "bg-blue-500" },
};

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function UpcomingSchedule() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/schedules", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSchedules(d.schedules || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || schedules.length === 0) return null;

  return (
    <section id="jadwal" className="relative scroll-mt-24">
      <div className="py-20 sm:py-28">
        <SectionHeader
          eyebrow="Jadwal Kegiatan"
          title="Bersama"
          highlight="Berkumpul"
          subtitle="Jadwal sholawat, dzikir, dan kegiatan komunitas yang akan datang."
        />

        <div className="reveal-stagger mx-auto mt-12 grid max-w-6xl gap-5 px-5 sm:grid-cols-2 lg:grid-cols-3">
          {schedules.map((s) => {
            const config = TYPE_CONFIG[s.type] || TYPE_CONFIG.sholawat;
            return (
              <div
                key={s.id}
                className="glass card-lift group rounded-2xl p-6 transition"
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${config.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-xl font-bold text-parchment group-hover:text-gold-2 transition-colors">
                  {s.title}
                </h3>

                {s.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-parchment-2">
                    {s.description}
                  </p>
                )}

                <div className="mt-4 space-y-2 border-t border-gold/10 pt-4">
                  <div className="flex items-center gap-2.5 text-sm text-parchment-2">
                    <Calendar className="h-4 w-4 shrink-0 text-gold-2" />
                    {formatDisplayDate(s.date)}
                  </div>
                  {s.time && (
                    <div className="flex items-center gap-2.5 text-sm text-parchment-2">
                      <Clock className="h-4 w-4 shrink-0 text-gold-2" />
                      {s.time}
                    </div>
                  )}
                  {s.location && (
                    <div className="flex items-center gap-2.5 text-sm text-parchment-2">
                      <MapPin className="h-4 w-4 shrink-0 text-gold-2" />
                      {s.location}
                    </div>
                  )}
                </div>

                <Link
                  href="/jadwal"
                  className="mt-4 flex items-center gap-1 text-xs font-medium text-gold-2 opacity-0 transition group-hover:opacity-100"
                >
                  Lihat detail <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            );
          })}
        </div>

        <div className="reveal mx-auto mt-10 flex justify-center px-5">
          <Link
            href="/jadwal"
            className="group inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.04] px-6 py-3 text-sm font-semibold text-parchment backdrop-blur-sm transition hover:border-gold/50 hover:bg-gold/10 hover:text-gold-2"
          >
            Lihat semua jadwal
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
