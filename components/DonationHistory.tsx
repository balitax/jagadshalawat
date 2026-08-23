"use client";

import { useEffect, useState } from "react";
import { HeartHandshake, Presentation, Landmark, Shirt } from "lucide-react";
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
    { label: "Total Terkumpul", value: formatRupiah(total), icon: Presentation },
    { label: "Tercatat", value: `${donations.length} donasi`, icon: HeartHandshake },
    { label: "Terang Nama", value: donors, icon: Shirt },
    { label: "Hamba Allah", value: anonymous, icon: Landmark },
  ];

  return (
    <section id="riwayat" className="relative scroll-mt-24">
      <div className="shell py-16 sm:py-24">
        <SectionHeader
          eyebrow="Riwayat Donasi"
          title="Transparansi"
          highlight="bersama"
          subtitle="Setiap kebaikan yang tersalurkan, tercatat dengan penuh rasa syukur dan amanah."
        />

        {/* Stats */}
        <div className="reveal mt-10 grid grid-cols-2 gap-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="glass card-lift rounded-2xl p-4 sm:p-5">
                <Icon className="h-5 w-5 text-gold-2" />
                <p className="mt-3 font-display text-xl font-semibold text-parchment sm:text-2xl">
                  {s.value}
                </p>
                <p className="text-xs text-parchment-3">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="reveal mt-8 sm:mt-10">
          {loading ? (
            <div className="overflow-hidden rounded-2xl border border-gold/10 bg-ink-2/40">
              <div className="h-12 animate-pulse border-b border-gold/10 bg-gold/5" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse border-b border-gold/10" />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-dashed border-gold/25 py-14 text-center text-parchment-2">
              Belum dapat memuat riwayat. Coba muat ulang halaman.
            </div>
          ) : donations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gold/25 py-16 text-center">
              <p className="font-display text-2xl text-parchment-2">
                Donasi pertama menanti
              </p>
              <p className="mt-2 text-sm text-parchment-3">
                Jadilah yang pertama menyalurkan kebaikan untuk Jagad Shalawat.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gold/10 bg-ink-2/40">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="border-b border-gold/10 bg-gold/[0.05] text-[11px] uppercase tracking-wider text-parchment-3">
                      <th className="px-4 py-3 font-medium">Donor</th>
                      <th className="px-4 py-3 text-right font-medium">Nominal</th>
                      <th className="px-4 py-3 font-medium">Metode</th>
                      <th className="px-4 py-3 font-medium">Tanggal</th>
                      <th className="px-4 py-3 text-right font-medium">Bukti</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold/10">
                    {donations.map((d) => {
                      const displayName = d.isAnonymous ? "Hamba Allah" : d.name;
                      return (
                        <tr key={d.id} className="transition hover:bg-gold/5">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 font-display text-base font-semibold text-gold-2">
                                {displayName.trim().charAt(0).toUpperCase()}
                              </span>
                              <span className="min-w-0">
                                <span className="flex items-center gap-2">
                                  <span className="font-medium text-parchment">{displayName}</span>
                                  {d.isAnonymous && (
                                    <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gold-2">
                                      anonim
                                    </span>
                                  )}
                                </span>
                                {d.message && (
                                  <span className="mt-0.5 block max-w-[220px] truncate text-xs text-parchment-3">
                                    “{d.message}”
                                  </span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right font-display text-base font-semibold text-gradient-gold">
                            {formatRupiah(d.amount)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-parchment-2">
                            {d.channel}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-parchment-3">
                            {formatDate(d.createdAt)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            {d.receiptUrl ? (
                              <a
                                href={d.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-gold-2 underline decoration-gold/40 underline-offset-2 hover:text-gold"
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
        </div>
      </div>
    </section>
  );
}
