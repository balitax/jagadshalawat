import Link from "next/link";
import { GreenOrnament } from "./GreenOrnament";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-js/20 blur-[100px]" />
        <div className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-gold/15 blur-[80px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-js/10 blur-[120px]" />
      </div>

      {/* Floating ornaments */}
      <div className="pointer-events-none absolute left-12 top-28 hidden opacity-30 xl:block">
        <GreenOrnament className="animate-float h-20 w-20 text-emerald-js-2" />
      </div>
      <div className="pointer-events-none absolute right-16 top-44 hidden opacity-20 xl:block">
        <GreenOrnament className="animate-glow h-14 w-14 text-emerald-js/60" />
      </div>
      <div className="pointer-events-none absolute bottom-20 left-1/4 hidden opacity-15 xl:block">
        <GreenOrnament className="animate-float h-10 w-10 text-gold/40 delay-5" />
      </div>

      <div className="shell relative flex flex-col items-center pb-20 pt-20 text-center sm:pt-28 lg:pt-32">
        {/* Badge */}
        <span className="animate-fade-up inline-flex items-center gap-2.5 rounded-full border border-gold/25 bg-gold/5 px-5 py-2 text-xs font-medium uppercase tracking-[0.25em] text-gold-2 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
          </span>
          Komunitas Dzikir & Shalawat
        </span>

        {/* Title */}
        <h1 className="animate-fade-up delay-1 mt-8 font-display text-5xl font-bold leading-[1.05] tracking-tight text-parchment sm:text-6xl lg:text-7xl">
          Jagad{" "}
          <span className="text-gradient-gold italic">Shalawat</span>
        </h1>

        {/* Divider */}
        <div className="animate-fade-up delay-2 mt-7 flex items-center gap-4">
          <span className="gold-line h-px w-16 sm:w-24" />
          <GreenOrnament className="animate-glow h-8 w-8 text-emerald-js" />
          <span className="gold-line h-px w-16 sm:w-24" />
        </div>

        {/* Description */}
        <p className="animate-fade-up delay-3 mt-7 max-w-2xl text-base leading-relaxed text-parchment-2 sm:text-lg lg:text-xl">
          Komunitas dzikir dan shalawat yang menjaga keberkahan madrasah, santri,
          dan program kebaikan. Jadwal kegiatan, donasi, dan dokumentasi tercatat
          transparan di satu tempat.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up delay-4 mt-10 grid w-full max-w-md gap-4 sm:grid-cols-2">
          <Link
            href="/jadwal"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-8 py-4 text-sm font-bold text-ink shadow-xl shadow-gold/25 transition hover:shadow-2xl hover:shadow-gold/35 hover:brightness-110 active:scale-[0.98]"
          >
            Lihat Jadwal
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/donasi"
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-gold/[0.04] px-8 py-4 text-sm font-semibold text-parchment backdrop-blur-sm transition hover:border-gold/50 hover:bg-gold/10 hover:text-gold-2 active:scale-[0.98]"
          >
            Donasi Sekarang
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Stats preview */}
        <div className="animate-fade-up delay-5 mt-14 grid grid-cols-3 gap-8 text-center">
          <div>
            <p className="font-display text-2xl font-bold text-gradient-gold sm:text-3xl">50+</p>
            <p className="mt-1 text-xs text-parchment-3 sm:text-sm">Donasi Tercatat</p>
          </div>
          <div className="border-x border-gold/15 px-8">
            <p className="font-display text-2xl font-bold text-gradient-gold sm:text-3xl">Mingguan</p>
            <p className="mt-1 text-xs text-parchment-3 sm:text-sm">Jadwal Rutin</p>
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-gradient-gold sm:text-3xl">100%</p>
            <p className="mt-1 text-xs text-parchment-3 sm:text-sm">Transparan</p>
          </div>
        </div>
      </div>
    </section>
  );
}
