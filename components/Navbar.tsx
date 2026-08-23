import Link from "next/link";
import { ScrollLink } from "./ScrollLink";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gold/10 bg-ink/70 backdrop-blur-xl">
      <nav className="shell flex items-center justify-between py-3.5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold/10 font-display text-xl font-semibold text-gold-2 shadow-inner">
            ج
          </span>
          <span className="font-display text-lg font-semibold tracking-wide">
            Jagad<span className="text-gradient-gold"> Shalawat</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <ScrollLink
            href="#donasi"
            className="rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-5 py-2.5 text-sm font-semibold text-ink shadow-lg shadow-gold/20 transition hover:brightness-110 active:scale-95"
          >
            Donasi
          </ScrollLink>
        </div>
      </nav>
    </header>
  );
}
