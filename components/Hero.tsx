"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { GreenOrnament } from "./GreenOrnament";
import dynamic from "next/dynamic";
import { MagneticButton } from "./MagneticButton";

const IslamicPatternBg = dynamic(
  () => import("./IslamicPatternBg").then((mod) => ({ default: mod.IslamicPatternBg })),
  { ssr: false }
);

function useMouseParallax(ref: React.RefObject<HTMLElement | null>, intensity = 0.02) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      setOffset({
        x: (e.clientX - cx) * intensity,
        y: (e.clientY - cy) * intensity,
      });
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [ref, intensity]);

  return offset;
}

function CountUp({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <div ref={ref}>
      <p className="font-display text-2xl font-bold text-gradient-gold sm:text-3xl">
        {count}+
      </p>
      <p className="mt-1 text-xs text-parchment-3 sm:text-sm">Donasi Tercatat</p>
    </div>
  );
}

function CountUpPercent({ target, duration = 2200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <div ref={ref}>
      <p className="font-display text-2xl font-bold text-gradient-gold sm:text-3xl">
        {count}%
      </p>
      <p className="mt-1 text-xs text-parchment-3 sm:text-sm">Transparan</p>
    </div>
  );
}

const PARTICLES = [
  { id: 0, left: "12%", top: "18%", size: 2, delay: 0.3, duration: 5.2, opacity: 0.25 },
  { id: 1, left: "87%", top: "24%", size: 1.5, delay: 1.1, duration: 6.8, opacity: 0.18 },
  { id: 2, left: "45%", top: "8%", size: 2.5, delay: 2.4, duration: 4.5, opacity: 0.3 },
  { id: 3, left: "72%", top: "65%", size: 1.2, delay: 0.8, duration: 7.1, opacity: 0.2 },
  { id: 4, left: "28%", top: "78%", size: 1.8, delay: 3.2, duration: 5.9, opacity: 0.22 },
  { id: 5, left: "93%", top: "52%", size: 2.2, delay: 1.7, duration: 6.3, opacity: 0.15 },
  { id: 6, left: "8%", top: "45%", size: 1.4, delay: 4.0, duration: 4.8, opacity: 0.28 },
  { id: 7, left: "55%", top: "88%", size: 1.6, delay: 0.5, duration: 5.5, opacity: 0.2 },
  { id: 8, left: "35%", top: "35%", size: 2.8, delay: 2.0, duration: 7.5, opacity: 0.12 },
  { id: 9, left: "68%", top: "12%", size: 1.3, delay: 3.5, duration: 6.0, opacity: 0.25 },
  { id: 10, left: "18%", top: "62%", size: 2.0, delay: 1.3, duration: 5.0, opacity: 0.18 },
  { id: 11, left: "82%", top: "75%", size: 1.7, delay: 2.8, duration: 4.3, opacity: 0.3 },
  { id: 12, left: "50%", top: "20%", size: 1.1, delay: 0.2, duration: 6.5, opacity: 0.22 },
  { id: 13, left: "3%", top: "90%", size: 2.3, delay: 4.5, duration: 5.8, opacity: 0.15 },
  { id: 14, left: "76%", top: "40%", size: 1.9, delay: 1.9, duration: 7.2, opacity: 0.28 },
  { id: 15, left: "40%", top: "55%", size: 1.4, delay: 3.8, duration: 4.6, opacity: 0.2 },
  { id: 16, left: "95%", top: "85%", size: 2.6, delay: 0.7, duration: 6.1, opacity: 0.12 },
  { id: 17, left: "22%", top: "5%", size: 1.0, delay: 2.2, duration: 5.4, opacity: 0.25 },
  { id: 18, left: "60%", top: "95%", size: 2.1, delay: 4.2, duration: 4.9, opacity: 0.18 },
  { id: 19, left: "38%", top: "48%", size: 1.5, delay: 1.5, duration: 6.7, opacity: 0.3 },
];

