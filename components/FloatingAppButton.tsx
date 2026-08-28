"use client";

import { useState, type ReactNode } from "react";

interface FloatingAppButtonProps {
  onClick?: () => void;
  icon: ReactNode;
  label: string;
  color?: "emerald" | "gold" | "blue";
  delay?: string;
}

const colorMap = {
  emerald: {
    bg: "from-emerald-js via-emerald-js-2 to-emerald-js-3",
    shadow: "shadow-emerald-js/30 hover:shadow-emerald-js/40",
    ring: "border-emerald-js/30",
    ring2: "border-emerald-js/20",
  },
  gold: {
    bg: "from-gold-2 via-gold to-gold-3",
    shadow: "shadow-gold/30 hover:shadow-gold/40",
    ring: "border-gold/30",
    ring2: "border-gold/20",
  },
  blue: {
    bg: "from-sky-500 via-sky-600 to-sky-700",
    shadow: "shadow-sky-500/30 hover:shadow-sky-500/40",
    ring: "border-sky-500/30",
    ring2: "border-sky-500/20",
  },
};

export function FloatingAppButton({
  onClick,
  icon,
  label,
  color = "emerald",
  delay = "0ms",
}: FloatingAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const c = colorMap[color];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`pointer-events-auto group relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${c.bg} text-white shadow-lg ${c.shadow} transition-all duration-300 hover:scale-110 active:scale-95 sm:h-14 sm:w-14`}
      style={{ animationDelay: delay }}
      aria-label={`Buka ${label}`}
    >
      {/* Pulse rings */}
      <div className={`absolute inset-0 rounded-full border-2 ${c.ring} animate-ping [animation-duration:2s] opacity-50`} />

      {/* Icon */}
      <div className="transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>

      {/* Tooltip */}
      <div
        className={`absolute right-full mr-3 whitespace-nowrap rounded-xl bg-ink/90 px-4 py-2 text-sm font-medium text-parchment shadow-lg backdrop-blur-sm transition-all duration-300 ${
          isHovered ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
        }`}
      >
        {label}
        <div className="absolute right-0 top-1/2 -mr-1 -translate-y-1/2 border-4 border-transparent border-l-ink/90" />
      </div>
    </button>
  );
}

// ─── Icons ───

export function PrayerIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      {/* Person praying (sujud) */}
      <circle cx="12" cy="5" r="2" />
      <path d="M8 21v-4a4 4 0 018 0v4" />
      <path d="M6 13c2-1 4-1 6 0s4 1 6 0" strokeLinecap="round" />
      {/* Prayer mat line */}
      <path d="M4 20h16" strokeLinecap="round" strokeDasharray="2 2" />
    </svg>
  );
}

export function CompassIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      {/* Outer circle */}
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="8" />
      {/* Cardinal marks */}
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" strokeLinecap="round" />
      {/* Compass needle */}
      <polygon points="12,5 14,11 12,10 10,11" fill="currentColor" opacity={0.8} />
      <polygon points="12,19 14,13 12,14 10,13" fill="currentColor" opacity={0.3} />
      {/* Center dot */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function CalculatorIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      {/* Calculator body */}
      <rect x="4" y="2" width="16" height="20" rx="2" />
      {/* Screen */}
      <rect x="6" y="4" width="12" height="5" rx="1" fill="currentColor" opacity={0.2} />
      {/* Buttons */}
      <circle cx="8" cy="13" r="1" fill="currentColor" />
      <circle cx="12" cy="13" r="1" fill="currentColor" />
      <circle cx="16" cy="13" r="1" fill="currentColor" />
      <circle cx="8" cy="17" r="1" fill="currentColor" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
      <circle cx="16" cy="17" r="1" fill="currentColor" />
      <circle cx="8" cy="21" r="1" fill="currentColor" />
      <circle cx="12" cy="21" r="1" fill="currentColor" />
      <circle cx="16" cy="21" r="1" fill="currentColor" />
    </svg>
  );
}

export function QuranIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      {/* Book shape */}
      <path d="M4 4h4c2 0 2 1 2 2v14c0-1 0-2-2-2H4V4z" />
      <path d="M20 4h-4c-2 0-2 1-2 2v14c0-1 0-2 2-2h4V4z" />
      {/* Spine */}
      <path d="M12 6v14" />
      {/* Star on cover */}
      <circle cx="8" cy="10" r="2" fill="currentColor" opacity={0.3} />
      <circle cx="16" cy="10" r="2" fill="currentColor" opacity={0.3} />
    </svg>
  );
}

export function DuaIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      {/* Hands praying */}
      <path d="M7 15c-1-2-1-4 0-6 1-1 2-1 3 0" strokeLinecap="round" />
      <path d="M17 15c1-2 1-4 0-6-1-1-2-1-3 0" strokeLinecap="round" />
      {/* Light rays above */}
      <path d="M12 3v3" strokeLinecap="round" />
      <path d="M9 5l1 2" strokeLinecap="round" />
      <path d="M15 5l-1 2" strokeLinecap="round" />
      {/* Base */}
      <path d="M5 18h14" strokeLinecap="round" />
      <path d="M8 18v2M16 18v2" strokeLinecap="round" />
    </svg>
  );
}

export function KitabIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      {/* Open book */}
      <path d="M12 5c-2-1.5-5-1.5-7 0v13c2-1.5 5-1.5 7 0 2-1.5 5-1.5 7 0V5c-2-1.5-5-1.5-7 0z" strokeLinejoin="round" />
      <path d="M12 5v13" />
      {/* Text lines */}
      <path d="M8.5 9h0M9.5 9h0M8.5 12h0M9.5 12h0M14.5 9h0M15.5 9h0M14.5 12h0M15.5 12h0" strokeLinecap="round" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className}>
      {/* Calendar body */}
      <rect x="3" y="4" width="18" height="18" rx="2" />
      {/* Top hooks */}
      <path d="M8 2v4M16 2v4" strokeLinecap="round" />
      {/* Header line */}
      <path d="M3 9h18" />
      {/* Grid */}
      <path d="M8 13h1v1H8zM12 13h1v1h-1zM16 13h1v1h-1z" fill="currentColor" />
      <path d="M8 17h1v1H8zM12 17h1v1h-1zM16 17h1v1h-1z" fill="currentColor" />
      {/* Crescent */}
      <circle cx="12" cy="7" r="1" fill="currentColor" opacity={0.4} />
    </svg>
  );
}
