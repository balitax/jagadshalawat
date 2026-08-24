"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

interface GalleryPhoto {
  id: string;
  photoUrl: string;
  caption: string | null;
  eventDate: string | null;
  category: string | null;
}

export function PhotoGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/gallery", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setPhotos(d.photos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || photos.length === 0) return null;

  const lightboxPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <section id="galeri" className="relative scroll-mt-24">
      <div className="py-20 sm:py-28">
        <SectionHeader
          eyebrow="Galeri Foto"
          title="Momen"
          highlight="Indah"
          subtitle="Dokumentasi kegiatan sholawat dan dzikir komunitas Jagad Shalawat."
        />

        <div className="reveal-stagger mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-4 px-5 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setLightboxIndex(i)}
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
                <p className="text-sm font-semibold text-white line-clamp-1">
                  {p.caption || "Lihat foto"}
                </p>
                {p.category && (
                  <p className="mt-0.5 text-xs text-white/60">{p.category}</p>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="reveal mx-auto mt-10 flex justify-center px-5">
          <Link
            href="/galeri"
            className="group inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/[0.04] px-6 py-3 text-sm font-semibold text-parchment backdrop-blur-sm transition hover:border-gold/50 hover:bg-gold/10 hover:text-gold-2"
          >
            Lihat semua foto
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev */}
          {lightboxIndex! > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex! - 1); }}
              className="absolute left-6 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {/* Next */}
          {lightboxIndex! < photos.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex! + 1); }}
              className="absolute right-16 rounded-full bg-white/10 p-2.5 text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          {/* Counter */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            {lightboxIndex! + 1} / {photos.length}
          </div>

          <div className="max-h-[85vh] max-w-[90vw] animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxPhoto.photoUrl}
              alt={lightboxPhoto.caption || ""}
              className="max-h-[80vh] rounded-2xl object-contain shadow-2xl"
            />
            {(lightboxPhoto.caption || lightboxPhoto.category) && (
              <div className="mt-4 text-center">
                {lightboxPhoto.caption && (
                  <p className="text-sm font-semibold text-white">{lightboxPhoto.caption}</p>
                )}
                {lightboxPhoto.category && (
                  <p className="mt-0.5 text-xs text-white/50">{lightboxPhoto.category}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
