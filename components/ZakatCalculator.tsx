"use client";

import { useState } from "react";

type ZakatType = "penghasilan" | "mal" | "fitrah" | "emas" | "perdagangan";

interface ZakatResult {
  wajib: boolean;
  totalHarta: number;
  nisab: number;
  jumlahZakat: number;
  detail: string;
}

const NISAB_EMAS_GRAM = 85;
const NISAB_PERAK_GRAM = 595;
const FITRAH_BERAS_KG = 2.5;

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function formatGram(n: number) {
  return `${n.toLocaleString("id-ID")} gram`;
}

function formatNum(n: number) {
  return n.toLocaleString("id-ID");
}

function parseNum(str: string) {
  const cleaned = str.replace(/\./g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

interface ZakatCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ZakatCalculator({ isOpen, onClose }: ZakatCalculatorProps) {
  const [zakatType, setZakatType] = useState<ZakatType>("penghasilan");
  const [result, setResult] = useState<ZakatResult | null>(null);

  const [hargaEmas, setHargaEmas] = useState(2723000);
  const [hargaPerak, setHargaPerak] = useState(39000);
  const [hargaBeras, setHargaBeras] = useState(15000);

  const [pendapatan, setPendapatan] = useState(0);
  const [periode, setPeriode] = useState<"bulan" | "tahun">("bulan");

  const [tabungan, setTabungan] = useState(0);
  const [investasi, setInvestasi] = useState(0);
  const [asetLain, setAsetLain] = useState(0);
  const [hutang, setHutang] = useState(0);

  const [jumlahJiwa, setJumlahJiwa] = useState(1);

  const [beratEmas, setBeratEmas] = useState(0);
  const [beratPerak, setBeratPerak] = useState(0);

  const [asetDagang, setAsetDagang] = useState(0);
  const [keuntungan, setKeuntungan] = useState(0);
  const [hutangDagang, setHutangDagang] = useState(0);

  const [showHarga, setShowHarga] = useState(false);

  if (!isOpen) return null;

  const nisabEmasVal = NISAB_EMAS_GRAM * hargaEmas;

  const handleHitung = () => {
    let r: ZakatResult;

    switch (zakatType) {
      case "penghasilan": {
        const totalSetahun = pendapatan * (periode === "bulan" ? 12 : 1);
        const zakat = totalSetahun >= nisabEmasVal ? totalSetahun * 0.025 : 0;
        r = {
          wajib: totalSetahun >= nisabEmasVal,
          totalHarta: totalSetahun,
          nisab: nisabEmasVal,
          jumlahZakat: zakat,
          detail: `Pendapatan setahun: ${formatRupiah(totalSetahun)}\nNisab (${NISAB_EMAS_GRAM}g emas): ${formatRupiah(nisabEmasVal)}`,
        };
        break;
      }
      case "mal": {
        const total = tabungan + investasi + asetLain - hutang;
        const zakat = total >= nisabEmasVal ? total * 0.025 : 0;
        r = {
          wajib: total >= nisabEmasVal,
          totalHarta: total,
          nisab: nisabEmasVal,
          jumlahZakat: zakat,
          detail: `Total harta bersih: ${formatRupiah(total)}\nNisab (${NISAB_EMAS_GRAM}g emas): ${formatRupiah(nisabEmasVal)}`,
        };
        break;
      }
      case "fitrah": {
        const zakat = jumlahJiwa * FITRAH_BERAS_KG * hargaBeras;
        r = {
          wajib: true,
          totalHarta: 0,
          nisab: 0,
          jumlahZakat: zakat,
          detail: `${jumlahJiwa} jiwa x ${FITRAH_BERAS_KG} kg beras x ${formatRupiah(hargaBeras)}/kg`,
        };
        break;
      }
      case "emas": {
        const wajibEmas = beratEmas >= NISAB_EMAS_GRAM;
        const wajibPerak = beratPerak >= NISAB_PERAK_GRAM;
        const zakatEmas = wajibEmas ? beratEmas * hargaEmas * 0.025 : 0;
        const zakatPerak = wajibPerak ? beratPerak * hargaPerak * 0.025 : 0;
        const totalVal = beratEmas * hargaEmas + beratPerak * hargaPerak;
        r = {
          wajib: wajibEmas || wajibPerak,
          totalHarta: totalVal,
          nisab: 0,
          jumlahZakat: zakatEmas + zakatPerak,
          detail: `Emas: ${formatGram(beratEmas)} (nisab ${NISAB_EMAS_GRAM}g) ${wajibEmas ? "v" : "x"}\nPerak: ${formatGram(beratPerak)} (nisab ${NISAB_PERAK_GRAM}g) ${wajibPerak ? "v" : "x"}`,
        };
        break;
      }
      case "perdagangan": {
        const total = asetDagang + keuntungan - hutangDagang;
        const zakat = total >= nisabEmasVal ? total * 0.025 : 0;
        r = {
          wajib: total >= nisabEmasVal,
          totalHarta: total,
          nisab: nisabEmasVal,
          jumlahZakat: zakat,
          detail: `Total aset dagang bersih: ${formatRupiah(total)}\nNisab (${NISAB_EMAS_GRAM}g emas): ${formatRupiah(nisabEmasVal)}`,
        };
        break;
      }
    }
    setResult(r);
  };

  const handleReset = () => {
    setResult(null);
    setPendapatan(0);
    setTabungan(0);
    setInvestasi(0);
    setAsetLain(0);
    setHutang(0);
    setJumlahJiwa(1);
    setBeratEmas(0);
    setBeratPerak(0);
    setAsetDagang(0);
    setKeuntungan(0);
    setHutangDagang(0);
  };

  const handleTabChange = (t: ZakatType) => {
    setZakatType(t);
    setResult(null);
  };

  const tabs: { id: ZakatType; label: string }[] = [
    { id: "penghasilan", label: "Penghasilan" },
    { id: "mal", label: "Harta" },
    { id: "fitrah", label: "Fitrah" },
    { id: "emas", label: "Emas" },
    { id: "perdagangan", label: "Dagang" },
  ];

  const inputClass =
    "w-full rounded-lg bg-ink-3 py-3 px-4 text-sm text-parchment placeholder-parchment-3 outline-none ring-1 ring-gold/10 transition focus:ring-gold/30";
  const labelClass = "mb-1.5 block text-xs font-semibold text-parchment-2";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-[2rem] border border-gold/10 bg-ink shadow-2xl">
        {/* Background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cg fill='none' stroke='%23a07820' stroke-width='0.5'%3E%3Cpath d='M30 0v60M0 30h60'/%3E%3Ccircle cx='30' cy='30' r='10' opacity='0.4'/%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        {/* ── Header ── */}
        <div className="relative shrink-0 overflow-hidden border-b border-gold/15 bg-gradient-to-r from-gold/15 via-gold/8 to-gold/15 px-5 pt-4 pb-3">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d3ad57' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15">
                <svg
                  className="h-4 w-4 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <rect
                    x="6"
                    y="4"
                    width="12"
                    height="5"
                    rx="1"
                    fill="currentColor"
                    opacity={0.2}
                  />
                  <circle cx="8" cy="13" r="1" fill="currentColor" />
                  <circle cx="12" cy="13" r="1" fill="currentColor" />
                  <circle cx="16" cy="13" r="1" fill="currentColor" />
                  <circle cx="8" cy="17" r="1" fill="currentColor" />
                  <circle cx="12" cy="17" r="1" fill="currentColor" />
                  <circle cx="16" cy="17" r="1" fill="currentColor" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-parchment-3">
                  Kalkulator
                </p>
                <h2 className="font-display text-lg font-bold leading-tight text-parchment">
                  Zakat
                </h2>
              </div>
            </div>
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

          {/* Tabs */}
          <div className="relative mt-3 flex gap-1 rounded-lg bg-ink-3 p-0.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`flex-1 rounded-md py-2 text-[11px] font-medium transition-all ${
                  zakatType === t.id
                    ? "bg-gold/15 text-gold-2 shadow-sm"
                    : "text-parchment-3 hover:bg-gold/5 hover:text-parchment"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Harga toggle */}
          <button
            onClick={() => setShowHarga(!showHarga)}
            className="relative mt-2 flex w-full items-center justify-between rounded-lg bg-gold/5 px-3 py-2 text-xs text-parchment-3 transition hover:bg-gold/10 hover:text-parchment"
          >
            <span className="flex items-center gap-1.5">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Pengaturan Harga
            </span>
            <svg
              className={`h-3.5 w-3.5 transition-transform ${showHarga ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showHarga && (
            <div className="relative mt-2 grid grid-cols-3 gap-2 rounded-lg bg-ink-3/30 p-3">
              <div>
                <label className="mb-1 block text-[10px] text-parchment-3">
                  Emas/gram
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={hargaEmas ? formatNum(hargaEmas) : ""}
                  onChange={(e) => setHargaEmas(parseNum(e.target.value))}
                  className="w-full rounded-lg bg-ink-3 py-1.5 px-2 text-xs text-parchment outline-none ring-1 ring-gold/10 focus:ring-gold/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-parchment-3">
                  Perak/gram
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={hargaPerak ? formatNum(hargaPerak) : ""}
                  onChange={(e) => setHargaPerak(parseNum(e.target.value))}
                  className="w-full rounded-lg bg-ink-3 py-1.5 px-2 text-xs text-parchment outline-none ring-1 ring-gold/10 focus:ring-gold/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] text-parchment-3">
                  Beras/kg
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={hargaBeras ? formatNum(hargaBeras) : ""}
                  onChange={(e) => setHargaBeras(parseNum(e.target.value))}
                  className="w-full rounded-lg bg-ink-3 py-1.5 px-2 text-xs text-parchment outline-none ring-1 ring-gold/10 focus:ring-gold/30"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto scroll-smooth p-4">
          {/* Zakat Penghasilan */}
          {zakatType === "penghasilan" && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Pendapatan</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Masukkan jumlah pendapatan"
                  value={pendapatan ? formatNum(pendapatan) : ""}
                  onChange={(e) => setPendapatan(parseNum(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Periode</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPeriode("bulan")}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
                      periode === "bulan"
                        ? "bg-gold/15 text-gold-2 ring-1 ring-gold/20"
                        : "bg-ink-3 text-parchment-3 hover:text-parchment"
                    }`}
                  >
                    Per Bulan
                  </button>
                  <button
                    onClick={() => setPeriode("tahun")}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition-all ${
                      periode === "tahun"
                        ? "bg-gold/15 text-gold-2 ring-1 ring-gold/20"
                        : "bg-ink-3 text-parchment-3 hover:text-parchment"
                    }`}
                  >
                    Per Tahun
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-ink-2 p-3 ring-1 ring-gold/10">
                <p className="text-[11px] text-parchment-3">
                  <span className="font-semibold text-parchment-2">Nisab:</span>{" "}
                  setara {NISAB_EMAS_GRAM}g emas ({formatRupiah(nisabEmasVal)}
                  /tahun)
                </p>
              </div>
            </div>
          )}

          {/* Zakat Mal */}
          {zakatType === "mal" && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Tabungan / Deposito</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Uang di bank, deposito, dll"
                  value={tabungan ? formatNum(tabungan) : ""}
                  onChange={(e) => setTabungan(parseNum(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Investasi</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Saham, reksadana, obligasi, dll"
                  value={investasi ? formatNum(investasi) : ""}
                  onChange={(e) => setInvestasi(parseNum(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Aset Lain (setahun+)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Properti sewaan, kendaraan, dll"
                  value={asetLain ? formatNum(asetLain) : ""}
                  onChange={(e) => setAsetLain(parseNum(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Hutang Jatuh Tempo</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Hutang yang harus segera dibayar"
                  value={hutang ? formatNum(hutang) : ""}
                  onChange={(e) => setHutang(parseNum(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="rounded-xl bg-ink-2 p-3 ring-1 ring-gold/10">
                <p className="text-[11px] text-parchment-3">
                  <span className="font-semibold text-parchment-2">Nisab:</span>{" "}
                  setara {NISAB_EMAS_GRAM}g emas ({formatRupiah(nisabEmasVal)})
                </p>
              </div>
            </div>
          )}

          {/* Zakat Fitrah */}
          {zakatType === "fitrah" && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Jumlah Jiwa</label>
                <input
                  type="number"
                  min={1}
                  placeholder="Jumlah anggota keluarga"
                  value={jumlahJiwa || ""}
                  onChange={(e) =>
                    setJumlahJiwa(Math.max(1, Number(e.target.value)))
                  }
                  className={inputClass}
                />
              </div>
              <div className="rounded-xl bg-ink-2 p-4 ring-1 ring-gold/10">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-gold-2">
                  Keterangan
                </p>
                <p className="text-sm leading-relaxed text-parchment">
                  Setiap jiwa wajib mengeluarkan{" "}
                  <span className="font-semibold">{FITRAH_BERAS_KG} kg</span>{" "}
                  beras atau makanan pokok.
                </p>
                <p className="mt-2 text-xs text-parchment-3">
                  Harga beras:{" "}
                  <span className="font-semibold text-parchment-2">
                    {formatRupiah(hargaBeras)}/kg
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Zakat Emas & Perak */}
          {zakatType === "emas" && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Berat Emas (gram)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Berat emas yang dimiliki"
                  value={beratEmas ? formatNum(beratEmas) : ""}
                  onChange={(e) => setBeratEmas(parseNum(e.target.value))}
                  className={inputClass}
                />
                <p className="mt-1 text-[11px] text-parchment-3">
                  Nisab emas: {NISAB_EMAS_GRAM} gram
                </p>
              </div>
              <div>
                <label className={labelClass}>Berat Perak (gram)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Berat perak yang dimiliki"
                  value={beratPerak ? formatNum(beratPerak) : ""}
                  onChange={(e) => setBeratPerak(parseNum(e.target.value))}
                  className={inputClass}
                />
                <p className="mt-1 text-[11px] text-parchment-3">
                  Nisab perak: {NISAB_PERAK_GRAM} gram
                </p>
              </div>
              <div className="rounded-xl bg-ink-2 p-3 ring-1 ring-gold/10">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gold-2">
                  Harga saat ini
                </p>
                <div className="flex justify-between text-sm text-parchment">
                  <span>
                    Emas:{" "}
                    <span className="font-semibold">
                      {formatRupiah(hargaEmas)}
                    </span>
                    /g
                  </span>
                  <span>
                    Perak:{" "}
                    <span className="font-semibold">
                      {formatRupiah(hargaPerak)}
                    </span>
                    /g
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Zakat Perdagangan */}
          {zakatType === "perdagangan" && (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Nilai Aset Dagang</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Stok barang, modal dagang"
                  value={asetDagang ? formatNum(asetDagang) : ""}
                  onChange={(e) => setAsetDagang(parseNum(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Keuntungan / Piutang</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Laba dan piutang yang diharapkan"
                  value={keuntungan ? formatNum(keuntungan) : ""}
                  onChange={(e) => setKeuntungan(parseNum(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Hutang Dagang</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Hutang yang berkaitan dengan dagang"
                  value={hutangDagang ? formatNum(hutangDagang) : ""}
                  onChange={(e) => setHutangDagang(parseNum(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="rounded-xl bg-ink-2 p-3 ring-1 ring-gold/10">
                <p className="text-[11px] text-parchment-3">
                  <span className="font-semibold text-parchment-2">Nisab:</span>{" "}
                  setara {NISAB_EMAS_GRAM}g emas ({formatRupiah(nisabEmasVal)})
                </p>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-gold/10 bg-ink-2">
              <div className="border-b border-gold/10 bg-ink-3 px-4 py-3">
                <div className="flex items-center gap-2">
                  {result.wajib ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-js/20">
                      <svg
                        className="h-3.5 w-3.5 text-emerald-js"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/20">
                      <svg
                        className="h-3.5 w-3.5 text-gold-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                        />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-parchment">
                      {result.wajib
                        ? "Wajib Zakat"
                        : zakatType === "fitrah"
                          ? "Zakat Fitrah"
                          : "Belum Mencapai Nisab"}
                    </p>
                    {!result.wajib && zakatType !== "fitrah" && (
                      <p className="text-[10px] text-parchment-3">
                        Harta belum mencapai nisab
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <div className="rounded-xl bg-ink-3 p-4">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gold-2">
                    Jumlah Zakat (2.5%)
                  </p>
                  <p className="font-display text-2xl font-bold text-parchment">
                    {formatRupiah(result.jumlahZakat)}
                  </p>
                </div>

                <div className="space-y-1">
                  {result.detail.split("\n").map((line, i) => (
                    <p key={i} className="text-xs text-parchment-3">
                      {line}
                    </p>
                  ))}
                </div>

                {result.nisab > 0 && (
                  <div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-3">
                      <div
                        className={`h-full rounded-full transition-all ${result.wajib ? "bg-emerald-js" : "bg-gold/40"}`}
                        style={{
                          width: `${Math.min(100, (result.totalHarta / result.nisab) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-parchment-3">
                      <span>Rp 0</span>
                      <span>Nisab: {formatRupiah(result.nisab)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex shrink-0 gap-2 border-t border-gold/10 bg-ink-2/50 px-4 py-3">
          <button
            onClick={handleReset}
            className="flex h-10 items-center justify-center rounded-xl bg-gold/10 px-4 text-sm font-medium text-parchment-3 transition hover:bg-gold/15 hover:text-parchment"
          >
            Reset
          </button>
          <button
            onClick={handleHitung}
            className="flex h-10 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-gold-2 via-gold to-gold-3 text-sm font-semibold text-ink shadow-lg shadow-gold/20 transition hover:shadow-xl hover:shadow-gold/30 active:scale-[0.98]"
          >
            Hitung Zakat
          </button>
        </div>
      </div>
    </div>
  );
}
