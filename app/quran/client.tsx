"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Surat {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
}

const PER_PAGE = 15;

export function QuranClient() {
  const router = useRouter();
  const [surahs, setSurahs] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("https://equran.id/api/v2/surat")
      .then((res) => res.json())
      .then((json) => {
        if (json.code === 200 && json.data) {
          setSurahs(json.data);
        }
      })
      .catch((err) => console.error("Failed to fetch surahs:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      surahs.filter(
        (s) =>
          s.namaLatin.toLowerCase().includes(search.toLowerCase()) ||
          s.arti.toLowerCase().includes(search.toLowerCase()) ||
          String(s.nomor).includes(search)
      ),
    [surahs, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PER_PAGE,
    safePage * PER_PAGE
  );

  const gotoPage = (p: number) => {
    const next = Math.max(1, Math.min(p, totalPages));
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="shell">
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-4 py-1.5">
          <div className="h-1 w-1 rounded-full bg-gold" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-2">
            Al-Quran Digital
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight text-parchment sm:text-5xl">
          Kitab <span className="text-gradient-gold">Suci</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-parchment-2 sm:text-lg">
          Baca 114 surah Al-Quran dengan terjemahan bahasa Indonesia
        </p>
      </div>

      <div className="mx-auto mb-8 max-w-2xl">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-parchment-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Cari surah (nama, arti, atau nomor)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-2xl bg-ink-2 py-4 pl-12 pr-4 text-base text-parchment placeholder-parchment-3 outline-none ring-1 ring-gold/10 transition focus:ring-gold/30"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
          <p className="mt-4 text-sm text-parchment-3">Memuat Al-Quran...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((surah) => (
            <button
              key={surah.nomor}
              onClick={() => router.push(`/quran/${surah.nomor}`)}
              className="glass group rounded-2xl p-5 text-left transition-all hover:scale-[1.02] hover:border-gold/30 hover:shadow-lg hover:shadow-gold/10"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="mushaf-medallion flex h-11 w-11 items-center justify-center">
                  <span className="font-display text-sm font-bold text-gold-2">
                    {surah.nomor}
                  </span>
                </div>
                <p className="font-quran text-2xl text-gold-2">{surah.nama}</p>
              </div>
              <h3 className="mb-1 font-display text-lg font-bold text-parchment group-hover:text-gold-2">
                {surah.namaLatin}
              </h3>
              <p className="mb-2 text-sm text-parchment-2">{surah.arti}</p>
              <div className="flex items-center gap-3 text-xs text-parchment-3">
                <span>{surah.jumlahAyat} ayat</span>
                <span className="h-1 w-1 rounded-full bg-parchment-3" />
                <span>{surah.tempatTurun}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <svg
            className="h-16 w-16 text-parchment-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="mt-4 text-sm text-parchment-3">
            Tidak ada surah yang ditemukan
          </p>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => gotoPage(safePage - 1)}
            disabled={safePage === 1}
            className="flex h-10 items-center gap-1 rounded-xl border border-gold/15 bg-gold/5 px-4 text-sm font-medium text-parchment-2 transition hover:bg-gold/10 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Sebelumnya
          </button>

          {pageNumbers.map((num) => (
            <button
              key={num}
              onClick={() => gotoPage(num)}
              className={`h-10 w-10 rounded-xl text-sm font-semibold transition ${
                num === safePage
                  ? "bg-gradient-to-r from-gold-2 via-gold to-gold-3 text-ink shadow-lg shadow-gold/20"
                  : "border border-gold/15 bg-gold/5 text-parchment-2 hover:bg-gold/10 hover:text-parchment"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => gotoPage(safePage + 1)}
            disabled={safePage === totalPages}
            className="flex h-10 items-center gap-1 rounded-xl border border-gold/15 bg-gold/5 px-4 text-sm font-medium text-parchment-2 transition hover:bg-gold/10 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-30"
          >
            Berikutnya
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
