"use client";

import { useState, useEffect, useCallback } from "react";

interface JadwalItem {
  tanggal: number;
  tanggal_lengkap: string;
  hari: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}

interface JadwalData {
  provinsi: string;
  kabkota: string;
  bulan: number;
  tahun: number;
  bulan_nama: string;
  jadwal: JadwalItem[];
}

const PRAYER_NAMES = [
  { key: "imsak", label: "Imsak" },
  { key: "subuh", label: "Subuh" },
  { key: "terbit", label: "Terbit" },
  { key: "dhuha", label: "Dhuha" },
  { key: "dzuhur", label: "Dzuhur" },
  { key: "ashar", label: "Ashar" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isya", label: "Isya" },
] as const;

const API_BASE = "https://equran.id/api/v2";
const STORAGE_KEY = "jagadshalawat-jadwal-lokasi";

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function getNextPrayer(jadwal: JadwalItem) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const activeKeys = PRAYER_NAMES.filter(
    (p) => p.key !== "imsak" && p.key !== "terbit" && p.key !== "dhuha"
  );

  for (const p of activeKeys) {
    const val = jadwal[p.key as keyof JadwalItem] as string;
    if (val && timeToMinutes(val) > nowMin) {
      const diff = timeToMinutes(val) - nowMin;
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return {
        key: p.key,
        name: p.label,
        time: val,
        countdown: hours > 0 ? `${hours}j ${mins}m` : `${mins}m`,
      };
    }
  }

  return null;
}

interface JadwalSholatProps {
  isOpen: boolean;
  onClose: () => void;
}

type View = "loading" | "province" | "city" | "schedule";

