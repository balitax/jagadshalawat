"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, FileText, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import { SectionHeader } from "./SectionHeader";

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: "artikel" | "pengumuman";
  author: string | null;
  createdAt: string;
}

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; dot: string; label: string }> = {
  pengumuman: { icon: Megaphone, color: "border-blue-500/30 bg-blue-500/10 text-blue-300", dot: "bg-blue-500", label: "Pengumuman" },
  artikel: { icon: FileText, color: "border-gold/30 bg-gold/10 text-gold-2", dot: "bg-gold", label: "Artikel" },
};

export function LatestArticles() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setArticles(d.articles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || articles.length === 0) return null;

  return (
    <section id="artikel" className="relative scroll-mt-24">
      <div className="py-20 sm:py-28">
        <SectionHeader
          eyebrow="Artikel & Pengumuman"
          title="Informasi"
          highlight="Terbaru"
          subtitle="Kabar terkini seputar kegiatan dan informasi komunitas Jagad Shalawat."
        />

        <div className="mt-6 flex justify-center">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold-2 transition hover:gap-2.5"
          >
            Lihat semua artikel <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="reveal-stagger mx-auto mt-12 grid max-w-6xl gap-5 px-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => {
            const config = CATEGORY_CONFIG[a.category] || CATEGORY_CONFIG.artikel;
            const Icon = config.icon;
            return (
              <article
                key={a.id}
                className="glass card-lift group flex flex-col rounded-2xl overflow-hidden transition"
              >
                {/* Header accent */}
                <div className="h-1 bg-gradient-to-r from-gold/40 via-gold/20 to-transparent" />

                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${config.color}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                    <span className="text-[11px] text-parchment-3">
                      {formatDate(a.createdAt)}
                    </span>
                  </div>

                  <h3 className="mt-4 font-display text-xl font-bold text-parchment line-clamp-2 group-hover:text-gold-2 transition-colors">
                    {a.title}
                  </h3>

                  {a.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-parchment-2 flex-1">
                      {a.excerpt}
                    </p>
                  )}

                  <div className="mt-5 flex items-center justify-between border-t border-gold/10 pt-4">
                    {a.author && (
                      <span className="text-xs text-parchment-3">oleh {a.author}</span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-2 transition group-hover:gap-2.5">
                      Baca selengkapnya <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
