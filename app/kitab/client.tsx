"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Kitab {
  id: string;
  slug: string;
  nama: string;
  namaArab: string | null;
  pengarang: string | null;
  kategori: string | null;
  mazhab: string | null;
  deskripsi: string | null;
  totalBab: number;
  sortOrder: number;
}

const PER_PAGE = 12;

export function KitabClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [kitab, setKitab] = useState<Kitab[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/kitab")
      .then((res) => res.json())
      .then((json) => {
        setCategories(json.categories ?? []);
        setKitab(json.kitab ?? []);
      })
      .catch((err) => console.error("Failed to fetch kitab:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return kitab.filter((k) => {
      const matchCat = !activeCat || (k.kategori ?? "") === activeCat;
      const matchSearch =
        !q ||
        k.nama.toLowerCase().includes(q) ||
        (k.namaArab ?? "").toLowerCase().includes(q) ||
        (k.pengarang ?? "").toLowerCase().includes(q) ||
        (k.kategori ?? "").toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [kitab, search, activeCat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const gotoPage = (p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="shell">
      <div className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-4 py-1.5">
          <div className="h-1 w-1 rounded-full bg-gold" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-2">
            Kitab Kuning
          </span>
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight text-parchment sm:text-5xl">
          Khazanah <span className="text-gradient-gold">Kitab Kuning</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-parchment-2 sm:text-lg">
          Koleksi kitab kuning klasik Islam dengan teks arab dan terjemahan bahasa
          Indonesia.
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
            placeholder="Cari kitab (nama, pengarang, atau kategori)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-2xl bg-ink-2 py-4 pl-12 pr-4 text-base text-parchment placeholder-parchment-3 outline-none ring-1 ring-gold/10 transition focus:ring-gold/30"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              setActiveCat(null);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              activeCat === null
                ? "bg-gradient-to-r from-gold-2 via-gold to-gold-3 text-ink shadow-lg shadow-gold/20"
                : "border border-gold/15 bg-gold/5 text-parchment-2 hover:bg-gold/10 hover:text-parchment"
            }`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCat(c.name);
                setPage(1);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                activeCat === c.name
                  ? "bg-gradient-to-r from-gold-2 via-gold to-gold-3 text-ink shadow-lg shadow-gold/20"
                  : "border border-gold/15 bg-gold/5 text-parchment-2 hover:bg-gold/10 hover:text-parchment"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
          <p className="mt-4 text-sm text-parchment-3">Memuat kitab...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((k) => (
            <Link
              key={k.id}
              href={`/kitab/${k.slug}`}
              className="glass group rounded-2xl p-5 text-left transition-all hover:scale-[1.02] hover:border-gold/30 hover:shadow-lg hover:shadow-gold/10"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="mushaf-medallion flex h-11 w-11 shrink-0 items-center justify-center">
                  <span className="font-display text-sm font-bold text-gold-2">
                    {k.totalBab}
                  </span>
                </div>
                {k.namaArab && (
                  <p className="font-quran text-xl leading-tight text-gold-2">{k.namaArab}</p>
                )}
              </div>
              <h3 className="mb-1 font-display text-lg font-bold text-parchment group-hover:text-gold-2">
                {k.nama}
              </h3>
              <p className="mb-2 text-sm text-parchment-2">{k.pengarang}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-parchment-3">
                {k.kategori && (
                  <span className="rounded-full border border-gold/15 bg-gold/5 px-2 py-0.5 text-gold-2">
                    {k.kategori}
                  </span>
                )}
                {k.mazhab && <span>{k.mazhab}</span>}
                <span className="h-1 w-1 rounded-full bg-parchment-3" />
                <span>{k.totalBab} bab</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="mt-4 text-sm text-parchment-3">Tidak ada kitab yang ditemukan</p>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => gotoPage(safePage - 1)}
            disabled={safePage === 1}
            className="flex h-10 items-center gap-1 rounded-xl border border-gold/15 bg-gold/5 px-4 text-sm font-medium text-parchment-2 transition hover:bg-gold/10 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Sebelumnya
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
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
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
