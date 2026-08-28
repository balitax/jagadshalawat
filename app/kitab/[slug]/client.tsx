"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, BookOpen, Menu, X, ChevronLeft, ChevronRight, Languages } from "lucide-react";

interface KitabMeta {
  id: string;
  slug: string;
  nama: string;
  namaArab: string | null;
  pengarang: string | null;
  pengarangArab: string | null;
  tahunLahir: string | null;
  tahunWafat: string | null;
  mazhab: string | null;
  kategori: string | null;
  bahasa: string | null;
  fitur: string | null;
  deskripsi: string | null;
  catatan: string | null;
  totalBab: number;
}

interface Bab {
  id: string;
  nomor: number;
  judul: string | null;
  judulArab: string | null;
  bagian: string | null;
  keterangan: string | null;
  teksArab: string | null;
  teksIndonesia: string | null;
  urutan: number;
}

type FontSize = "sm" | "md" | "lg";

const ARAB_SIZE: Record<FontSize, string> = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-4xl",
};

export function KitabReader() {
  const params = useParams();
  const slug = String(params.slug);

  const [kitab, setKitab] = useState<KitabMeta | null>(null);
  const [bab, setBab] = useState<Bab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<FontSize>("md");
  const [showTranslation, setShowTranslation] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);
  const readerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/kitab/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Kitab tidak ditemukan");
        return res.json();
      })
      .then((json) => {
        setKitab(json.kitab);
        setBab(json.bab ?? []);
        if ((json.bab ?? []).length > 0) setActiveId(json.bab[0].id);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  const activeIndex = bab.findIndex((b) => b.id === activeId);
  const active = activeIndex >= 0 ? bab[activeIndex] : null;
  const prev = activeIndex > 0 ? bab[activeIndex - 1] : null;
  const next = activeIndex >= 0 && activeIndex < bab.length - 1 ? bab[activeIndex + 1] : null;

  const selectBab = (id: string) => {
    setActiveId(id);
    setTocOpen(false);
    requestAnimationFrame(() =>
      readerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const tocItem = (b: Bab, activeItem: boolean) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
      activeItem
        ? "bg-gradient-to-r from-gold-2/20 to-gold/5 text-gold-2 ring-1 ring-gold/30"
        : "text-parchment-2 hover:bg-gold/5 hover:text-parchment"
    }`;

  return (
    <div className="shell pt-8 sm:pt-12 pb-20 sm:pb-28">
      <Link
        href="/kitab"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-parchment-2 transition hover:text-gold-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke daftar kitab
      </Link>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
          <p className="mt-4 text-sm text-parchment-3">Memuat kitab...</p>
        </div>
      ) : error || !kitab ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="h-16 w-16 text-parchment-3" />
          <p className="mt-4 text-sm text-parchment-3">{error ?? "Terjadi kesalahan"}</p>
        </div>
      ) : (
        <>
          {/* Kitab header */}
          <div className="glass mb-8 rounded-3xl p-6 sm:p-8">
            <div className="flex flex-col gap-3">
              {kitab.namaArab && (
                <p className="font-quran text-3xl leading-tight text-gold-2">{kitab.namaArab}</p>
              )}
              <h1 className="font-display text-3xl font-bold text-parchment sm:text-4xl">
                {kitab.nama}
              </h1>
              {kitab.pengarang && (
                <p className="text-base text-parchment-2">
                  {kitab.pengarang}
                  {kitab.pengarangArab ? ` (${kitab.pengarangArab})` : ""}
                  {kitab.tahunLahir || kitab.tahunWafat
                    ? ` · ${[kitab.tahunLahir, kitab.tahunWafat].filter(Boolean).join(" – ")}`
                    : ""}
                </p>
              )}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-parchment-3">
                {kitab.kategori && (
                  <span className="rounded-full border border-gold/15 bg-gold/5 px-2.5 py-1 text-gold-2">
                    {kitab.kategori}
                  </span>
                )}
                {kitab.mazhab && (
                  <span className="rounded-full border border-gold/15 bg-gold/5 px-2.5 py-1">
                    Mazhab {kitab.mazhab}
                  </span>
                )}
                <span className="rounded-full border border-gold/15 bg-gold/5 px-2.5 py-1">
                  {kitab.totalBab} bab
                </span>
              </div>
            </div>
            {kitab.deskripsi && (
              <p className="mt-4 border-t border-gold/10 pt-4 text-sm leading-relaxed text-parchment-2">
                {kitab.deskripsi}
              </p>
            )}
          </div>

          <div className="lg:grid lg:grid-cols-[290px_1fr] lg:gap-8">
            {/* Daftar Bab — desktop */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <div className="glass rounded-2xl p-4">
                  <h2 className="mb-3 px-1 font-display text-lg font-bold text-parchment">
                    Daftar Bab
                  </h2>
                  <div className="max-h-[68vh] space-y-1 overflow-y-auto pr-1">
                    {bab.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => selectBab(b.id)}
                        className={tocItem(b, b.id === activeId)}
                      >
                        <span className="mushaf-medallion flex h-8 w-8 shrink-0 items-center justify-center">
                          <span className="font-display text-xs font-bold text-gold-2">
                            {b.nomor}
                          </span>
                        </span>
                        <span className="truncate">
                          {b.judul ?? `Bab ${b.nomor}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Reader */}
            <section ref={readerRef}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => setTocOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gold/15 bg-gold/5 px-4 py-2 text-sm font-medium text-parchment-2 transition hover:bg-gold/10 hover:text-parchment lg:hidden"
                >
                  <Menu className="h-4 w-4" />
                  Daftar Bab
                </button>
                <div className="ml-auto flex shrink-0 items-center gap-1 rounded-xl border border-gold/15 bg-gold/5 p-1">
                  <button
                    onClick={() => setShowTranslation((v) => !v)}
                    title="Tampilkan / sembunyikan terjemahan"
                    className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
                      showTranslation
                        ? "bg-gradient-to-r from-gold-2 via-gold to-gold-3 text-ink"
                        : "text-parchment-3 hover:text-parchment"
                    }`}
                  >
                    <Languages className="h-4 w-4" />
                    <span className="hidden sm:inline">Terjemahan</span>
                  </button>
                  {(["sm", "md", "lg"] as FontSize[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFontSize(s)}
                      className={`h-8 w-8 rounded-lg text-sm font-semibold transition ${
                        fontSize === s
                          ? "bg-gradient-to-r from-gold-2 via-gold to-gold-3 text-ink"
                          : "text-parchment-3 hover:text-parchment"
                      }`}
                    >
                      {s === "sm" ? "A" : s === "md" ? "AA" : "AAA"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Halaman kitab */}
              <div className="mushaf-page relative overflow-hidden rounded-2xl border-2 border-gold/20 bg-ink-2 p-6 sm:p-10">
                <div className="mushaf-corner-tl" />
                <div className="mushaf-corner-tr" />
                <div className="mushaf-corner-bl" />
                <div className="mushaf-corner-br" />

                {active ? (
                  <>
                    <div className="mb-6 text-center">
                      {active.judulArab && (
                        <p className="font-quran text-2xl leading-relaxed text-gold-2">
                          {active.judulArab}
                        </p>
                      )}
                      <h2 className="font-display text-xl font-bold text-parchment">
                        {active.judul ?? `Bab ${active.nomor}`}
                      </h2>
                      {active.bagian && (
                        <p className="mt-1 text-xs text-parchment-3">{active.bagian}</p>
                      )}
                    </div>

                    {active.teksArab && (
                      <p
                        dir="rtl"
                        className={`mushaf-flow font-quran leading-loose text-parchment ${ARAB_SIZE[fontSize]}`}
                      >
                        {active.teksArab}
                      </p>
                    )}

                    {active.teksArab && active.teksIndonesia && showTranslation && (
                      <div className="my-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/40" />
                        <div className="h-2 w-2 rotate-45 border border-gold/40" />
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/40" />
                      </div>
                    )}

                    {active.teksIndonesia && showTranslation && (
                      <p className="font-display text-lg leading-relaxed text-parchment-2">
                        {active.teksIndonesia}
                      </p>
                    )}

                    {!active.teksArab && !active.teksIndonesia && (
                      <p className="text-center text-sm text-parchment-3">
                        Teks belum tersedia untuk bab ini.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-center text-sm text-parchment-3">
                    Pilih bab untuk mulai membaca.
                  </p>
                )}
              </div>

              {/* Navigasi halaman */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  onClick={() => prev && selectBab(prev.id)}
                  disabled={!prev}
                  className="inline-flex items-center gap-1 rounded-xl border border-gold/15 bg-gold/5 px-4 py-2.5 text-sm font-medium text-parchment-2 transition hover:bg-gold/10 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Sebelumnya
                </button>
                <span className="text-sm text-parchment-3">
                  Halaman {active ? active.nomor : 0} / {bab.length}
                </span>
                <button
                  onClick={() => next && selectBab(next.id)}
                  disabled={!next}
                  className="inline-flex items-center gap-1 rounded-xl border border-gold/15 bg-gold/5 px-4 py-2.5 text-sm font-medium text-parchment-2 transition hover:bg-gold/10 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </section>
          </div>
        </>
      )}

      {/* Drawer Daftar Bab — mobile */}
      {tocOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setTocOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto border-r border-gold/20 bg-ink p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-parchment">Daftar Bab</h3>
              <button
                onClick={() => setTocOpen(false)}
                className="text-parchment-3 transition hover:text-parchment"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              {bab.map((b) => (
                <button
                  key={b.id}
                  onClick={() => selectBab(b.id)}
                  className={tocItem(b, b.id === activeId)}
                >
                  <span className="mushaf-medallion flex h-8 w-8 shrink-0 items-center justify-center">
                    <span className="font-display text-xs font-bold text-gold-2">{b.nomor}</span>
                  </span>
                  <span className="truncate">{b.judul ?? `Bab ${b.nomor}`}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
