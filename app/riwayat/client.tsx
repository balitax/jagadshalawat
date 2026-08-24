"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  HeartHandshake,
  Presentation,
  Landmark,
  Shirt,
  Search,
  ArrowRight,
} from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/format";
import { METHOD_LABELS, MethodType } from "@/lib/payment";
import { SectionHeader } from "@/components/SectionHeader";

interface Donation {
  id: string;
  name: string;
  isAnonymous: boolean;
  amount: number;
  method: MethodType;
  channel: string;
  message: string | null;
  receiptUrl: string | null;
  status: "pending" | "verified";
  createdAt: string;
}

export function RiwayatClient() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState<"all" | MethodType>("all");
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/donations", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => setDonations(d.donations || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && !error && donations.length > 0 && tableRef.current) {
      tableRef.current.classList.add("is-visible");
    }
  }, [loading, error, donations]);

  const total = useMemo(
    () => donations.reduce((sum, d) => sum + d.amount, 0),
    [donations]
  );
  const donors = donations.filter((d) => !d.isAnonymous).length;
  const anonymous = donations.filter((d) => d.isAnonymous).length;

  const stats = [
    { label: "Total Terkumpul", value: formatRupiah(total), icon: Presentation },
    { label: "Tercatat", value: `${donations.length} donasi`, icon: HeartHandshake },
    { label: "Terang Nama", value: String(donors), icon: Shirt },
    { label: "Hamba Allah", value: String(anonymous), icon: Landmark },
  ];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return donations
      .filter((d) => {
        const matchSearch =
          q === "" ||
          (!d.isAnonymous && d.name.toLowerCase().includes(q)) ||
          (d.message && d.message.toLowerCase().includes(q)) ||
          d.channel.toLowerCase().includes(q);
        const matchMethod = filterMethod === "all" || d.method === filterMethod;
        return matchSearch && matchMethod;
      })
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [donations, search, filterMethod]);

  return (
    <div>
      <SectionHeader
        eyebrow="Riwayat Donasi"
        title="Transparansi"
        highlight="bersama"
        subtitle="Setiap kebaikan yang tersalurkan, tercatat dengan penuh rasa syukur dan amanah."
      />

      {/* Stats */}
      <div className="reveal-stagger mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 px-5 sm:grid-cols-4">
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

      {/* Search & filter */}
      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 px-5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-3" />
          <input
            type="text"
            placeholder="Cari nama donor, pesan, atau kanal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gold/15 bg-ink-2 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-parchment-3 focus:border-gold/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "bank_transfer", "emoney", "va"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMethod(m)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                filterMethod === m
                  ? "border-gold/50 bg-gold/15 text-gold-2"
                  : "border-gold/15 text-parchment-3 hover:border-gold/30"
              }`}
            >
              {m === "all" ? "Semua" : METHOD_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div ref={tableRef} className="reveal mx-auto mt-8 max-w-6xl px-5">
        {loading ? (
          <div className="overflow-hidden rounded-2xl border border-gold/10 bg-ink-2/40">
            <div className="h-14 animate-pulse border-b border-gold/10 bg-gold/5" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse border-b border-gold/10" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-gold/25 py-16 text-center text-parchment-2">
            Belum dapat memuat riwayat. Coba muat ulang halaman.
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold/25 py-20 text-center">
            <p className="font-display text-2xl font-bold text-parchment-2">
              {donations.length === 0 ? "Donasi pertama menanti" : "Tidak ada yang cocok"}
            </p>
            <p className="mt-2 text-sm text-parchment-3">
              {donations.length === 0
                ? "Jadilah yang pertama menyalurkan kebaikan untuk Jagad Shalawat."
                : "Coba ubah kata kunci atau filter metode pembayaran."}
            </p>
            {donations.length === 0 && (
              <Link
                href="/donasi"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-6 py-2.5 text-sm font-bold text-ink shadow-lg shadow-gold/20 transition hover:brightness-110"
              >
                Salurkan Donasi <ArrowRight className="h-4 w-4" />
              </Link>
            )}
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
                  {filtered.map((d) => {
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

        {!loading && !error && filtered.length > 0 && (
          <p className="mt-4 text-center text-xs text-parchment-3">
            Menampilkan {filtered.length} dari {donations.length} donasi terverifikasi.
          </p>
        )}

        <div className="reveal mt-10 flex justify-center">
          <Link
            href="/donasi"
            className="group inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.04] px-6 py-3 text-sm font-semibold text-parchment backdrop-blur-sm transition hover:border-gold/50 hover:bg-gold/10 hover:text-gold-2"
          >
            Salurkan Donasi
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
