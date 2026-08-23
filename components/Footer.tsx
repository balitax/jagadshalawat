import Link from "next/link";
import { ScrollLink } from "./ScrollLink";

export function Footer() {
  return (
    <footer className="relative mt-8 border-t border-gold/10 bg-ink-2/60 backdrop-blur">
      <div className="gold-line h-px w-full opacity-50" />
      <div className="shell grid gap-8 py-12">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-gold/10 font-display text-lg font-semibold text-gold-2">
              ج
            </span>
            <span className="font-display text-xl font-semibold tracking-wide">
              Jagad<span className="text-gradient-gold"> Shalawat</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-parchment-3">
            Komunitas shalawat dan doa — menjaga amanah kas serta mendukung
            madrasah santri lewat ketulusan setiap dermawan.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold text-parchment">Navigasi</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-parchment-3">
            <li>
              <ScrollLink href="#rekening" className="transition hover:text-gold-2">
                Rekening & Kanal
              </ScrollLink>
            </li>
            <li>
              <ScrollLink href="#donasi" className="transition hover:text-gold-2">
                Catat Kas / Donasi
              </ScrollLink>
            </li>
            <li>
              <ScrollLink href="#riwayat" className="transition hover:text-gold-2">
                Riwayat Donasi
              </ScrollLink>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-semibold text-parchment">Amanah Kebaikan</h4>
          <p className="mt-4 text-sm leading-relaxed text-parchment-3">
            “Sekecil apa pun kebaikan yang disalurkan akan tercatat dan
            dimuliakan.”
          </p>
          <Link
            href="/admin"
            className="mt-5 inline-block text-xs text-parchment-3 underline decoration-gold/30 underline-offset-2 transition hover:text-gold-2"
          >
            Panel Pengurus →
          </Link>
        </div>
      </div>

      <div className="border-t border-gold/10 py-6 text-center text-xs text-parchment-3">
        © {new Date().getFullYear()} Jagad Shalawat — Dibuat dengan ketulusan dan
        amanah.
      </div>
    </footer>
  );
}
