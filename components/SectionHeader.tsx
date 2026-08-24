import { GreenOrnament } from "./GreenOrnament";

export function SectionHeader({
  eyebrow,
  title,
  highlight,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle?: string;
}) {
  return (
    <div className="reveal mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-2">
        <span className="h-1 w-1 rounded-full bg-gold" />
        {eyebrow}
      </span>

      <h2 className="mt-6 font-display text-4xl font-bold leading-tight text-parchment sm:text-5xl lg:text-6xl">
        {title} <span className="text-gradient-gold">{highlight}</span>
      </h2>

      {subtitle && (
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-parchment-2 sm:text-lg">
          {subtitle}
        </p>
      )}

      <div className="mx-auto mt-7 flex items-center justify-center gap-4">
        <span className="gold-line h-px w-16 sm:w-20" />
        <GreenOrnament className="h-7 w-7 text-emerald-js" />
        <span className="gold-line h-px w-16 sm:w-20" />
      </div>
    </div>
  );
}
