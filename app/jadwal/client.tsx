"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

const PAGE_SIZE = 6;

interface ScheduleItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  type: "sholawat" | "dzikir" | "event" | "meeting";
  status: "upcoming" | "completed" | "cancelled";
}

const TYPE_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  sholawat: { label: "Sholawat", color: "border-gold/30 bg-gold/10 text-gold-2", dot: "bg-gold" },
  dzikir: { label: "Dzikir", color: "border-emerald-js/30 bg-emerald-js/10 text-emerald-300", dot: "bg-emerald-js" },
  event: { label: "Event", color: "border-purple-500/30 bg-purple-500/10 text-purple-300", dot: "bg-purple-500" },
  meeting: { label: "Meeting", color: "border-blue-500/30 bg-blue-500/10 text-blue-300", dot: "bg-blue-500" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  upcoming: { label: "Akan Datang", color: "border-emerald-js/40 bg-emerald-js/10 text-emerald-300" },
  completed: { label: "Selesai", color: "border-parchment-3/30 bg-ink-2 text-parchment-3" },
  cancelled: { label: "Dibatalkan", color: "border-red-500/30 bg-red-500/10 text-red-300" },
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

export function JadwalClient() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | ScheduleItem["type"]>("all");
  const [page, setPage] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/schedules?all=true", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setSchedules(d.schedules || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return schedules.filter((s) => {
      const matchSearch =
        q === "" ||
        s.title.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.location && s.location.toLowerCase().includes(q));
      const matchType = filterType === "all" || s.type === filterType;
      return matchSearch && matchType;
    });
  }, [schedules, search, filterType]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [search, filterType]);

  useEffect(() => {
    if (!loading && filtered.length > 0 && gridRef.current) {
      gridRef.current.classList.add("is-visible");
    }
  }, [loading, filtered]);

  return (
    <div>
      <SectionHeader
        eyebrow="Jadwal Kegiatan"
        title="Semua"
        highlight="Jadwal"
        subtitle="Daftar lengkap sholawat, dzikir, event, dan kegiatan komunitas Jagad Shalawat."
      />

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 px-5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-3" />
          <input
            type="text"
            placeholder="Cari jadwal, lokasi, atau keterangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gold/15 bg-ink-2 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-parchment-3 focus:border-gold/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "sholawat", "dzikir", "event", "meeting"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                filterType === t
                  ? "border-gold/50 bg-gold/15 text-gold-2"
                  : "border-gold/15 text-parchment-3 hover:border-gold/30"
              }`}
            >
              {t === "all" ? "Semua" : TYPE_CONFIG[t].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold-2" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-parchment-3">Belum ada jadwal yang cocok.</p>
      ) : (
        <>
          <div ref={gridRef} className="reveal-stagger mx-auto mt-10 grid max-w-6xl gap-5 px-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((s) => {
              const typeConfig = TYPE_CONFIG[s.type] || TYPE_CONFIG.sholawat;
              const statusConfig = STATUS_CONFIG[s.status] || STATUS_CONFIG.upcoming;
              return (
                <div key={s.id} className="glass card-lift group rounded-2xl p-6 transition">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${typeConfig.color}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${typeConfig.dot}`} />
                      {typeConfig.label}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-xl font-bold text-parchment group-hover:text-gold-2 transition-colors">
                    {s.title}
                  </h3>

                  {s.description && (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-parchment-2">
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
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mx-auto mt-10 flex items-center justify-center gap-4 px-5">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-gold/20 px-4 text-sm font-medium text-parchment-2 transition hover:bg-gold/10 hover:text-gold-2 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" /> Sebelumnya
              </button>

              <span className="text-sm text-parchment-3">
                {safePage + 1} / {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-gold/20 px-4 text-sm font-medium text-parchment-2 transition hover:bg-gold/10 hover:text-gold-2 disabled:opacity-30 disabled:pointer-events-none"
              >
                Berikutnya <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
