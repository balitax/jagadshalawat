"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  type: "sholawat" | "dzikir" | "event" | "meeting";
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function calcCountdown(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function ScheduleBanner() {
  const [schedule, setSchedule] = useState<ScheduleItem | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/schedules", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const upcoming = d.schedules || [];
        if (upcoming.length > 0) setSchedule(upcoming[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!schedule) return;
    const target = new Date(schedule.date + (schedule.time ? "T" + schedule.time : "T00:00:00"));
    setCountdown(calcCountdown(target));
    const timer = setInterval(() => setCountdown(calcCountdown(target)), 1000);
    return () => clearInterval(timer);
  }, [schedule]);

  if (loading || !schedule) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="border-b border-gold/10 bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5">
      <div className="shell flex flex-wrap items-center justify-between gap-3 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-js opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-js" />
          </span>
          <span className="truncate text-xs font-medium text-parchment-2 sm:text-sm">
            <span className="text-gold-2 font-semibold">Berikutnya:</span>{" "}
            {schedule.title}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-parchment-3">
            <Calendar className="h-3.5 w-3.5 text-gold-2" />
            <span className="hidden sm:inline">{formatDisplayDate(schedule.date)}</span>
            {schedule.time && (
              <>
                <Clock className="h-3.5 w-3.5 text-gold-2 ml-2" />
                <span>{schedule.time}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            {countdown.days > 0 && (
              <span className="rounded bg-gold/15 px-1.5 py-0.5 font-bold text-gold-2">
                {countdown.days}h
              </span>
            )}
            <span className="rounded bg-gold/15 px-1.5 py-0.5 font-bold text-gold-2">
              {pad(countdown.hours)}
            </span>
            <span className="text-parchment-3">:</span>
            <span className="rounded bg-gold/15 px-1.5 py-0.5 font-bold text-gold-2">
              {pad(countdown.minutes)}
            </span>
            <span className="text-parchment-3">:</span>
            <span className="rounded bg-gold/15 px-1.5 py-0.5 font-bold text-gold-2">
              {pad(countdown.seconds)}
            </span>
          </div>

          <Link
            href="/jadwal"
            className="hidden items-center gap-1 text-xs font-semibold text-gold-2 transition hover:text-gold sm:inline-flex"
          >
            Lihat <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
