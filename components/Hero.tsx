import { ScrollLink } from "./ScrollLink";
import { GreenOrnament } from "./GreenOrnament";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Green Islamic glow */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -left-24 top-16 h-56 w-56 rounded-full bg-emerald-js/25 blur-3xl" />
        <div className="absolute -right-16 -top-10 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
      </div>

      {/* Floating ornaments */}
      <div className="pointer-events-none absolute left-6 top-24 hidden opacity-40 sm:block">
        <GreenOrnament className="animate-float h-16 w-16 text-emerald-js-2" />
      </div>
      <div className="pointer-events-none absolute right-6 top-40 hidden opacity-30 sm:block">
        <GreenOrnament className="animate-glow h-12 w-12 text-emerald-js/70" />
      </div>

      <div className="shell relative flex flex-col items-center pb-16 pt-16 text-center sm:pb-24 sm:pt-24">
        <span className="reveal inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.25em] text-gold-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Komunitas Shalawat & Doa
        </span>

        <h1 className="reveal mt-7 font-display text-[2.9rem] font-semibold leading-[1.04] tracking-tight text-parchment">
          Jagad <span className="text-gradient-gold italic">Shalawat</span>
        </h1>

        <div className="reveal mt-6 flex items-center gap-3">
          <span className="gold-line h-px w-10 sm:w-14" />
          <GreenOrnament className="animate-glow h-7 w-7 text-emerald-js" />
          <span className="gold-line h-px w-10 sm:w-14" />
        </div>

        <p className="reveal mt-6 max-w-xl text-[15px] leading-relaxed text-parchment-2 sm:text-lg">
          Menjaga keberkahan madrasah, santri, dan program kebaikan yang kami
          amanahkan. Setiap donasi tercatat transparan dan disampaikan dengan
          penuh ketulusan.
        </p>

        <div className="reveal mt-9 grid w-full max-w-sm gap-3">
          <ScrollLink
            href="#donasi"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-8 py-3.5 text-sm font-semibold text-ink shadow-lg shadow-gold/25 transition hover:brightness-110 active:scale-[0.98]"
          >
            Donasi & Catat Kas
          </ScrollLink>
          <ScrollLink
            href="#riwayat"
            className="inline-flex items-center justify-center rounded-full border border-gold/30 bg-gold/[0.03] px-8 py-3.5 text-sm font-medium text-parchment transition hover:bg-gold/10 hover:text-gold-2"
          >
            Lihat Riwayat
          </ScrollLink>
        </div>
      </div>
    </section>
  );
}
