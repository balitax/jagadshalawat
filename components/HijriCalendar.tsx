"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

// ─── Hijri Date Conversion ───
const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabiul Awal", "Rabiul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah",
];

const HIJRI_MONTHS_ID = [
  "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadhan", "Syawal", "Dzulqa'dah", "Dzulhijjah",
];

const GREG_MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAYS_FULL = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const DAYS = ["Ah", "Sn", "Sl", "Rb", "Km", "Jm", "Sb"];

function gregorianToHijri(year: number, month: number, day: number) {
  const jd = Math.floor(
    (1461 * (year + 4800 + Math.floor((month - 14) / 12))) / 4 +
      Math.floor((367 * (month - 2 - 12 * Math.floor((month - 14) / 12))) / 12) -
      Math.floor((3 * Math.floor((year + 4900 + Math.floor((month - 14) / 12)) / 100)) / 4) +
      day - 32075
  );
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const r = l - 10631 * n + 354;
  const j = Math.floor((10985 - r) / 5316) * Math.floor((50 * r) / 17719) +
    Math.floor(r / 5670) * Math.floor((43 * r) / 15238);
  const rj = r - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  return { year: 30 * n + j - 30, month: Math.floor((24 * rj) / 709), day: rj - Math.floor((709 * Math.floor((24 * rj) / 709)) / 24) };
}

function hijriToGregorian(year: number, month: number, day: number) {
  const jd = Math.floor((11 * year + 3) / 30) + 354 * year + 30 * month -
    Math.floor((month - 1) / 2) + day + 1948440 - 385;
  const l = jd + 68569;
  const n = Math.floor((4 * l) / 146097);
  const r = l - Math.floor((146097 * n + 3) / 4);
  const i = Math.floor((4000 * (r + 1)) / 1461001);
  const ri = r - Math.floor((1461 * i) / 4) + 31;
  const j = Math.floor((80 * ri) / 2447);
  const rj = Math.floor(j / 11);
  return {
    year: 100 * (n - 49) + i + rj,
    month: j + 2 - 12 * rj,
    day: ri - Math.floor((2447 * j) / 80),
  };
}

function getDaysInHijriMonth(y: number, m: number) {
  const nm = m >= 12 ? 1 : m + 1;
  const ny = m >= 12 ? y + 1 : y;
  const g1 = hijriToGregorian(y, m, 1);
  const g2 = hijriToGregorian(ny, nm, 1);
  return Math.round((new Date(g2.year, g2.month - 1, g2.day).getTime() - new Date(g1.year, g1.month - 1, g1.day).getTime()) / 86400000);
}

function getFirstDayOfMonthHijri(y: number, m: number) {
  const g = hijriToGregorian(y, m, 1);
  return new Date(g.year, g.month - 1, g.day).getDay();
}

function toGregDate(hy: number, hm: number, hd: number) {
  const g = hijriToGregorian(hy, hm, hd);
  return new Date(g.year, g.month - 1, g.day);
}

