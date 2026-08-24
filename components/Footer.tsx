import Link from "next/link";
import { ScrollLink } from "./ScrollLink";
import { GreenOrnament } from "./GreenOrnament";

export function Footer() {
  return (
    <footer className="relative border-t border-gold/10 bg-ink-2/60 backdrop-blur">
      <div className="gold-line h-px w-full opacity-50" />

      <div className="shell py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 font-display text-xl font-bold text-gold-2 transition group-hover:border-gold/50">
                ج
              </span>
              <div>
                <span className="font-display text-xl font-bold tracking-wide">
                  Jagad<span className="text-gradient-gold"> Shalawat</span>
                </span>
                <p className="text-[10px] uppercase tracking-[0.2em] text-parchment-3">
                  Dzikir & Shalawat
                </p>
              </div>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-parchment-3">
              Komunitas dzikir dan shalawat — menjaga amanah kas, menjalin ukhuwah,
              dan mendukung madrasah santri lewat ketulusan setiap dermawan.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="gold-line h-px w-8" />
              <GreenOrnament className="h-5 w-5 text-emerald-js/50" />
              <span className="gold-line h-px w-8" />
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="font-display text-base font-bold text-parchment">Navigasi</h4>
            <ul className="mt-4 space-y-3 text-sm text-parchment-3">
              {[
                { href: "/jadwal", label: "Jadwal Kegiatan" },
                { href: "/donasi", label: "Donasi" },
                { href: "/riwayat", label: "Riwayat Donasi" },
                { href: "/artikel", label: "Artikel & Pengumuman" },
                { href: "/galeri", label: "Galeri Foto" },
              ].map((item) => (
                <li key={item.href}>
                  {item.href.startsWith("/") ? (
                    <Link href={item.href} className="transition hover:text-gold-2">
                      {item.label}
                    </Link>
                  ) : (
                    <ScrollLink href={item.href} className="transition hover:text-gold-2">
                      {item.label}
                    </ScrollLink>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Amanah */}
          <div>
            <h4 className="font-display text-base font-bold text-parchment">Amanah Kebaikan</h4>
            <p className="mt-4 text-sm leading-relaxed text-parchment-3 italic">
              &ldquo;Sekecil apa pun kebaikan yang disalurkan akan tercatat dan
              dimuliakan.&rdquo;
            </p>
            <Link
              href="/admin"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/30 px-5 py-2.5 text-xs font-semibold text-parchment transition hover:border-gold/50 hover:bg-gold/10 hover:text-gold-2"
            >
              Panel Pengurus
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-gold/10 py-6 text-center text-xs text-parchment-3">
        © {new Date().getFullYear()} Jagad Shalawat — Dibuat dengan ketulusan dan
        amanah.
      </div>
    </footer>
  );
}
