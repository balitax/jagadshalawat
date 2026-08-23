"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  Circle,
  Edit3,
  X,
  Save,
} from "lucide-react";
import { formatRupiah, formatDateTime } from "@/lib/format";

interface Donation {
  id: string;
  name: string;
  isAnonymous: boolean;
  amount: number;
  method: "bank_transfer" | "emoney" | "va";
  channel: string;
  message: string | null;
  receiptUrl: string | null;
  status: "pending" | "verified";
  createdAt: string;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  async function checkAuth() {
    const res = await fetch("/api/auth");
    const data = await res.json();
    setAuthed(Boolean(data.isLoggedIn));
  }

  useEffect(() => {
    checkAuth();
  }, []);

  if (authed === null) {
    return <AdminShellCenter>Memuat...</AdminShellCenter>;
  }

  if (!authed) {
    return (
      <AdminShellCenter>
        <LoginForm onSuccess={() => setAuthed(true)} />
      </AdminShellCenter>
    );
  }

  return <Dashboard onLogout={() => setAuthed(false)} />;
}

function AdminShellCenter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="glass w-full max-w-md rounded-3xl p-8">{children}</div>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Login gagal.");
      return;
    }
    onSuccess();
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10 text-gold-2">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold">Panel Pengurus</h2>
          <p className="text-sm text-parchment-3">Masuk untuk kelola riwayat</p>
        </div>
      </div>

      <form onSubmit={handle} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-parchment-2">Password</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gold/15 bg-ink-2 px-4 py-3 pr-11 text-sm outline-none transition focus:border-gold/50"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment-3 hover:text-gold-2"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-6 py-3 text-sm font-semibold text-ink transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          Masuk
        </button>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/donations");
    const data = await res.json();
    setDonations(data.donations || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function patch(id: string, body: Record<string, unknown>) {
    await fetch("/api/admin/donations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    await load();
  }

  async function del(id: string) {
    if (!confirm("Hapus donasi ini?")) return;
    await fetch("/api/admin/donations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    onLogout();
  }

  const verifiedCount = donations.filter((d) => d.status === "verified").length;

  return (
    <div className="shell py-10 sm:py-16">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold">Riwayat Donasi</h1>
          <p className="mt-1 text-sm text-parchment-3">
            {donations.length} entri · {verifiedCount} terverifikasi
          </p>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-full border border-gold/30 px-5 py-2.5 text-sm font-medium text-parchment transition hover:bg-gold/10 hover:text-gold-2"
        >
          <LogOut className="h-4 w-4" /> Keluar
        </button>
      </div>

      <div className="mt-8 space-y-3">
        {loading ? (
          <div className="glass h-24 animate-pulse rounded-2xl" />
        ) : donations.length === 0 ? (
          <div className="glass rounded-2xl py-14 text-center text-parchment-2">
            Belum ada donasi tercatat.
          </div>
        ) : (
          donations.map((d) =>
            editingId === d.id ? (
              <EditRow
                key={d.id}
                donation={d}
                onCancel={() => setEditingId(null)}
                onSaved={() => {
                  setEditingId(null);
                  load();
                }}
              />
            ) : (
              <div key={d.id} className="glass rounded-2xl p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold/10 font-display text-lg font-semibold text-gold-2">
                      {(d.isAnonymous ? "H" : d.name).charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-parchment">
                          {d.isAnonymous ? "Hamba Allah" : d.name}
                        </p>
                        {d.isAnonymous && (
                          <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gold-2">
                            anonim
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                            d.status === "verified"
                              ? "bg-emerald-js/20 text-emerald-300"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold text-gradient-gold">
                        {formatRupiah(d.amount)}
                      </p>
                      <p className="mt-0.5 text-xs text-parchment-3">
                        {d.channel} · {formatDateTime(d.createdAt)}
                      </p>
                      {d.message && (
                        <p className="mt-2 text-sm text-parchment-2">“{d.message}”</p>
                      )}
                      {d.receiptUrl && (
                        <a
                          href={d.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-gold-2 underline decoration-gold/40 underline-offset-2"
                        >
                          Lihat bukti
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      onClick={() =>
                        patch(d.id, {
                          status: d.status === "verified" ? "pending" : "verified",
                        })
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        d.status === "verified"
                          ? "border-emerald-500/40 bg-emerald-js/15 text-emerald-300 hover:bg-emerald-js/25"
                          : "border-gold/30 bg-gold/10 text-gold-2 hover:bg-gold/20"
                      }`}
                    >
                      {d.status === "verified" ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                        </>
                      ) : (
                        <>
                          <Circle className="h-3.5 w-3.5" /> Verifikasi
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        patch(d.id, { isAnonymous: !d.isAnonymous })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-xs font-medium text-parchment transition hover:bg-gold/10"
                    >
                      {d.isAnonymous ? "Buka Nama" : "Anonimkan"}
                    </button>
                    <button
                      onClick={() => setEditingId(d.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-3 py-1.5 text-xs font-medium text-parchment transition hover:bg-gold/10"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => del(d.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}

function EditRow({
  donation,
  onCancel,
  onSaved,
}: {
  donation: Donation;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(donation.isAnonymous ? "" : donation.name);
  const [amount, setAmount] = useState(String(donation.amount));
  const [message, setMessage] = useState(donation.message ?? "");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    await fetch("/api/admin/donations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: donation.id,
        name: name || "Hamba Allah",
        amount: Number(amount) || 0,
        message,
        isAnonymous: donation.isAnonymous,
      }),
    });
    setBusy(false);
    onSaved();
  }

  return (
    <div className="glass rounded-2xl border border-gold/40 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="mb-1 block text-xs text-parchment-3">Nama</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2 text-sm outline-none focus:border-gold/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-parchment-3">Nominal (Rp)</label>
          <input
            value={amount}
            inputMode="numeric"
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2 text-sm outline-none focus:border-gold/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-parchment-3">Pesan</label>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2 text-sm outline-none focus:border-gold/50"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-4 py-2 text-sm text-parchment transition hover:bg-gold/10"
        >
          <X className="h-4 w-4" /> Batal
        </button>
        <button
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-5 py-2 text-sm font-semibold text-ink transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan
        </button>
      </div>
    </div>
  );
}
