"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeartHandshake, Presentation, Landmark, Shirt, ArrowRight } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/format";
import { SectionHeader } from "./SectionHeader";

interface Donation {
  id: string;
  name: string;
  isAnonymous: boolean;
  amount: number;
  method: "bank_transfer" | "emoney" | "va";
  channel: string;
  message: string | null;
  receiptUrl: string | null;
  status: "pending" | "verified";
  createdAt: string;
}

export function DonationHistory() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/donations", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDonations(data.donations || []);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("donation-created", handler);
    return () => window.removeEventListener("donation-created", handler);
  }, []);

  const total = donations.reduce((sum, d) => sum + d.amount, 0);
  const donors = donations.filter((d) => !d.isAnonymous).length;
  const anonymous = donations.filter((d) => d.isAnonymous).length;

  const stats = [
    { label: "Total Terkumpul", value: formatRupiah(total), icon: Presentation, accent: "gold" },
    { label: "Tercatat", value: `${donations.length} donasi`, icon: HeartHandshake, accent: "emerald" },
    { label: "Terang Nama", value: String(donors), icon: Shirt, accent: "blue" },
    { label: "Hamba Allah", value: String(anonymous), icon: Landmark, accent: "amber" },
  ];

  return (
    <section id="riwayat" className="relative scroll-mt-24">
      <div className="py-20 sm:py-28">
        <SectionHeader
          eyebrow="Riwayat Donasi"
          title="Transparansi"
          highlight="bersama"
          subtitle="Setiap kebaikan yang tersalurkan, tercatat dengan penuh rasa syukur dan amanah."
        />

        {/* Stats */}
        <div className="reveal-stagger mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 px-5">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="glass card-lift rounded-2xl p-5 text-center">
                <Icon className="mx-auto h-6 w-6 text-gold-2" />
                <p className="mt-3 font-display text-xl font-bold text-parchment sm:text-2xl">
                  {s.value}
                </p>
                <p className="mt-1 text-xs text-parchment-3">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="reveal mx-auto mt-10 max-w-5xl px-5">
          {loading ? (
            <div className="overflow-hidden rounded-2xl border border-gold/10 bg-ink-2/40">
              <div className="h-14 animate-pulse border-b border-gold/10 bg-gold/5" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse border-b border-gold/10" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-dashed border-gold/25 py-16 text-center text-parchment-2">
              Belum dapat memuat riwayat. Coba muat ulang halaman.
            </div>
          ) : donations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gold/25 py-20 text-center">
              <p className="font-display text-2xl font-bold text-parchment-2">
                Donasi pertama menanti
              </p>
              <p className="mt-2 text-sm text-parchment-3">
                Jadilah yang pertama menyalurkan kebaikan untuk Jagad Shalawat.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gold/10 bg-ink-2/40">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-gold/10 bg-gold/[0.04] text-[11px] uppercase tracking-wider text-parchment-3">
                      <th className="px-5 py-4 font-semibold">Donor</th>
                      <th className="px-5 py-4 text-right font-semibold">Nominal</th>
                      <th className="px-5 py-4 font-semibold">Metode</th>
                      <th className="px-5 py-4 font-semibold">Tanggal</th>
                      <th className="px-5 py-4 text-right font-semibold">Bukti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10">
                    {donations.map((d) => {
                      const displayName = d.isAnonymous ? "Hamba Allah" : d.name;
                      return (
                        <tr key={d.id} className="transition hover:bg-gold/[0.04]">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 font-display text-base font-bold text-gold-2">
                                {displayName.trim().charAt(0).toUpperCase()}
                              </span>
                              <span className="min-w-0">
                                <span className="flex items-center gap-2">
                                  <span className="font-semibold text-parchment">{displayName}</span>
                                  {d.isAnonymous && (
                                    <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gold-2">
                                      anonim
                                    </span>
                                  )}
                                </span>
                                {d.message && (
                                  <span className="mt-0.5 block max-w-[240px] truncate text-xs text-parchment-3">
                                    &ldquo;{d.message}&rdquo;
                                  </span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right font-display text-base font-bold text-gradient-gold">
                            {formatRupiah(d.amount)}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-parchment-2">
                            {d.channel}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-parchment-3">
                            {formatDate(d.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            {d.receiptUrl ? (
                              <a
                                href={d.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-gold-2 underline decoration-gold/40 underline-offset-2 hover:text-gold"
                              >
                                Lihat
                              </a>
                            ) : (
                              <span className="text-xs text-parchment-3">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="reveal mt-8 flex justify-center">
            <Link
              href="/riwayat"
              className="group inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.04] px-6 py-3 text-sm font-semibold text-parchment backdrop-blur-sm transition hover:border-gold/50 hover:bg-gold/10 hover:text-gold-2"
            >
              Lihat semua riwayat
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
