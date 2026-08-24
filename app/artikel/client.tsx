"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Megaphone,
  FileText,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "@/lib/format";
import { SectionHeader } from "@/components/SectionHeader";

const PAGE_SIZE = 6;

interface ArticleItem {
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

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; dot: string; label: string }> = {
  pengumuman: { icon: Megaphone, color: "border-blue-500/30 bg-blue-500/10 text-blue-300", dot: "bg-blue-500", label: "Pengumuman" },
  artikel: { icon: FileText, color: "border-gold/30 bg-gold/10 text-gold-2", dot: "bg-gold", label: "Artikel" },
};

export function ArtikelClient() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "artikel" | "pengumuman">("all");
  const [page, setPage] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/articles?all=true", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setArticles(d.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return articles.filter((a) => {
      const matchSearch = q === "" || a.title.toLowerCase().includes(q) || (a.excerpt && a.excerpt.toLowerCase().includes(q));
      const matchCategory = filterCategory === "all" || a.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [articles, search, filterCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [search, filterCategory]);

  useEffect(() => {
    if (!loading && filtered.length > 0 && gridRef.current) {
      gridRef.current.classList.add("is-visible");
    }
  }, [loading, filtered]);

  return (
    <div>
      <SectionHeader
        eyebrow="Artikel & Pengumuman"
        title="Informasi"
        highlight="Komunitas"
        subtitle="Kabar terkini seputar kegiatan dan informasi komunitas Jagad Shalawat."
      />

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 px-5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-3" />
          <input
            type="text"
            placeholder="Cari artikel atau pengumuman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gold/15 bg-ink-2 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-parchment-3 focus:border-gold/50"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "artikel", "pengumuman"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilterCategory(c)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                filterCategory === c
                  ? "border-gold/50 bg-gold/15 text-gold-2"
                  : "border-gold/15 text-parchment-3 hover:border-gold/30"
              }`}
            >
              {c === "all" ? "Semua" : CATEGORY_CONFIG[c].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold-2" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="mt-16 text-center text-sm text-parchment-3">Belum ada artikel yang cocok.</p>
      ) : (
        <>
          <div ref={gridRef} className="reveal-stagger mx-auto mt-10 grid max-w-6xl gap-5 px-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((a) => {
              const config = CATEGORY_CONFIG[a.category] || CATEGORY_CONFIG.artikel;
              return (
                <a
                  key={a.id}
                  href={`/artikel/${a.slug}`}
                  className="glass card-lift group flex flex-col overflow-hidden rounded-2xl transition"
                >
                  {a.coverUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={a.coverUrl}
                        alt={a.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${config.color}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                        {config.label}
                      </span>
                      <span className="text-[11px] text-parchment-3">{formatDate(a.createdAt)}</span>
                    </div>

                    <h3 className="mt-4 font-display text-xl font-bold text-parchment line-clamp-2 group-hover:text-gold-2 transition-colors">
                      {a.title}
                    </h3>

                    {a.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-parchment-2 flex-1">{a.excerpt}</p>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-gold/10 pt-4">
                      {a.author && <span className="text-xs text-parchment-3">oleh {a.author}</span>}
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-2">
                        Baca selengkapnya
                      </span>
                    </div>
                  </div>
                </a>
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
