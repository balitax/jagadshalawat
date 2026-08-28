"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Megaphone,
  FileText,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Heart,
} from "lucide-react";
import { formatDate, formatRupiah } from "@/lib/format";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverUrl: string | null;
  category: "artikel" | "pengumuman";
  author: string | null;
  createdAt: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  time: string | null;
  location: string | null;
  type: "sholawat" | "dzikir" | "event" | "meeting";
}

interface DonationStats {
  total: number;
  count: number;
}

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; dot: string; label: string }> = {
  pengumuman: { icon: Megaphone, color: "border-blue-500/30 bg-blue-500/10 text-blue-300", dot: "bg-blue-500", label: "Pengumuman" },
  artikel: { icon: FileText, color: "border-gold/30 bg-gold/10 text-gold-2", dot: "bg-gold", label: "Artikel" },
};

const TYPE_COLORS: Record<string, string> = {
  sholawat: "bg-gold",
  dzikir: "bg-emerald-js",
  event: "bg-purple-500",
  meeting: "bg-blue-500",
};

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

export function ArticleDetailClient({ article }: { article: Article }) {
  const config = CATEGORY_CONFIG[article.category] || CATEGORY_CONFIG.artikel;
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [donationStats, setDonationStats] = useState<DonationStats | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetch("/api/schedules", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSchedules(d.schedules || []))
      .catch(() => {});

    fetch("/api/donations", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const donations = d.donations || [];
        const total = donations.reduce((sum: number, don: { amount: number }) => sum + don.amount, 0);
        setDonationStats({ total, count: donations.length });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = currentTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const dateStr = currentTime.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-6xl px-5">
      <Link
        href="/artikel"
        className="mb-8 inline-flex items-center gap-2 text-sm text-parchment-3 transition hover:text-gold-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar artikel
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main Content */}
        <article>
          {article.coverUrl && (
            <div className="relative mb-8 h-64 overflow-hidden rounded-2xl sm:h-80">
              <img
                src={article.coverUrl}
                alt={article.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${config.color}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>
            <span className="text-sm text-parchment-3">{formatDate(article.createdAt)}</span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold text-parchment sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>

          {article.author && (
            <p className="mt-3 text-sm text-parchment-3">oleh {article.author}</p>
          )}

          <div className="gold-line mx-auto mt-8 h-px w-16" />

          <div className="mt-8 max-w-none">
            {article.content.includes("<") ? (
              <div
                className="article-content"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(article.content),
                }}
              />
            ) : (
              article.content.split("\n").map((paragraph, i) => (
                <p
                  key={i}
                  className="mb-4 text-sm leading-relaxed text-parchment-2"
                >
                  {paragraph}
                </p>
              ))
            )}
          </div>

          <div className="mt-12 border-t border-gold/10 pt-8">
            <Link
              href="/artikel"
              className="inline-flex items-center gap-2 text-sm text-gold-2 hover:text-gold"
            >
              <ArrowLeft className="h-4 w-4" />
              Lihat artikel lainnya
            </Link>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Widget Jam */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 text-gold-2">
              <Clock className="h-5 w-5" />
              <h3 className="font-display text-lg font-bold">Jam</h3>
            </div>
            <div className="mt-4 text-center">
              <p className="font-mono text-4xl font-bold text-gradient-gold">{timeStr}</p>
              <p className="mt-2 text-xs text-parchment-3">{dateStr}</p>
            </div>
          </div>

          {/* Widget Jadwal */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 text-gold-2">
              <Calendar className="h-5 w-5" />
              <h3 className="font-display text-lg font-bold">Jadwal Mendatang</h3>
            </div>
            <div className="mt-4 space-y-3">
              {schedules.length === 0 ? (
                <p className="text-xs text-parchment-3">Belum ada jadwal.</p>
              ) : (
                schedules.slice(0, 3).map((s) => (
                  <div key={s.id} className="rounded-xl border border-gold/10 bg-ink-2/40 p-3">
                    <div className="flex items-start gap-2">
                      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${TYPE_COLORS[s.type] || "bg-gold"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-parchment line-clamp-1">{s.title}</p>
                        <p className="mt-1 text-xs text-parchment-3">
                          {formatDisplayDate(s.date)}
                          {s.time && ` • ${s.time}`}
                        </p>
                        {s.location && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-parchment-3">
                            <MapPin className="h-3 w-3" />
                            {s.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {schedules.length > 0 && (
              <Link
                href="/jadwal"
                className="mt-4 block text-center text-xs font-semibold text-gold-2 hover:text-gold"
              >
                Lihat semua jadwal →
              </Link>
            )}
          </div>

          {/* Widget Donasi */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center gap-2 text-gold-2">
              <Heart className="h-5 w-5" />
              <h3 className="font-display text-lg font-bold">Donasi</h3>
            </div>
            <div className="mt-4 text-center">
              {donationStats ? (
                <>
                  <p className="font-display text-2xl font-bold text-gradient-gold">
                    {formatRupiah(donationStats.total)}
                  </p>
                  <p className="mt-1 text-xs text-parchment-3">
                    dari {donationStats.count} donasi terverifikasi
                  </p>
                </>
              ) : (
                <p className="text-xs text-parchment-3">Memuat...</p>
              )}
            </div>
            <Link
              href="/donasi"
              className="mt-4 block w-full rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 py-2.5 text-center text-sm font-bold text-ink shadow-lg shadow-gold/20 transition hover:brightness-110"
            >
              Donasi Sekarang
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
