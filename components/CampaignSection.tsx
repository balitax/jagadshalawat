"use client";

import { useEffect, useState } from "react";
import { Target, Users, Clock } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { SectionHeader } from "./SectionHeader";

interface CampaignItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverUrl: string | null;
  targetAmount: number;
  deadline: string | null;
  raisedAmount: number;
  donorCount: number;
}

export function CampaignSection() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => setCampaigns(data.campaigns || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || campaigns.length === 0) return null;

  return (
    <section className="py-20 sm:py-28">
      <div className="shell">
        <SectionHeader
          eyebrow="Campaign Donasi"
          title="Galang Dana"
          highlight="Terarah"
          subtitle="Salurkan donasi anda untuk tujuan yang spesifik dan pantau progresnya secara transparan."
        />

        <div className="reveal mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => {
            const pct = c.targetAmount > 0 ? Math.min(100, Math.round((c.raisedAmount / c.targetAmount) * 100)) : 0;
            const daysLeft = c.deadline
              ? Math.ceil((new Date(c.deadline).getTime() - new Date().getTime()) / 86400000)
              : null;
            return (
              <div
                key={c.id}
                className="glass-strong flex flex-col overflow-hidden rounded-3xl"
              >
                {c.coverUrl ? (
                  <div className="aspect-[16/9] overflow-hidden bg-ink-2">
                    <img src={c.coverUrl} alt={c.title} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-gold/15 via-gold/5 to-emerald-js/10">
                    <Target className="h-10 w-10 text-gold-2" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-bold text-parchment">{c.title}</h3>
                  {c.description && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-parchment-3">
                      {c.description}
                    </p>
                  )}

                  <div className="mt-5">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-display text-lg font-bold text-gradient-gold">{pct}%</span>
                      <span className="text-xs text-parchment-3">
                        dari {formatRupiah(c.targetAmount)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-1 text-sm font-semibold text-parchment">
                    {formatRupiah(c.raisedAmount)} <span className="font-normal text-parchment-3">terkumpul</span>
                  </p>

                  <div className="mt-3 flex items-center gap-4 text-xs text-parchment-3">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> {c.donorCount} donasi
                    </span>
                    {daysLeft !== null && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {daysLeft >= 0 ? `${daysLeft} hari lagi` : "Berakhir"}
                      </span>
                    )}
                  </div>

                  <a
                    href={`/donasi?campaign=${c.slug}#donasi`}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-5 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-gold/20 transition hover:brightness-110"
                  >
                    <Target className="h-4 w-4" /> Donasi untuk Campaign Ini
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
