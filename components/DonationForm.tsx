"use client";

import { useState, useRef, useMemo } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Landmark,
  Wallet,
  Building2,
  Upload,
  X,
  ShieldCheck,
  Loader2,
  Heart,
  Receipt,
} from "lucide-react";
import { CHANNELS, METHOD_LABELS, MethodType, getChannel } from "@/lib/payment";
import { formatRupiah } from "@/lib/format";
import { SectionHeader } from "./SectionHeader";
import { CornerBrackets } from "./CornerBrackets";

const QUICK_AMOUNTS = [25000, 50000, 100000, 250000, 500000, 1000000];

const STEPS = [
  { key: "nominal", label: "Nominal" },
  { key: "metode", label: "Metode Bayar" },
  { key: "konfirmasi", label: "Konfirmasi" },
] as const;

const TYPE_ICONS: Record<MethodType, typeof Landmark> = {
  bank_transfer: Landmark,
  emoney: Wallet,
  va: Building2,
};

export function DonationForm() {
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState<number>(0);
  const [amountInput, setAmountInput] = useState("");
  const [channelId, setChannelId] = useState("bsi");
  const [name, setName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const channel = useMemo(() => getChannel(channelId), [channelId]);

  const methods = Object.keys(CHANNELS) as MethodType[];

  function onPickAmount(value: number) {
    setAmount(value);
    setAmountInput(value ? String(value) : "");
  }

  function onAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^\d]/g, "");
    setAmountInput(digits);
    setAmount(digits ? Number(digits) : 0);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      setError("Format file harus JPG, PNG, atau WEBP.");
      return;
    }
    setError("");
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  }

  function next() {
    setError("");
    if (step === 0 && amount <= 0) {
      setError("Masukkan nominal donasi terlebih dahulu.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (amount <= 0) {
      setError("Nominal donasi tidak boleh kosong.");
      return;
    }
    if (!channel) {
      setError("Metode pembayaran tidak ditemukan.");
      return;
    }
    setError("");
    setStatus("submitting");

    const formData = new FormData();
    formData.append("amount", String(amount));
    formData.append("method", channel.type);
    formData.append("channel", channel.id);
    formData.append("name", name);
    formData.append("message", message);
    formData.append("anonymous", String(anonymous));
    if (file) formData.append("receipt", file);

    try {
      const res = await fetch("/api/donations", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setError(data.error || "Gagal menyimpan donasi. Coba lagi.");
        return;
      }
      setStatus("success");
      window.dispatchEvent(new Event("donation-created"));
    } catch {
      setStatus("error");
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    }
  }

  function reset() {
    setStatus("idle");
    setStep(0);
    setAmount(0);
    setAmountInput("");
    setName("");
    setMessage("");
    setAnonymous(false);
    setFile(null);
    setPreview((p) => {
      if (p) URL.revokeObjectURL(p);
      return null;
    });
    setError("");
  }

  return (
    <section id="donasi" className="scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <SectionHeader
          eyebrow="Donasi & Catat Kas"
          title="Alirkan"
          highlight="kebaikan anda"
          subtitle="Bayar ke kanal pilihan lalu catat donasi anda — rahasia bila diinginkan, tercatat bila dizinkan."
        />

        <div className="reveal mt-12 mx-auto max-w-3xl">
          <div className="glass-strong relative overflow-hidden rounded-3xl">
          <CornerBrackets />
          {/* Stepper */}
          {status !== "success" && (
            <div className="border-b border-gold/10 px-5 py-5 sm:px-8">
              <ol className="flex w-full items-center">
                {STEPS.map((s, i) => {
                  const done = i < step;
                  const current = i === step;
                  return (
                    <li key={s.key} className="flex shrink-0 items-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition ${
                            done
                              ? "border-gold bg-gold text-ink"
                              : current
                                ? "border-gold bg-gold/15 text-gold-2"
                                : "border-gold/20 text-parchment-3"
                          }`}
                        >
                          {done ? <Check className="h-4 w-4" /> : i + 1}
                        </span>
                        <span className="hidden text-[11px] text-parchment-3 sm:block">{s.label}</span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <span
                          className={`mx-2 h-px flex-1 ${i < step ? "bg-gold" : "bg-gold/15"}`}
                        />
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div key={status === "success" ? "success" : step} className="animate-step">
            {status === "success" ? (
              <SuccessPanel amount={amount} channelLabel={channel?.name ?? ""} onReset={reset} />
            ) : step === 0 ? (
              <NominalStep
                amount={amount}
                amountInput={amountInput}
                onAmountChange={onAmountChange}
                onPickAmount={onPickAmount}
                onNext={next}
                error={error}
              />
            ) : step === 1 ? (
              <MetodeStep
                channelId={channelId}
                setChannelId={setChannelId}
                amount={amount}
                onBack={back}
                onNext={next}
                methods={methods}
              />
            ) : (
              <KonfirmasiStep
                amount={amount}
                channelName={channel?.name ?? ""}
                reference={channel?.reference ?? ""}
                holder={channel?.holder ?? ""}
                note={channel?.note ?? ""}
                name={name}
                anonymous={anonymous}
                message={message}
                preview={preview}
                fileMessage={file ? "Bukti siap diunggah" : undefined}
                setAnonymous={setAnonymous}
                setName={setName}
                setMessage={setMessage}
                onFileClick={() => fileRef.current?.click()}
                onRemovePreview={() => {
                  setFile(null);
                  setPreview((p) => {
                    if (p) URL.revokeObjectURL(p);
                    return null;
                  });
                }}
                onSubmit={handleSubmit}
                onBack={back}
                submitting={status === "submitting"}
                error={error}
              />
            )}
            </div>
          </div>
        </div>
      </div>

      <p className="reveal mt-6 flex items-center justify-center gap-2 text-center text-xs text-parchment-3">
        <ShieldCheck className="h-4 w-4 text-gold-2" />
        Setiap donasi dicatat dan disampaikan transparan kepada komunitas.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileChange}
        className="hidden"
      />
      </div>
    </section>
  );
}

/* ---------- Step 1: Nominal ---------- */
function NominalStep({
  amount,
  amountInput,
  onAmountChange,
  onPickAmount,
  onNext,
  error,
}: {
  amount: number;
  amountInput: string;
  onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPickAmount: (v: number) => void;
  onNext: () => void;
  error: string;
}) {
  return (
    <StepBody
      icon={Heart}
      title="Berapa nominal donasi?"
      subtitle="Tentukan jumlah yang ingin anda salurkan."
    >
      <div className="mt-6">
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onPickAmount(a)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                amount === a
                  ? "border-gold bg-gold/15 text-gold-2"
                  : "border-gold/15 text-parchment-2 hover:border-gold/40"
              }`}
            >
              {a >= 1000000 ? `${a / 1000000} juta` : `${a / 1000} ribu`}
            </button>
          ))}
        </div>

        <div className="relative mt-4">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-parchment-3">
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={amountInput}
            onChange={onAmountChange}
            placeholder="0"
            className="w-full rounded-2xl border border-gold/15 bg-ink-2 py-4 pl-12 pr-4 font-mono text-2xl font-semibold outline-none transition placeholder:text-parchment-3 focus:border-gold/50"
          />
        </div>

        {amount > 0 && (
          <p className="mt-3 text-sm text-parchment-2">
            Menjadi <span className="font-semibold text-gold-2">{formatRupiah(amount)}</span>
          </p>
        )}

        {error && <ErrorBox message={error} />}
      </div>

      <ActionBar onNext={onNext} nextLabel="Lanjut ke Metode Bayar" />
    </StepBody>
  );
}

/* ---------- Step 2: Metode & instruksi bayar ---------- */
function MetodeStep({
  channelId,
  setChannelId,
  amount,
  onBack,
  onNext,
  methods,
}: {
  channelId: string;
  setChannelId: (id: string) => void;
  amount: number;
  onBack: () => void;
  onNext: () => void;
  methods: MethodType[];
}) {
  const channel = getChannel(channelId);
  return (
    <StepBody
      icon={Building2}
      title="Pilih metode pembayaran"
      subtitle={`Bayar ${formatRupiah(amount)} ke salah satu kanal berikut.`}
    >
      <div className="mt-6 grid gap-8">
        {/* Method selection */}
        <div className="space-y-6">
          {methods.map((method) => {
            const Icon = TYPE_ICONS[method];
            return (
              <div key={method}>
                <div className="mb-2.5 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-parchment-3">
                  <Icon className="h-4 w-4" /> {METHOD_LABELS[method]}
                </div>
                <div className={`grid gap-2.5 ${CHANNELS[method].length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                  {CHANNELS[method].map((ch) => {
                    const active = ch.id === channelId;
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => setChannelId(ch.id)}
                        className={`rounded-xl border p-3 text-left transition ${
                          active
                            ? "border-gold bg-gold/10 text-gold-2"
                            : "border-gold/15 text-parchment-2 hover:border-gold/40"
                        }`}
                      >
                        <span className="block text-sm font-semibold leading-tight">{ch.bankPrefix}</span>
                        <span className="mt-0.5 block text-xs leading-snug opacity-70">{ch.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Instruction panel */}
        <div>
          <p className="text-sm font-medium text-parchment-2">Instruksi pembayaran</p>
          <p className="mt-1 font-display text-2xl font-semibold text-gradient-gold">
            {formatRupiah(amount)}
          </p>

          {channel && (
            <div className={`mt-4 rounded-2xl bg-gradient-to-br ${channel.accent} border border-gold/20 p-5`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-parchment">{channel.name}</p>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(channel.reference)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-ink/40 px-3 py-1.5 text-xs font-medium text-gold-2 transition hover:bg-ink/60"
                >
                  <Copy className="h-3.5 w-3.5" /> Salin Nomor
                </button>
              </div>
              <p className="mt-3 break-all font-mono text-2xl font-semibold tracking-wider text-parchment">
                {channel.reference}
              </p>
              {channel.holder && (
                <p className="mt-1 text-xs text-parchment-3">a.n. {channel.holder}</p>
              )}
              {channel.note && (
                <p className="mt-2 text-xs text-amber-200/80">{channel.note}</p>
              )}
            </div>
          )}

          <div className="mt-4 rounded-2xl border border-gold/15 bg-ink-2 p-4 text-xs leading-relaxed text-parchment-3">
            1. Transfer sesuai nominal di atas ke kanal terpilih.
            <br />
            2. Simpan atau tangkap bukti transfer anda.
            <br />
            3. Lanjut isi detail donor pada langkah berikutnya.
          </div>

          <ActionBar onBack={onBack} onNext={onNext} nextLabel="Lanjut" />
        </div>
      </div>
    </StepBody>
  );
}

/* ---------- Step 3: Detail donor & konfirmasi ---------- */
function KonfirmasiStep({
  amount,
  channelName,
  reference,
  holder,
  note,
  name,
  anonymous,
  message,
  preview,
  fileMessage,
  setAnonymous,
  setName,
  setMessage,
  onFileClick,
  onRemovePreview,
  onSubmit,
  onBack,
  submitting,
  error,
}: {
  amount: number;
  channelName: string;
  reference: string;
  holder: string;
  note?: string;
  name: string;
  anonymous: boolean;
  message: string;
  preview: string | null;
  fileMessage?: string;
  setAnonymous: (v: boolean) => void;
  setName: (v: string) => void;
  setMessage: (v: string) => void;
  onFileClick: () => void;
  onRemovePreview: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  submitting: boolean;
  error: string;
}) {
  return (
    <StepBody
      icon={Receipt}
      title="Konfirmasi donasi"
      subtitle="Periksa kembali detail, lalu lengkapi data donor."
    >
      <form className="mt-6 grid gap-7" onSubmit={onSubmit}>
        {/* Review */}
        <div className="rounded-2xl border border-gold/15 bg-ink-2 p-5">
          <p className="text-xs uppercase tracking-wide text-parchment-3">Ringkasan</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-parchment-3">Nominal</dt>
              <dd className="font-semibold text-gold-2">{formatRupiah(amount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-parchment-3">Kanal</dt>
              <dd className="text-parchment">{channelName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-parchment-3">Nomor</dt>
              <dd className="break-all text-right font-mono text-parchment">{reference}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-parchment-3">Atas nama</dt>
              <dd className="text-parchment">{holder}</dd>
            </div>
            {note && (
              <div className="flex justify-between gap-4">
                <dt className="text-parchment-3">Ket.</dt>
                <dd className="text-right text-xs text-amber-200/80">{note}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-gold/10 pt-3">
              <dt className="text-parchment-2">Tampil sebagai</dt>
              <dd className="italic text-gold-2">
                {anonymous ? "Hamba Allah (anonim)" : (name || "—")}
              </dd>
            </div>
          </dl>
        </div>

        {/* Donor details */}
        <div className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm text-parchment-2">Nama</label>
            <input
              type="text"
              value={name}
              disabled={anonymous}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nama anda"
              className="w-full rounded-xl border border-gold/15 bg-ink-2 px-4 py-3 text-sm outline-none transition placeholder:text-parchment-3 focus:border-gold/50 disabled:opacity-40"
            />
            <label className="mt-2.5 flex items-center gap-2 text-xs text-parchment-2">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="h-4 w-4 rounded accent-gold"
              />
              Tampilkan sebagai <span className="italic text-gold-2">Hamba Allah</span> (anonim)
            </label>
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-parchment-2">
              Pesan / Doa <span className="text-parchment-3">(opsional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Tulis pesan atau doa anda..."
              className="w-full resize-none rounded-xl border border-gold/15 bg-ink-2 px-4 py-3 text-sm outline-none transition placeholder:text-parchment-3 focus:border-gold/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm text-parchment-2">
              Bukti Transfer <span className="text-parchment-3">(opsional)</span>
            </label>
            {preview ? (
              <div className="relative overflow-hidden rounded-xl border border-gold/20">
                <img
                  src={preview}
                  alt="Preview bukti"
                  className="h-40 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={onRemovePreview}
                  className="absolute right-2 top-2 rounded-full bg-ink/80 p-1.5 text-parchment transition hover:bg-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onFileClick}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gold/25 py-6 text-sm text-parchment-2 transition hover:border-gold/50 hover:bg-gold/5"
              >
                <Upload className="h-5 w-5 text-gold-2" />
                Klik untuk mengunggah (JPG/PNG/WebP, maks 5MB)
              </button>
            )}
            {fileMessage && (
              <p className="mt-2 text-xs text-emerald-300">{fileMessage}</p>
            )}
          </div>

          {error && <ErrorBox message={error} />}

          <ActionBar
            onBack={onBack}
            onSubmit={onSubmit}
            submitting={submitting}
            submitLabel="Salurkan Donasi"
          />
        </div>
      </form>
    </StepBody>
  );
}

/* ---------- Success ---------- */
function SuccessPanel({
  amount,
  channelLabel,
  onReset,
}: {
  amount: number;
  channelLabel: string;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-js/20 text-emerald-300">
        <Check className="h-8 w-8" />
      </span>
      <h3 className="mt-5 font-display text-3xl font-semibold">
        Jazakumullah Khairan
      </h3>
      <p className="mt-2 max-w-md text-sm text-parchment-2">
        Donasi <span className="font-semibold text-gold-2">{formatRupiah(amount)}</span> via{" "}
        {channelLabel} telah tercatat. Riwayat akan muncul di bawah setelah
        diverifikasi oleh pengurus.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-6 rounded-full border border-gold/30 px-6 py-2.5 text-sm font-medium text-gold-2 transition hover:bg-gold/10"
      >
        Catat Donasi Lainnya
      </button>
    </div>
  );
}

/* ---------- Shared UI ---------- */
function StepBody({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof Landmark;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold-2">
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <h3 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h3>
          <p className="mt-1 text-sm text-parchment-3">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ActionBar({
  onNext,
  onBack,
  onSubmit,
  nextLabel,
  submitting,
  submitLabel,
}: {
  onNext?: () => void;
  onBack?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
  nextLabel?: string;
  submitting?: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="mt-7 flex items-center justify-between gap-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-gold/20 px-5 text-sm font-medium text-parchment-2 transition hover:bg-gold/10 hover:text-gold-2"
        >
          <ChevronLeft className="h-4 w-4" /> Kembali
        </button>
      ) : (
        <span className="hidden" aria-hidden="true" />
      )}

      {onSubmit ? (
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-5 text-sm font-semibold text-ink shadow-lg shadow-gold/20 transition hover:brightness-110 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
            </>
          ) : (
            <>
              <Heart className="h-4 w-4" /> {submitLabel ?? "Salurkan"}
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-5 text-sm font-semibold text-ink shadow-lg shadow-gold/20 transition hover:brightness-110"
        >
          {nextLabel ?? "Lanjut"} <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
      {message}
    </p>
  );
}
