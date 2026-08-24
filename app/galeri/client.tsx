"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Search, Loader2 } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";

const PAGE_SIZE = 12;

interface GalleryPhoto {
  id: string;
  photoUrl: string;
  caption: string | null;
  eventDate: string | null;
  category: string | null;
}

export function GaleriClient() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/gallery?all=true", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => setPhotos(d.photos || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(photos.map((p) => p.category).filter((c): c is string => !!c))
      ).sort(),
    [photos]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return photos.filter((p) => {
      const matchSearch =
        q === "" ||
        (p.caption && p.caption.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q));
      const matchCategory =
        filterCategory === "all" || p.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [photos, search, filterCategory]);

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

  const safeIndex =
    lightboxIndex !== null && filtered.length > 0
      ? Math.min(lightboxIndex, filtered.length - 1)
      : null;
  const lightboxPhoto = safeIndex !== null ? filtered[safeIndex] : null;

  return (
    <div>
      <SectionHeader
        eyebrow="Galeri Foto"
        title="Momen"
        highlight="Indah"
        subtitle="Dokumentasi kegiatan sholawat dan dzikir komunitas Jagad Shalawat."
      />

      {categories.length > 0 && (
        <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-3 px-5 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-3" />
            <input
              type="text"
              placeholder="Cari foto berdasarkan keterangan atau kategori..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gold/15 bg-ink-2 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-parchment-3 focus:border-gold/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", ...categories].map((c) => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  filterCategory === c
                    ? "border-gold/50 bg-gold/15 text-gold-2"
                    : "border-gold/15 text-parchment-3 hover:border-gold/30"
                }`}
              >
                {c === "all" ? "Semua" : c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="reveal mx-auto mt-10 max-w-6xl px-5">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gold-2" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-gold/25 py-16 text-center text-parchment-2">
            Belum dapat memuat galeri. Coba muat ulang halaman.
          </div>
        ) : photos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold/25 py-20 text-center">
            <p className="font-display text-2xl font-bold text-parchment-2">
              Galeri masih kosong
            </p>
            <p className="mt-2 text-sm text-parchment-3">
              Dokumentasi kegiatan akan segera hadir.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center text-sm text-parchment-3">
            Tidak ada foto yang cocok dengan pencarian anda.
          </p>
        ) : (
          <>
            <div ref={gridRef} className="reveal-stagger grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {paginated.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setLightboxIndex(safePage * PAGE_SIZE + i)}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-gold/10 transition hover:border-gold/30 hover:shadow-xl hover:shadow-black/30"
                >
                  <img
                    src={p.photoUrl}
                    alt={p.caption || ""}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 transition duration-300 group-hover:opacity-100">
                    <p className="line-clamp-1 text-sm font-semibold text-white">
                      {p.caption || "Lihat foto"}
                    </p>
                    {p.category && (
                      <p className="mt-0.5 text-xs text-white/60">{p.category}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {(search || filterCategory !== "all") && (
              <p className="mt-6 text-center text-xs text-parchment-3">
                Menampilkan {filtered.length} dari {photos.length} foto.
              </p>
            )}

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
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

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {safeIndex! > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(safeIndex! - 1);
              }}
              className="absolute left-6 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {safeIndex! < filtered.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(safeIndex! + 1);
              }}
              className="absolute right-16 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          <div className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            {safeIndex! + 1} / {filtered.length}
          </div>

          <div
            className="max-h-[85vh] max-w-[90vw] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxPhoto.photoUrl}
              alt={lightboxPhoto.caption || ""}
              className="max-h-[80vh] rounded-2xl object-contain shadow-2xl"
            />
            {(lightboxPhoto.caption || lightboxPhoto.category) && (
              <div className="mt-4 text-center">
                {lightboxPhoto.caption && (
                  <p className="text-sm font-semibold text-white">
                    {lightboxPhoto.caption}
                  </p>
                )}
                {lightboxPhoto.category && (
                  <p className="mt-0.5 text-xs text-white/50">
                    {lightboxPhoto.category}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
