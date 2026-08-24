import Link from "next/link";
import { ScrollLink } from "./ScrollLink";
import { ScheduleBanner } from "./ScheduleBanner";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/10 bg-ink/80 backdrop-blur-2xl">
      <ScheduleBanner />
      <div className="gold-line h-px w-full opacity-40" />
      <nav className="shell flex items-center justify-between py-4">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 font-display text-xl font-semibold text-gold-2 shadow-lg shadow-gold/10 transition group-hover:shadow-gold/20 group-hover:border-gold/50">
            ج
          </span>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-wide leading-tight">
              Jagad<span className="text-gradient-gold"> Shalawat</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-parchment-3">
              Dzikir & Shalawat
            </span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {[
            { href: "/jadwal", label: "Jadwal" },
            { href: "/donasi", label: "Donasi" },
            { href: "/riwayat", label: "Riwayat" },
            { href: "/artikel", label: "Artikel" },
            { href: "/galeri", label: "Galeri" },
          ].map((item) =>
            item.href.startsWith("/") ? (
              <Link
                key={item.href}
                href={item.href}
                className="relative rounded-xl px-4 py-2 text-sm font-medium text-parchment-2 transition hover:text-gold-2 hover:bg-gold/5"
              >
                {item.label}
              </Link>
            ) : (
              <ScrollLink
                key={item.href}
                href={item.href}
                className="relative rounded-xl px-4 py-2 text-sm font-medium text-parchment-2 transition hover:text-gold-2 hover:bg-gold/5"
              >
                {item.label}
              </ScrollLink>
            )
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/donasi"
            className="rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-6 py-2.5 text-sm font-bold text-ink shadow-lg shadow-gold/20 transition hover:shadow-xl hover:shadow-gold/30 hover:brightness-110 active:scale-95"
          >
            Donasi Sekarang
          </Link>
        </div>
      </nav>
    </header>
  );
}
