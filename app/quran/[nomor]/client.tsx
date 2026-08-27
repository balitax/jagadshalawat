"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";

interface Ayah {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
}

interface SuratDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
  ayat: Ayah[];
  suratSelanjutnya:
    | { nomor: number; nama: string; namaLatin: string; jumlahAyat: number }
    | false;
  suratSebelumnya:
    | { nomor: number; nama: string; namaLatin: string; jumlahAyat: number }
    | false;
}

const QARI_LIST = [
  { key: "05", name: "Misyari Rasyid Al-Afasi" },
  { key: "01", name: "Abdullah Al-Juhany" },
  { key: "03", name: "Abdurrahman As-Sudais" },
  { key: "06", name: "Yasser Al-Dosari" },
];

function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [arr];
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export function QuranReader() {
  const params = useParams();
  const router = useRouter();
  const nomor = Number(params.nomor);

  const [surah, setSurah] = useState<SuratDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<"md" | "lg" | "xl">("lg");
  const [qari, setQari] = useState("05");
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [audioPaused, setAudioPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [page, setPage] = useState(0);
  const [activePopover, setActivePopover] = useState<number | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(
    null
  );
  const [focusMode, setFocusMode] = useState(false);
  const perPage = 20;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ayahRefs = useRef<Map<number, HTMLElement>>(new Map());

  const [toolbarTop, setToolbarTop] = useState(96);

  useEffect(() => {
    const updateToolbarTop = () => {
      if (focusMode) {
        setToolbarTop(16);
        return;
      }
      const navbar = document.getElementById("site-navbar");
      setToolbarTop((navbar?.getBoundingClientRect().height ?? 80) + 16);
    };
    updateToolbarTop();
    window.addEventListener("resize", updateToolbarTop);
    const navbar = document.getElementById("site-navbar");
    let observer: ResizeObserver | undefined;
    if (navbar && "ResizeObserver" in window) {
      observer = new ResizeObserver(updateToolbarTop);
      observer.observe(navbar);
    }
    return () => {
      window.removeEventListener("resize", updateToolbarTop);
      observer?.disconnect();
    };
  }, [focusMode]);

  useEffect(() => {
    document.body.classList.toggle("quran-focus-mode", focusMode);
    return () => {
      document.body.classList.remove("quran-focus-mode");
    };
  }, [focusMode]);

  useEffect(() => {
    if (!focusMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocusMode(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusMode]);

  useEffect(() => {
    setLoading(true);
    setSurah(null);
    setPlayingAyah(null);
    setAudioPaused(false);
    setShowSettings(false);
    setActivePopover(null);
    setPage(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    ayahRefs.current.clear();

    fetch(`https://equran.id/api/v2/surat/${nomor}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.code === 200 && json.data) {
          setSurah(json.data);
        }
      })
      .catch((err) => console.error("Failed to fetch surah:", err))
      .finally(() => setLoading(false));

    window.scrollTo({ top: 0 });
  }, [nomor]);

  const currentPlayRef = useRef<{ index: number } | null>(null);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    currentPlayRef.current = null;
    setPlayingAyah(null);
    setAudioPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setAudioPaused(false);
    } else {
      audioRef.current.pause();
      setAudioPaused(true);
    }
  }, []);

  const scrollToAyah = useCallback(
    (ayahNum: number) => {
      if (!autoScroll) return;
      const el = ayahRefs.current.get(ayahNum);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [autoScroll]
  );

  // Recursive playback: plays ayah at startIndex, then advances to the next
  const playFrom = (startIndex: number) => {
    if (!surah) return;
    if (startIndex >= surah.ayat.length) {
      stopAudio();
      return;
    }
    const target = surah.ayat[startIndex];
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(target.audio[qari]);
    audio.onended = () => playFrom(startIndex + 1);
    audio.play().catch(() => {});
    audioRef.current = audio;
    currentPlayRef.current = { index: startIndex };
    setPlayingAyah(target.nomorAyat);
    setAudioPaused(false);
    // Flip to the page that contains this ayah
    setPage(Math.floor(startIndex / perPage));
    scrollToAyah(target.nomorAyat);
  };

  const playAyah = (ayah: Ayah) => {
    if (playingAyah === ayah.nomorAyat) {
      if (audioPaused) {
        togglePause();
      } else {
        stopAudio();
      }
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const idx = surah
      ? surah.ayat.findIndex((a) => a.nomorAyat === ayah.nomorAyat)
      : -1;
    if (idx >= 0) playFrom(idx);
  };

  const currentIdx =
    playingAyah !== null && surah
      ? surah.ayat.findIndex((a) => a.nomorAyat === playingAyah)
      : -1;

  const playPrev = () => {
    if (currentIdx > 0) playFrom(currentIdx - 1);
  };

  const playNext = () => {
    if (currentIdx >= 0 && currentIdx < (surah?.ayat.length ?? 0) - 1) {
      playFrom(currentIdx + 1);
    }
  };

  const playFull = () => {
    if (!surah) return;
    if (playingAyah !== null) {
      stopAudio();
      return;
    }
    playFrom(0);
  };

  const isPlaying = playingAyah !== null;

  const fontClass =
    fontSize === "xl"
      ? "text-[2.5rem] sm:text-[3.2rem] leading-[2.4]"
      : fontSize === "lg"
        ? "text-[2rem] sm:text-[2.6rem] leading-[2.2]"
        : "text-[1.7rem] sm:text-[2.2rem] leading-[2]";

  const setAyahRef = (ayahNum: number, el: HTMLElement | null) => {
    if (el) {
      ayahRefs.current.set(ayahNum, el);
    } else {
      ayahRefs.current.delete(ayahNum);
    }
  };

  const prevNomor = surah?.suratSebelumnya
    ? (surah.suratSebelumnya as { nomor: number }).nomor
    : null;
  const nextNomor = surah?.suratSelanjutnya
    ? (surah.suratSelanjutnya as { nomor: number }).nomor
    : null;

  const renderAyah = (ayah: Ayah) => {
    const isActive = playingAyah === ayah.nomorAyat;
    const isGroup5 = ayah.nomorAyat % 5 === 0;
    const isOpen = activePopover === ayah.nomorAyat;
    return (
      <span
        key={ayah.nomorAyat}
        ref={(el) => setAyahRef(ayah.nomorAyat, el)}
        className={`transition-colors duration-300 ${
          isActive ? "rounded bg-gold/10" : ""
        }`}
      >
        <span
          className={`font-quran transition-colors duration-300 ${fontClass} ${
            isActive ? "text-gold-2" : "text-parchment"
          }`}
        >
          {ayah.teksArab}
        </span>
        <span
          className="relative mx-1 inline-block"
          style={{ direction: "ltr" }}
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setPopoverPos({
              top: rect.bottom + 10,
              left: rect.left + rect.width / 2,
            });
            setActivePopover(ayah.nomorAyat);
          }}
          onMouseLeave={() =>
            setActivePopover((cur) => (cur === ayah.nomorAyat ? null : cur))
          }
        >
          <button
            onClick={() => playAyah(ayah)}
            className={`mushaf-ayah-mark ${isGroup5 ? "is-group5" : ""} ${
              isActive ? "is-active" : ""
            }`}
          >
            {ayah.nomorAyat}
          </button>

          {isOpen &&
            popoverPos &&
            typeof document !== "undefined" &&
            createPortal(
              <div
                className="mushaf-popover"
                style={{ top: popoverPos.top, left: popoverPos.left }}
                onMouseEnter={() => setActivePopover(ayah.nomorAyat)}
                onMouseLeave={() => setActivePopover(null)}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-2">
                    Ayat {ayah.nomorAyat}
                  </span>
                  <button
                    onClick={() => playAyah(ayah)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                      isActive
                        ? "bg-emerald-js text-white"
                        : "bg-gold/10 text-parchment-2 hover:bg-gold/15 hover:text-parchment"
                    }`}
                  >
                    {isActive && !audioPaused ? (
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mb-2 text-xs italic leading-relaxed text-parchment-3">
                  {ayah.teksLatin}
                </p>
                <p className="text-sm leading-relaxed text-parchment-2">
                  {ayah.teksIndonesia}
                </p>
              </div>,
              document.body
            )}
        </span>{" "}
      </span>
    );
  };

  const pages = surah ? chunk(surah.ayat, perPage) : [];
  const totalPages = Math.max(1, pages.length);
  const safePage = Math.min(page, totalPages - 1);
  const pageAyahs = pages[safePage] ?? [];
  const firstAyahNo = pageAyahs[0]?.nomorAyat;
  const lastAyahNo = pageAyahs[pageAyahs.length - 1]?.nomorAyat;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
        <p className="mt-4 text-sm text-parchment-3">Memuat surah...</p>
      </div>
    );
  }

  if (!surah) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <p className="text-parchment-3">Surah tidak ditemukan</p>
        <button
          onClick={() => router.push("/quran")}
          className="mt-4 rounded-xl bg-gold/10 px-4 py-2 text-sm text-parchment transition hover:bg-gold/20"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Mushaf Reading Area */}
      <div className="shell mt-8">
        <div className="mx-auto max-w-6xl">
          {/* Top info pill, mimicking a printed mushaf's running header */}
          <div className="mx-auto mb-4 flex max-w-md items-center justify-center gap-3 rounded-full border border-gold/25 bg-gradient-to-r from-gold/5 via-transparent to-gold/5 px-5 py-2">
            <span className="h-1 w-1 rounded-full bg-gold/50" />
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-2">
              {surah.nomor}. {surah.namaLatin}
              {firstAyahNo &&
                lastAyahNo &&
                (firstAyahNo === lastAyahNo
                  ? ` : ${firstAyahNo}`
                  : ` : ${firstAyahNo}-${lastAyahNo}`)}
            </p>
            <span className="h-1 w-1 rounded-full bg-gold/50" />
          </div>

          {/* Controls toolbar — sticky below the main site navbar */}
          <div className="sticky z-30 mb-6" style={{ top: toolbarTop }}>
            <div className="flex flex-col gap-3 rounded-xl border border-gold/15 bg-ink-3/90 p-3 shadow-lg shadow-black/20 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/quran")}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-parchment-3 transition hover:bg-gold/15 hover:text-parchment"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <div>
                  <h1 className="text-sm font-bold text-parchment">
                    {surah.namaLatin}
                  </h1>
                  <p className="text-[11px] text-parchment-3">
                    {surah.jumlahAyat} ayat · {surah.tempatTurun}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={playFull}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    isPlaying
                      ? "bg-emerald-js text-white"
                      : "bg-gold/10 text-parchment-2 hover:bg-gold/15 hover:text-parchment"
                  }`}
                >
                  <svg
                    className="h-3 w-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {isPlaying ? "Stop Full" : "Putar Full"}
                </button>
                <button
                  onClick={() => setFocusMode(!focusMode)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    focusMode
                      ? "bg-gold/15 text-gold-2"
                      : "bg-gold/10 text-parchment-2 hover:bg-gold/15 hover:text-parchment"
                  }`}
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    {focusMode ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15"
                      />
                    )}
                  </svg>
                  {focusMode ? "Keluar Fokus" : "Mode Fokus"}
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-parchment-3 transition hover:bg-gold/15 hover:text-parchment"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mushaf Page Frame */}
          <div className="mushaf-page relative overflow-hidden rounded-2xl border-2 border-gold/20 bg-ink-2 p-6 sm:p-10">
            {/* Bottom corner ornaments */}
            <div className="mushaf-corner-bl" />
            <div className="mushaf-corner-br" />

            {showSettings && (
              <div className="mb-6 rounded-xl border border-gold/15 bg-ink-3/40 p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-parchment-3">
                      Font
                    </span>
                    <div className="flex gap-1 rounded-lg bg-ink-2 p-0.5">
                      {(["md", "lg", "xl"] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setFontSize(size)}
                          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                            fontSize === size
                              ? "bg-gold/15 text-gold-2"
                              : "text-parchment-3 hover:text-parchment"
                          }`}
                        >
                          {size === "md" ? "A" : size === "lg" ? "A" : "A"}
                          <span className="ml-1 opacity-50">
                            {size === "md" ? "K" : size === "lg" ? "S" : "B"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-parchment-3">
                      Qari
                    </span>
                    <select
                      value={qari}
                      onChange={(e) => setQari(e.target.value)}
                      className="rounded-lg bg-ink-2 px-3 py-1.5 text-xs text-parchment outline-none ring-1 ring-gold/10"
                    >
                      {QARI_LIST.map((q) => (
                        <option key={q.key} value={q.key}>
                          {q.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-parchment-3">
                      Auto-scroll
                    </span>
                    <button
                      onClick={() => setAutoScroll(!autoScroll)}
                      className={`relative h-5 w-9 rounded-full transition ${
                        autoScroll ? "bg-emerald-js" : "bg-ink-2"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                          autoScroll ? "left-[18px]" : "left-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Surah Header (like real Quran) */}
            <div className="mushaf-header relative mx-auto mb-8 max-w-md text-center">
              <div className="relative rounded-2xl border-2 border-gold/30 bg-gradient-to-b from-gold/10 via-gold/5 to-gold/10 p-5">
                <div className="absolute inset-1 rounded-xl border border-gold/15" />
                <div className="absolute inset-2 rounded-lg border border-gold/10" />

                <div className="relative">
                  <p className="font-quran text-3xl leading-relaxed text-gold-2 sm:text-4xl">
                    {surah.nama}
                  </p>
                  <div className="gold-line mx-auto my-2 h-px w-32" />
                  <p className="font-display text-lg font-bold text-parchment">
                    {surah.namaLatin}
                  </p>
                  <p className="mt-1 text-xs text-parchment-3">
                    {surah.arti} · {surah.jumlahAyat} ayat · {surah.tempatTurun}
                  </p>
                </div>
              </div>
            </div>

            {/* Bismillah */}
            {surah.nomor !== 9 && surah.nomor !== 1 && (
              <div className="mb-10 text-center">
                <div className="relative inline-block px-8">
                  <div className="absolute left-0 top-1/2 h-px w-12 -translate-y-1/2 bg-gradient-to-r from-transparent to-gold/40" />
                  <div className="absolute right-0 top-1/2 h-px w-12 -translate-y-1/2 bg-gradient-to-l from-transparent to-gold/40" />
                  <p className="font-quran text-2xl text-gold-2 sm:text-3xl">
                    بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
                  </p>
                </div>
              </div>
            )}

            {/* Continuous flowing mushaf text, like a printed page */}
            <div className="mushaf-flow">{pageAyahs.map(renderAyah)}</div>

            {/* End of Surah ornament (only on the final page) */}
            {safePage === totalPages - 1 && (
              <div className="mt-10 text-center">
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold/40" />
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rotate-45 border border-gold/40" />
                    <div className="h-3 w-3 rotate-45 border border-gold/30" />
                    <div className="h-2 w-2 rotate-45 border border-gold/40" />
                  </div>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold/40" />
                </div>
                <p className="mt-4 font-quran text-lg text-gold-2">
                  صَدَقَ اللّٰهُ الْعَظِيْمُ
                </p>
              </div>
            )}
          </div>

          {/* Page navigation */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                onClick={() => {
                  setPage((p) => Math.max(0, p - 1));
                  scrollToTop();
                }}
                disabled={safePage === 0}
                className="flex h-9 items-center gap-1 rounded-xl border border-gold/15 bg-gold/5 px-4 text-sm font-medium text-parchment-2 transition hover:bg-gold/10 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-30"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Sebelumnya
              </button>

              <span className="text-xs text-parchment-3">
                Hal {safePage + 1} / {totalPages}
              </span>

              <button
                onClick={() => {
                  setPage((p) => Math.min(totalPages - 1, p + 1));
                  scrollToTop();
                }}
                disabled={safePage === totalPages - 1}
                className="flex h-9 items-center gap-1 rounded-xl border border-gold/15 bg-gold/5 px-4 text-sm font-medium text-parchment-2 transition hover:bg-gold/10 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-30"
              >
                Berikutnya
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Navigation */}
          <div
            className={`mt-8 flex items-center justify-between gap-4 transition-opacity ${
              focusMode ? "pointer-events-none opacity-0" : ""
            }`}
          >
            {prevNomor ? (
              <button
                onClick={() => {
                  scrollToTop();
                  router.push(`/quran/${prevNomor}`);
                }}
                className="flex items-center gap-2 rounded-xl border border-gold/15 bg-gold/5 px-5 py-3 text-sm font-medium text-parchment-2 transition hover:bg-gold/10 hover:text-parchment"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                {surah.suratSebelumnya &&
                  (surah.suratSebelumnya as { namaLatin: string }).namaLatin}
              </button>
            ) : (
              <div />
            )}
            {nextNomor ? (
              <button
                onClick={() => {
                  scrollToTop();
                  router.push(`/quran/${nextNomor}`);
                }}
                className="flex items-center gap-2 rounded-xl border border-gold/15 bg-gold/5 px-5 py-3 text-sm font-medium text-parchment-2 transition hover:bg-gold/10 hover:text-parchment"
              >
                {surah.suratSelanjutnya &&
                  (surah.suratSelanjutnya as { namaLatin: string }).namaLatin}
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            ) : (
              <div />
            )}
          </div>
        </div>
      </div>

      {/* Audio Player Bar */}
      {isPlaying && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gold/20 bg-ink/95 backdrop-blur-xl">
          <div className="shell flex items-center gap-3 py-3">
            {/* Prev */}
            <button
              onClick={playPrev}
              disabled={currentIdx <= 0}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-parchment-3 transition hover:bg-gold/15 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 5h2v14H6zM20 5v14l-9-7z" />
              </svg>
            </button>

            {/* Play / Pause */}
            <button
              onClick={togglePause}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 text-ink shadow-lg shadow-gold/20 transition hover:shadow-xl active:scale-95"
            >
              {audioPaused ? (
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              )}
            </button>

            {/* Next */}
            <button
              onClick={playNext}
              disabled={
                currentIdx < 0 || currentIdx >= (surah?.ayat.length ?? 1) - 1
              }
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-parchment-3 transition hover:bg-gold/15 hover:text-parchment disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M16 5h2v14h-2zM4 5v14l9-7z" />
              </svg>
            </button>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-parchment">
                {surah.namaLatin}
                {playingAyah !== null && (
                  <span className="text-parchment-3">
                    {" "}
                    · Ayat {playingAyah}
                  </span>
                )}
              </p>
              <p className="truncate text-[11px] text-parchment-3">
                {QARI_LIST.find((q) => q.key === qari)?.name}
              </p>
            </div>

            {/* Stop */}
            <button
              onClick={stopAudio}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/10 text-parchment-3 transition hover:bg-gold/15 hover:text-parchment"
            >
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
