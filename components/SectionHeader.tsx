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
    <div className="reveal mx-auto max-w-2xl text-center">
      <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold-2">
        {eyebrow}
      </span>
      <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-parchment sm:text-5xl">
        {title} <span className="text-gradient-gold">{highlight}</span>
      </h2>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-parchment-2 sm:text-base">
          {subtitle}
        </p>
      )}
      <div className="mx-auto mt-6 flex items-center justify-center gap-3">
        <span className="gold-line h-px w-12" />
        <GreenOrnament className="h-6 w-6 text-emerald-js" />
        <span className="gold-line h-px w-12" />
      </div>
    </div>
  );
}