function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gold/30"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const mouse = useMouseParallax(sectionRef, 0.015);

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      <IslamicPatternBg />
      <FloatingParticles />

      {/* Background glows — parallax */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-emerald-js/20 blur-[100px] transition-transform duration-300"
          style={{ transform: `translate(${mouse.x * 2}px, ${mouse.y * 2}px)` }}
        />
        <div
          className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-gold/15 blur-[80px] transition-transform duration-300"
          style={{ transform: `translate(${mouse.x * -1.5}px, ${mouse.y * -1.5}px)` }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-js/10 blur-[120px] transition-transform duration-300"
          style={{ transform: `translate(-50%, -50%) translate(${mouse.x}px, ${mouse.y}px)` }}
        />
      </div>

      {/* Floating ornaments — parallax */}
      <div
        className="pointer-events-none absolute left-12 top-28 hidden opacity-30 xl:block transition-transform duration-300"
        style={{ transform: `translate(${mouse.x * 3}px, ${mouse.y * 3}px)` }}
      >
        <GreenOrnament className="animate-float h-20 w-20 text-emerald-js-2" />
      </div>
      <div
        className="pointer-events-none absolute right-16 top-44 hidden opacity-20 xl:block transition-transform duration-300"
        style={{ transform: `translate(${mouse.x * -2.5}px, ${mouse.y * -2.5}px)` }}
      >
        <GreenOrnament className="animate-glow h-14 w-14 text-emerald-js/60" />
      </div>
      <div
        className="pointer-events-none absolute bottom-20 left-1/4 hidden opacity-15 xl:block transition-transform duration-300"
        style={{ transform: `translate(${mouse.x * 2}px, ${mouse.y * 2}px)` }}
      >
        <GreenOrnament className="animate-float h-10 w-10 text-gold/40 delay-5" />
      </div>

      <div className="shell relative flex flex-col items-center pb-20 pt-20 text-center sm:pt-28 lg:pt-32">
        {/* Badge with pulse rings */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-full border border-gold/10 animate-ping [animation-duration:3s] opacity-30" />
          <div className="absolute -inset-6 rounded-full border border-gold/5 animate-ping [animation-duration:4s] opacity-20" />
          <span className="animate-fade-up inline-flex items-center gap-2.5 rounded-full border border-gold/25 bg-gold/5 px-5 py-2 text-xs font-medium uppercase tracking-[0.25em] text-gold-2 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            Komunitas Dzikir & Shalawat
          </span>
        </div>

        {/* Title with underline animation */}
        <h1 className="animate-fade-up delay-1 mt-8 font-display text-5xl font-bold leading-[1.05] tracking-tight text-parchment sm:text-6xl lg:text-7xl">
          Jagad{" "}
          <span className="relative inline-block">
            <span className="text-gradient-gold italic">Shalawat</span>
            <span className="absolute -bottom-1 left-0 h-[3px] w-0 animate-[growWidth_1s_ease_0.8s_forwards] rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3" />
          </span>
        </h1>

        {/* Divider */}
        <div className="animate-fade-up delay-2 mt-7 flex items-center gap-4">
          <span className="gold-line h-px w-16 sm:w-24 animate-[growWidth_0.8s_ease_0.6s_forwards] origin-left" />
          <div className="relative">
            <GreenOrnament className="animate-glow h-8 w-8 text-emerald-js" />
            <div className="absolute inset-0 animate-ping [animation-duration:2.5s]">
              <GreenOrnament className="h-8 w-8 text-emerald-js opacity-20" />
            </div>
          </div>
          <span className="gold-line h-px w-16 sm:w-24 animate-[growWidth_0.8s_ease_0.6s_forwards] origin-right" />
        </div>

        {/* Description */}
        <p className="animate-fade-up delay-3 mt-7 max-w-2xl text-base leading-relaxed text-parchment-2 sm:text-lg lg:text-xl">
          Komunitas dzikir dan shalawat yang menjaga keberkahan madrasah, santri,
          dan program kebaikan. Jadwal kegiatan, donasi, dan dokumentasi tercatat
          transparan di satu tempat.
        </p>

        {/* CTAs */}
        <div className="animate-fade-up delay-4 mt-20 grid w-full max-w-md gap-4 sm:grid-cols-2">
          <MagneticButton
            href="/jadwal"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-8 py-4 text-sm font-bold text-ink shadow-xl shadow-gold/25 transition hover:shadow-2xl hover:shadow-gold/35 hover:brightness-110 active:scale-[0.98]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform group-hover:translate-x-full" />
            Lihat Jadwal
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </MagneticButton>
          <MagneticButton
            href="/donasi"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl border border-gold/30 bg-gold/[0.04] px-8 py-4 text-sm font-semibold text-parchment backdrop-blur-sm transition hover:border-gold/50 hover:bg-gold/10 hover:text-gold-2 active:scale-[0.98]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/10 to-transparent transition-transform group-hover:translate-x-full" />
            Donasi Sekarang
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </MagneticButton>
        </div>

        {/* Stats with counter */}
        <div className="animate-fade-up delay-5 mt-14 grid grid-cols-3 gap-8 text-center">
          <CountUp target={50} />
          <div className="border-x border-gold/15 px-8">
            <p className="font-display text-2xl font-bold text-gradient-gold sm:text-3xl">Mingguan</p>
            <p className="mt-1 text-xs text-parchment-3 sm:text-sm">Jadwal Rutin</p>
          </div>
          <CountUpPercent target={100} />
        </div>

        {/* Scroll indicator */}
        <div className="animate-fade-in delay-6 mt-16 flex flex-col items-center gap-2 text-parchment-3 sm:mt-20">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <div className="animate-bounce">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="h-5 w-5 text-gold"
            >
              <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes growWidth {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