function fmtGreg(d: Date) {
  return `${d.getDate()} ${GREG_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const IMPORTANT_DATES: Record<string, string> = {
  "1-1": "Tahun Baru Hijriah",
  "3-12": "Maulid Nabi",
  "9-1": "Isra Mi'raj",
  "10-1": "Asyura",
  "15-8": "Nisfu Sya'ban",
  "1-9": "Awal Ramadhan",
  "27-9": "Lailatul Qadr",
  "1-10": "Idul Fitri",
  "9-12": "Arafah",
  "10-12": "Idul Adha",
};

interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  time: string | null;
  type: "sholawat" | "dzikir" | "event" | "meeting";
}

interface HijriCalendarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HijriCalendar({ isOpen, onClose }: HijriCalendarProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const now = new Date();
  const ht = gregorianToHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());

  // Calendar mode: "hijri" or "greg"
  const [mode, setMode] = useState<"hijri" | "greg">("hijri");

  // Hijri view state
  const [hijriMonth, setHijriMonth] = useState(ht.month);
  const [hijriYear, setHijriYear] = useState(ht.year);

  // Gregorian view state
  const [gregMonth, setGregMonth] = useState(now.getMonth());
  const [gregYear, setGregYear] = useState(now.getFullYear());

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [tab, setTab] = useState<"calendar" | "events">("calendar");

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/schedules?all=true", { cache: "no-store" })
      .then(r => r.json())
      .then(d => setSchedules(d.schedules || []))
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  // Schedule map by date string
  const scheduleMap = new Map<string, ScheduleItem[]>();
  schedules.forEach(s => {
    const arr = scheduleMap.get(s.date) || [];
    arr.push(s);
    scheduleMap.set(s.date, arr);
  });

  // Current view helpers
  const isHijri = mode === "hijri";
  const viewMonthName = isHijri ? HIJRI_MONTHS_ID[hijriMonth - 1] : GREG_MONTHS[gregMonth];
  const viewDaysInMonth = isHijri ? getDaysInHijriMonth(hijriYear, hijriMonth) : new Date(gregYear, gregMonth + 1, 0).getDate();
  const viewFirstDay = isHijri ? getFirstDayOfMonthHijri(hijriYear, hijriMonth) : new Date(gregYear, gregMonth, 1).getDay();

  // Month start in Gregorian for event filtering
  const monthStartGreg = isHijri ? toGregDate(hijriYear, hijriMonth, 1) : new Date(gregYear, gregMonth, 1);
  const monthEndGreg = isHijri
    ? toGregDate(hijriYear, hijriMonth, viewDaysInMonth)
    : new Date(gregYear, gregMonth + 1, 0);

  // Events for current month
  const monthEvents = schedules.filter(s => {
    const d = new Date(s.date + "T00:00:00");
    return d >= monthStartGreg && d <= monthEndGreg;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const prevMonth = () => {
    if (isHijri) {
      if (hijriMonth === 1) { setHijriMonth(12); setHijriYear(hijriYear - 1); }
      else setHijriMonth(hijriMonth - 1);
    } else {
      if (gregMonth === 0) { setGregMonth(11); setGregYear(gregYear - 1); }
      else setGregMonth(gregMonth - 1);
    }
    setSelected(null);
  };

  const nextMonth = () => {
    if (isHijri) {
      if (hijriMonth === 12) { setHijriMonth(1); setHijriYear(hijriYear + 1); }
      else setHijriMonth(hijriMonth + 1);
    } else {
      if (gregMonth === 11) { setGregMonth(0); setGregYear(gregYear + 1); }
      else setGregMonth(gregMonth + 1);
    }
    setSelected(null);
  };

  const goToday = () => {
    setHijriMonth(ht.month);
    setHijriYear(ht.year);
    setGregMonth(now.getMonth());
    setGregYear(now.getFullYear());
    setSelected(null);
  };

  const switchMode = () => {
    setMode(isHijri ? "greg" : "hijri");
    setSelected(null);
  };

  // Build grid
  const cells: { day: number; greg: Date; hijri: { y: number; m: number; d: number } }[] = [];
  const monthStart = isHijri ? toGregDate(hijriYear, hijriMonth, 1) : new Date(gregYear, gregMonth, 1);

  // Pad start
  for (let i = 0; i < viewFirstDay; i++) {
    const d = new Date(monthStart);
    d.setDate(d.getDate() - (viewFirstDay - i));
    const h = gregorianToHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
    cells.push({ day: 0, greg: d, hijri: { y: h.year, m: h.month, d: h.day } });
  }
  // Days
  for (let d = 1; d <= viewDaysInMonth; d++) {
    const greg = isHijri ? toGregDate(hijriYear, hijriMonth, d) : new Date(gregYear, gregMonth, d);
    const hijri = gregorianToHijri(greg.getFullYear(), greg.getMonth() + 1, greg.getDate());
    cells.push({ day: d, greg, hijri: { y: hijri.year, m: hijri.month, d: hijri.day } });
  }
  // Pad end
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].greg;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    const h = gregorianToHijri(next.getFullYear(), next.getMonth() + 1, next.getDate());
    cells.push({ day: 0, greg: next, hijri: { y: h.year, m: h.month, d: h.day } });
  }

  // Today in both calendars
  const todayHijri = ht;
  const todayGreg = { day: now.getDate(), month: now.getMonth(), year: now.getFullYear() };

  // Selected day data
  const selData = selected !== null ? (() => {
    const cell = cells.find(c => c.day === selected);
    if (!cell) return null;
    const key = `${cell.greg.getFullYear()}-${String(cell.greg.getMonth()+1).padStart(2,"0")}-${String(cell.greg.getDate()).padStart(2,"0")}`;
    const hijriKey = `${cell.hijri.d}-${cell.hijri.m}`;
    return {
      greg: cell.greg,
      hijri: cell.hijri,
      events: scheduleMap.get(key) || [],
      important: IMPORTANT_DATES[hijriKey],
    };
  })() : null;

  const TYPE_COLORS: Record<string, string> = {
    sholawat: "bg-emerald-400",
    dzikir: "bg-amber-400",
    event: "bg-blue-400",
    meeting: "bg-purple-400",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-gold/10 bg-ink shadow-2xl">
        <div className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cg fill='none' stroke='%23157a52' stroke-width='0.5'%3E%3Cpath d='M30 0v60M0 30h60'/%3E%3Ccircle cx='30' cy='30' r='10' opacity='0.4'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        {/* ── Header ── */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-js/20 via-emerald-js/12 to-emerald-js/20 px-5 pt-5 pb-4">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d3ad57' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-emerald-js">Kalender</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-parchment">{viewMonthName}</h2>
              <p className="mt-0.5 text-sm text-parchment-3">
                {isHijri ? `${hijriYear} H` : `${gregYear} M`}
                <span className="mx-1.5 text-white/20">·</span>
                <span className="text-xs text-parchment-3">
                  {isHijri ? `${monthStartGreg.getDate()} ${GREG_MONTHS[monthStartGreg.getMonth()]} ${monthStartGreg.getFullYear()}` : `${ht.day} ${HIJRI_MONTHS[ht.month - 1]} ${ht.year} H`}
                </span>
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1.5 backdrop-blur-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-js animate-pulse" />
                  <span className="text-xs font-medium text-parchment">Hari Ini</span>
                </div>
                <p className="mt-2 text-xs text-parchment-3">{DAYS_FULL[now.getDay()]}, {fmtGreg(now)}</p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-parchment-3 backdrop-blur-sm transition hover:bg-gold/20 hover:text-parchment"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Tabs + Mode Toggle */}
          <div className="relative mt-4 flex items-center gap-2">
            <div className="flex flex-1 gap-1 rounded-xl bg-ink-3 p-1">
              <button
                onClick={() => setTab("calendar")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                  tab === "calendar" ? "bg-gold/15 text-gold-2 shadow-sm" : "text-parchment-3 hover:text-parchment"
                }`}
              >
                Kalender
              </button>
              <button
                onClick={() => setTab("events")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-medium transition-all ${
                  tab === "events" ? "bg-gold/15 text-gold-2 shadow-sm" : "text-parchment-3 hover:text-parchment"
                }`}
              >
                Kegiatan ({monthEvents.length})
              </button>
            </div>
            <button
              onClick={switchMode}
              className="flex h-8 items-center gap-1.5 rounded-xl bg-gold/10 px-3 text-[10px] font-semibold uppercase tracking-wider text-parchment-3 transition hover:bg-gold/15 hover:text-parchment"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
              {isHijri ? "Masehi" : "Hijriah"}
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-4">
          {tab === "calendar" ? (
            <>
              {/* Month Nav */}
              <div className="flex items-center justify-between">
                <button onClick={prevMonth} className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/5 text-parchment-3 transition hover:bg-gold/10 hover:text-parchment">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={goToday} className="group flex flex-col items-center rounded-xl px-4 py-1 transition hover:bg-gold/5">
                  <span className="text-sm font-semibold text-parchment">{viewMonthName}</span>
                  <span className="text-[10px] text-parchment-3 group-hover:text-parchment">
                    {isHijri ? `${hijriYear} H · ${monthStartGreg.getFullYear()} M` : `${gregYear} M · ${ht.year} H`}
                  </span>
                </button>
                <button onClick={nextMonth} className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/5 text-parchment-3 transition hover:bg-gold/10 hover:text-parchment">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              {/* Day Headers */}
              <div className="mt-3 grid grid-cols-7 gap-1">
                {DAYS.map((d, i) => (
                  <div key={d} className={`py-1.5 text-center text-[10px] font-semibold uppercase ${i === 5 ? "text-emerald-js" : "text-parchment-3"}`}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="mt-1 grid grid-cols-7 gap-1">
                {cells.map((c, i) => {
                  if (c.day === 0) {
                    return (
                      <div key={`p${i}`} className="aspect-square flex items-center justify-center">
                        <span className="text-[10px] text-parchment-3/50">{isHijri ? c.greg.getDate() : c.hijri.d}</span>
                      </div>
                    );
                  }

                  const isToday = isHijri
                    ? c.hijri.d === todayHijri.day && c.hijri.m === todayHijri.month && c.hijri.y === todayHijri.year
                    : c.day === todayGreg.day && c.greg.getMonth() === todayGreg.month && c.greg.getFullYear() === todayGreg.year;

                  const gregKey = `${c.greg.getFullYear()}-${String(c.greg.getMonth()+1).padStart(2,"0")}-${String(c.greg.getDate()).padStart(2,"0")}`;
                  const hasEvent = scheduleMap.has(gregKey);
                  const hijriKey = `${c.hijri.d}-${c.hijri.m}`;
                  const isImportant = !!IMPORTANT_DATES[hijriKey];
                  const isSelected = selected === c.day;

                  return (
                    <button
                      key={c.day}
                      onClick={() => setSelected(isSelected ? null : c.day)}
                      className={`relative aspect-square rounded-xl text-center transition-all duration-200 ${
                        isToday
                          ? "bg-gradient-to-b from-emerald-js to-emerald-js-2 text-white font-bold shadow-lg shadow-emerald-js/30"
                          : isSelected
                          ? "bg-gold/10 text-parchment ring-1 ring-gold/20"
                          : "text-parchment hover:bg-gold/5"
                      }`}
                    >
                      <span className="flex flex-col items-center justify-center">
                        <span className="text-sm">{c.day}</span>
                        <span className={`text-[8px] leading-none ${isToday ? "text-white/60" : "text-parchment-3"}`}>
                          {isHijri ? c.greg.getDate() : c.hijri.d}
                        </span>
                      </span>
                      {(hasEvent || isImportant) && !isToday && (
                        <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${hasEvent ? "bg-emerald-js" : "bg-gold"}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Detail */}
              {selData && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-gold/10 bg-ink-2">
                  <div className="border-b border-gold/10 bg-ink-3 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-parchment">
                          {selData.hijri.d} {HIJRI_MONTHS[selData.hijri.m - 1]} {selData.hijri.y} H
                        </p>
                        <p className="text-[11px] text-parchment-3">
                          {DAYS_FULL[selData.greg.getDay()]}, {fmtGreg(selData.greg)} M
                        </p>
                      </div>
                      {selData.important && (
                        <span className="rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-semibold text-gold-2">
                          {selData.important}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    {selData.events.length > 0 ? (
                      <div className="space-y-2">
                        {selData.events.map(ev => (
                          <div key={ev.id} className="flex items-start gap-3 rounded-xl bg-ink-3 p-3 transition hover:bg-gold/5">
                            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${TYPE_COLORS[ev.type] || "bg-parchment-3"}`} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-parchment truncate">{ev.title}</p>
                              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-parchment-3">
                                {ev.time && <span>{ev.time}</span>}
                                {ev.time && <span>·</span>}
                                <span className="capitalize">{ev.type}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-4 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/10">
                          <svg className="h-5 w-5 text-parchment-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                        </div>
                        <p className="mt-2 text-xs text-parchment-3">Tidak ada kegiatan</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-parchment-3">
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-js" /> Hari ini</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-gold" /> Penting</span>
                <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-js/60" /> Kegiatan</span>
              </div>
            </>
          ) : (
            /* ── Events Tab ── */
            <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
              {monthEvents.length > 0 ? monthEvents.map(ev => {
                const d = new Date(ev.date + "T00:00:00");
                const hijri = gregorianToHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
                return (
                  <div key={ev.id} className="flex items-start gap-3 rounded-xl bg-ink-2 p-3 transition hover:bg-ink-3">
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-gold/10">
                      <span className="text-[10px] font-bold text-parchment">{d.getDate()}</span>
                      <span className="text-[8px] text-parchment-3">{GREG_MONTHS[d.getMonth()].slice(0, 3)}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-parchment truncate">{ev.title}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-parchment-3">
                        {ev.time && <span>{ev.time}</span>}
                        <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                          ev.type === "sholawat" ? "bg-emerald-js/15 text-emerald-js" :
                          ev.type === "dzikir" ? "bg-gold/15 text-gold-2" :
                          ev.type === "event" ? "bg-blue-500/15 text-blue-400" :
                          "bg-purple-500/15 text-purple-400"
                        }`}>
                          {ev.type}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-parchment-3">{hijri.day} {HIJRI_MONTHS[hijri.month - 1]} {hijri.year} H</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                    <svg className="h-6 w-6 text-parchment-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                  </div>
                  <p className="mt-3 text-sm text-parchment-3">Belum ada kegiatan bulan ini</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex shrink-0 gap-2 border-t border-gold/10 bg-ink-2/50 px-4 py-3">
          <button
            onClick={goToday}
            className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gold/10 px-4 text-sm font-medium text-parchment-3 transition hover:bg-gold/15 hover:text-parchment"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Hari Ini
          </button>
          <button
            onClick={onClose}
            className="flex h-10 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-gold-2 via-gold to-gold-3 text-sm font-semibold text-ink shadow-lg shadow-gold/20 transition hover:shadow-xl hover:shadow-gold/30 active:scale-[0.98]"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