export function JadwalSholat({ isOpen, onClose }: JadwalSholatProps) {
  const [view, setView] = useState<View>("loading");
  const [provinsi, setProvinsi] = useState<string[]>([]);
  const [kabkota, setKabkota] = useState<string[]>([]);
  const [selectedProvinsi, setSelectedProvinsi] = useState("");
  const [selectedKabkota, setSelectedKabkota] = useState("");
  const [jadwalData, setJadwalData] = useState<JadwalData | null>(null);
  const [showBulan, setShowBulan] = useState(false);
  const [search, setSearch] = useState("");
  const [locating, setLocating] = useState(false);

  const fetchJadwal = useCallback(async (prov: string, kota: string) => {
    try {
      const res = await fetch(`${API_BASE}/shalat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provinsi: prov, kabkota: kota }),
      });
      const json = await res.json();
      if (json.code === 200 && json.data) {
        setJadwalData(json.data);
        setSelectedProvinsi(prov);
        setSelectedKabkota(kota);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ provinsi: prov, kabkota: kota })
        );
        setView("schedule");
        return true;
      }
    } catch {
      // silent
    }
    return false;
  }, []);

  const tryAutoLocate = useCallback(async () => {
    setLocating(true);
    try {
      const ipRes = await fetch("https://ipapi.co/json/", {
        signal: AbortSignal.timeout(5000),
      });
      const ipData = await ipRes.json();
      const city = ipData.city || ipData.region || "";

      if (!city) throw new Error("no city");

      const provRes = await fetch(`${API_BASE}/shalat/provinsi`);
      const provJson = await provRes.json();
      const provList: string[] = provJson.data || [];
      setProvinsi(provList);

      const cityLower = city.toLowerCase();

      for (const prov of provList) {
        try {
          const kotaRes = await fetch(`${API_BASE}/shalat/kabkota`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ provinsi: prov }),
          });
          const kotaJson = await kotaRes.json();
          const kotaList: string[] = kotaJson.data || [];

          const match = kotaList.find((k) => {
            const kl = k.toLowerCase();
            return (
              kl === cityLower ||
              kl === `kota ${cityLower}` ||
              kl === `kab. ${cityLower}` ||
              kl.includes(cityLower) ||
              cityLower.includes(kl.replace("kota ", "").replace("kab. ", ""))
            );
          });

          if (match) {
            const ok = await fetchJadwal(prov, match);
            if (ok) {
              setLocating(false);
              return;
            }
          }
        } catch {
          // try next province
        }
      }

      throw new Error("no match");
    } catch {
      setLocating(false);
      try {
        const provRes = await fetch(`${API_BASE}/shalat/provinsi`);
        const provJson = await provRes.json();
        setProvinsi(provJson.data || []);
      } catch {
        setProvinsi([]);
      }
      setView("province");
    }
  }, [fetchJadwal]);

  useEffect(() => {
    if (!isOpen) return;

    setShowBulan(false);
    setSearch("");
    setJadwalData(null);

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { provinsi: sp, kabkota: sk } = JSON.parse(saved);
        fetchJadwal(sp, sk);
        return;
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    tryAutoLocate();
  }, [isOpen, fetchJadwal, tryAutoLocate]);

  if (!isOpen) return null;

  const handleProvinsiSelect = async (prov: string) => {
    setSelectedProvinsi(prov);
    setSearch("");
    try {
      const res = await fetch(`${API_BASE}/shalat/kabkota`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provinsi: prov }),
      });
      const json = await res.json();
      setKabkota(json.data || []);
      setView("city");
    } catch {
      setKabkota([]);
      setView("city");
    }
  };

  const handleKabkotaSelect = async (kota: string) => {
    await fetchJadwal(selectedProvinsi, kota);
  };

  const handleChangeLokasi = () => {
    setView("province");
    setSearch("");
  };

  const today = new Date();
  const todayDate = today.getDate();
  const todayJadwal = jadwalData?.jadwal.find((j) => j.tanggal === todayDate);
  const nextPrayer = todayJadwal ? getNextPrayer(todayJadwal) : null;

  const filteredProvinsi = provinsi.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );
  const filteredKabkota = kabkota.filter((k) =>
    k.toLowerCase().includes(search.toLowerCase())
  );

  const inputClass =
    "w-full rounded-lg bg-ink-3 py-2.5 pl-9 pr-4 text-sm text-parchment placeholder-parchment-3 outline-none ring-1 ring-gold/10 transition focus:ring-gold/30";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-gold/10 bg-ink shadow-2xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-10"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'60\' height=\'60\'%3E%3Cg fill=\'none\' stroke=\'%23a07820\' stroke-width=\'0.5\'%3E%3Cpath d=\'M30 0v60M0 30h60\'/%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'10\' opacity=\'0.4\'/%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        {/* ── Header ── */}
        <div className="relative shrink-0 overflow-hidden border-b border-gold/15 bg-gradient-to-r from-emerald-js/20 via-emerald-js/12 to-emerald-js/20 px-5 pt-4 pb-3">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d3ad57\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-js/15">
                <svg
                  className="h-4 w-4 text-emerald-js"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <circle cx="12" cy="5" r="2" />
                  <path d="M8 21v-4a4 4 0 018 0v4" />
                  <path
                    d="M6 13c2-1 4-1 6 0s4 1 6 0"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 20h16"
                    strokeLinecap="round"
                    strokeDasharray="2 2"
                  />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-parchment-3">
                  Jadwal
                </p>
                <h2 className="font-display text-lg font-bold leading-tight text-parchment">
                  Sholat
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {view === "schedule" && (
                <button
                  onClick={handleChangeLokasi}
                  className="flex h-8 items-center gap-1.5 rounded-full bg-gold/10 px-3 text-[10px] font-semibold uppercase tracking-wider text-parchment-3 transition hover:bg-gold/15 hover:text-parchment"
                >
                  <svg
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                  Ganti
                </button>
              )}
              <button
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-parchment-3 transition hover:bg-gold/20 hover:text-parchment"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {view === "city" && (
            <div className="relative mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  setView("province");
                  setSearch("");
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/5 text-parchment-3 transition hover:bg-gold/10 hover:text-parchment"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <p className="text-sm font-medium text-parchment">
                {selectedProvinsi}
              </p>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto scroll-smooth p-4">
          {/* Loading / Auto-locating */}
          {view === "loading" && (
            <div className="flex flex-col items-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold/20 border-t-emerald-js" />
              <p className="mt-4 text-sm text-parchment-2">
                {locating
                  ? "Mendeteksi lokasi..."
                  : "Memuat jadwal sholat..."}
              </p>
              {locating && (
                <p className="mt-1 text-xs text-parchment-3">
                  Menggunakan IP address
                </p>
              )}
            </div>
          )}

          {/* Province List */}
          {view === "province" && (
            <div>
              <div className="relative mb-3">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Cari provinsi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                {filteredProvinsi.length > 0 ? (
                  filteredProvinsi.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleProvinsiSelect(p)}
                      className="flex w-full items-center gap-3 rounded-xl bg-ink-2 p-3.5 text-left transition hover:bg-ink-3 active:scale-[0.98]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-js/10">
                        <svg
                          className="h-4 w-4 text-emerald-js"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-parchment">
                        {p}
                      </span>
                      <svg
                        className="ml-auto h-4 w-4 shrink-0 text-parchment-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <p className="text-sm text-parchment-3">
                      Tidak ada provinsi ditemukan
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* City List */}
          {view === "city" && (
            <div>
              <div className="relative mb-3">
                <svg
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Cari kota/kabupaten..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="space-y-1">
                {filteredKabkota.length > 0 ? (
                  filteredKabkota.map((k) => (
                    <button
                      key={k}
                      onClick={() => handleKabkotaSelect(k)}
                      className="flex w-full items-center gap-3 rounded-xl bg-ink-2 p-3.5 text-left transition hover:bg-ink-3 active:scale-[0.98]"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10">
                        <svg
                          className="h-4 w-4 text-gold"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-parchment">
                        {k}
                      </span>
                      <svg
                        className="ml-auto h-4 w-4 shrink-0 text-parchment-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <p className="text-sm text-parchment-3">
                      Tidak ada kota ditemukan
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Schedule View */}
          {view === "schedule" && todayJadwal && (
            <div className="space-y-4">
              {/* Location & Date */}
              <div className="rounded-xl bg-ink-2 p-3 ring-1 ring-gold/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-parchment">
                      {selectedKabkota}
                    </p>
                    <p className="text-[11px] text-parchment-3">
                      {selectedProvinsi}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-parchment">
                      {todayJadwal.hari}
                    </p>
                    <p className="text-[11px] text-parchment-3">
                      {today.getDate()}{" "}
                      {jadwalData?.bulan_nama} {jadwalData?.tahun}
                    </p>
                  </div>
                </div>
              </div>

              {/* Next Prayer Countdown */}
              {nextPrayer && (
                <div className="overflow-hidden rounded-xl bg-gradient-to-r from-emerald-js to-emerald-js-2 p-4 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/70">
                    Sholat Berikutnya
                  </p>
                  <div className="mt-1 flex items-end justify-between">
                    <div>
                      <p className="font-display text-2xl font-bold">
                        {nextPrayer.name}
                      </p>
                      <p className="text-sm text-white/70">
                        {nextPrayer.time} WIB
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-white/60">
                        Dalam
                      </p>
                      <p className="text-lg font-bold">{nextPrayer.countdown}</p>
                    </div>
                  </div>
                </div>
              )}

              {!showBulan ? (
                /* Today's Prayer Times */
                <div className="space-y-1.5">
                  {PRAYER_NAMES.map((p) => {
                    const time = todayJadwal[
                      p.key as keyof JadwalItem
                    ] as string;
                    const isActive =
                      nextPrayer && nextPrayer.key === p.key;
                    const isPassed =
                      nextPrayer &&
                      timeToMinutes(time) <
                        timeToMinutes(nextPrayer.time);

                    return (
                      <div
                        key={p.key}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 transition ${
                          isActive
                            ? "bg-gold/10 ring-1 ring-gold/20"
                            : isPassed
                              ? "bg-ink-2/50 opacity-50"
                              : "bg-ink-2"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-2 w-2 rounded-full ${
                              isActive
                                ? "bg-emerald-js animate-pulse"
                                : isPassed
                                  ? "bg-parchment-3"
                                  : "bg-gold/40"
                            }`}
                          />
                          <span
                            className={`text-sm ${isActive ? "font-semibold text-parchment" : "text-parchment-2"}`}
                          >
                            {p.label}
                          </span>
                        </div>
                        <span
                          className={`font-display text-lg ${isActive ? "font-bold text-parchment" : "text-parchment-2"}`}
                        >
                          {time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Monthly Schedule */
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gold/10">
                        <th className="py-2 px-1 text-left font-semibold text-parchment-3">
                          Tgl
                        </th>
                        <th className="py-2 px-1 text-center font-semibold text-parchment-3">
                          Subuh
                        </th>
                        <th className="py-2 px-1 text-center font-semibold text-parchment-3">
                          Dzuhur
                        </th>
                        <th className="py-2 px-1 text-center font-semibold text-parchment-3">
                          Ashar
                        </th>
                        <th className="py-2 px-1 text-center font-semibold text-parchment-3">
                          Maghrib
                        </th>
                        <th className="py-2 px-1 text-center font-semibold text-parchment-3">
                          Isya
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {jadwalData?.jadwal.map((j) => {
                        const isToday = j.tanggal === todayDate;
                        return (
                          <tr
                            key={j.tanggal}
                            className={`border-b border-gold/5 ${isToday ? "bg-emerald-js/10" : ""}`}
                          >
                            <td
                              className={`py-2 px-1 font-medium ${isToday ? "text-emerald-js font-bold" : "text-parchment-2"}`}
                            >
                              {j.tanggal}
                            </td>
                            <td className="py-2 px-1 text-center text-parchment-3">
                              {j.subuh}
                            </td>
                            <td className="py-2 px-1 text-center text-parchment-3">
                              {j.dzuhur}
                            </td>
                            <td className="py-2 px-1 text-center text-parchment-3">
                              {j.ashar}
                            </td>
                            <td className="py-2 px-1 text-center text-parchment-3">
                              {j.maghrib}
                            </td>
                            <td className="py-2 px-1 text-center text-parchment-3">
                              {j.isya}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {view === "schedule" && (
          <div className="flex shrink-0 gap-2 border-t border-gold/10 bg-ink-2/50 px-4 py-3">
            <button
              onClick={() => setShowBulan(!showBulan)}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gold/10 px-4 text-sm font-medium text-parchment-3 transition hover:bg-gold/15 hover:text-parchment"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                />
              </svg>
              {showBulan ? "Hari Ini" : "Sebulan"}
            </button>
            <button
              onClick={onClose}
              className="flex h-10 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-gold-2 via-gold to-gold-3 text-sm font-semibold text-ink shadow-lg shadow-gold/20 transition hover:shadow-xl hover:shadow-gold/30 active:scale-[0.98]"
            >
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
