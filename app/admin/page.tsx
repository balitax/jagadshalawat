"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
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
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  User,
  Hash,
  CreditCard,
  Wallet,
  MessageSquare,
  Calendar,
  Image as ImageIcon,
  LayoutDashboard,
  HandCoins,
  Menu,
  ChevronDown,
  Sun,
  Moon,
  Banknote,
  Smartphone,
  Landmark,
  Clock,
  BookOpen,
  Megaphone,
  ImageIcon as GalleryIcon,
  Plus,
  Heart,
  ExternalLink,
} from "lucide-react";
import { formatRupiah, formatDateTime, titleCase } from "@/lib/format";

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

const ITEMS_PER_PAGE = 10;

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "donasi", label: "Donasi", icon: HandCoins },
  { id: "jadwal", label: "Jadwal Kegiatan", icon: Clock },
  { id: "artikel", label: "Artikel & Pengumuman", icon: BookOpen },
  { id: "galeri", label: "Galeri Foto", icon: GalleryIcon },
  { id: "doawirid", label: "Doa & Wirid", icon: BookOpen },
] as const;

type NavId = (typeof NAV_ITEMS)[number]["id"];

/* ─── Custom Dropdown ─── */
interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

function FilterDropdown({
  value,
  onChange,
  options,
  icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: DropdownOption[];
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-gold/15 bg-ink-2 px-4 py-2.5 text-sm text-parchment transition hover:border-gold/30 focus:border-gold/50 focus:outline-none"
      >
        {icon && <span className="text-parchment-3">{icon}</span>}
        <span className="truncate">{selected?.label || "Pilih"}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-parchment-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-1.5 w-full min-w-[180px] overflow-hidden rounded-xl border border-gold/15 bg-ink-2 shadow-xl shadow-black/30">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition hover:bg-ink-3 ${
                value === opt.value ? "bg-gold/10 text-gold-2" : "text-parchment"
              }`}
            >
              {opt.icon && <span className="shrink-0 text-parchment-3">{opt.icon}</span>}
              <span className="truncate">{opt.label}</span>
              {value === opt.value && <CheckCircle2 className="ml-auto h-3.5 w-3.5 shrink-0 text-gold-2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Theme Toggle ─── */
function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("admin-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Mode terang" : "Mode gelap"}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-parchment-3 transition hover:bg-ink-3 hover:text-parchment"
    >
      {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
      {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
    </button>
  );
}

/* ─── Page Shell ─── */
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
    return <LoadingScreen />;
  }

  if (!authed) {
    return <LoginForm onSuccess={() => setAuthed(true)} />;
  }

  return <AdminPanel onLogout={() => setAuthed(false)} />;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink">
      <Loader2 className="h-8 w-8 animate-spin text-gold-2" />
    </div>
  );
}

/* ─── Login ─── */
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
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="glass w-full max-w-md rounded-3xl p-8">
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
    </div>
  );
}

/* ─── Admin Panel (Sidebar + Content) ─── */
function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [activeNav, setActiveNav] = useState<NavId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    onLogout();
  }

  return (
    <div className="flex min-h-screen bg-ink">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gold/15 bg-ink-2 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-gold/15 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15 text-gold-2">
            <HandCoins className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-base font-semibold leading-tight text-parchment">
              Panel Pengurus
            </p>
            <p className="text-[11px] text-parchment-3">Jagad Shalawat</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveNav(item.id);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-gold/15 text-gold-2"
                    : "text-parchment-3 hover:bg-ink-3 hover:text-parchment"
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="px-3 pb-1">
          <ThemeToggle />
        </div>

        {/* Lihat Web */}
        <div className="px-3 pb-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-parchment-3 transition hover:bg-ink-3 hover:text-parchment"
          >
            <ExternalLink className="h-4.5 w-4.5" />
            Lihat Web
          </a>
        </div>

        {/* Logout */}
        <div className="border-t border-gold/15 p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-parchment-3 transition hover:bg-ink-3 hover:text-parchment"
          >
            <LogOut className="h-4.5 w-4.5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (mobile) */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-gold/15 bg-ink-2/80 px-4 backdrop-blur-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-parchment-3 hover:bg-ink-3 hover:text-parchment"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-display text-sm font-semibold text-parchment">Panel Pengurus</p>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {activeNav === "dashboard" && <DashboardPlaceholder />}
          {activeNav === "donasi" && <DonasiPage />}
          {activeNav === "jadwal" && <JadwalPage />}
          {activeNav === "artikel" && <ArtikelPage />}
          {activeNav === "galeri" && <GaleriPage />}
          {activeNav === "doawirid" && <DoaWiridPage />}
        </main>
      </div>
    </div>
  );
}

/* ─── Placeholder untuk halaman lain ─── */
/* ─── Dashboard ─── */
function DashboardPlaceholder() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/donations").then((r) => r.json()),
      fetch("/api/admin/schedules").then((r) => r.json()),
      fetch("/api/admin/articles").then((r) => r.json()),
    ])
      .then(([d, s, a]) => {
        setDonations(d.donations || []);
        setSchedules(s.schedules || []);
        setArticles(a.articles || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { label: string; amount: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
      const monthDonations = donations.filter((don) => {
        const donDate = don.createdAt.slice(0, 7);
        return donDate === key && don.status === "verified";
      });
      months.push({
        label,
        amount: monthDonations.reduce((s, don) => s + don.amount, 0),
        count: monthDonations.length,
      });
    }
    return months;
  }, [donations]);

  const methodBreakdown = useMemo(() => {
    const map: Record<string, { count: number; amount: number }> = {};
    donations.forEach((d) => {
      const key = d.method;
      if (!map[key]) map[key] = { count: 0, amount: 0 };
      map[key].count++;
      map[key].amount += d.amount;
    });
    return Object.entries(map)
      .map(([method, data]) => ({ method, ...data }))
      .sort((a, b) => b.amount - a.amount);
  }, [donations]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gold-2" />
      </div>
    );
  }

  const totalAmount = donations.reduce((s, d) => s + d.amount, 0);
  const verifiedCount = donations.filter((d) => d.status === "verified").length;
  const pendingCount = donations.length - verifiedCount;
  const avgDonation = donations.length > 0 ? Math.round(totalAmount / donations.length) : 0;

  const maxMonthly = Math.max(...monthlyData.map((m) => m.amount), 1);

  const methodColors: Record<string, string> = {
    bank_transfer: "bg-emerald-js",
    emoney: "bg-purple-500",
    va: "bg-blue-500",
  };

  const methodLabels: Record<string, string> = {
    bank_transfer: "Bank Transfer",
    emoney: "E-Money",
    va: "Virtual Account",
  };

  const maxMethod = Math.max(...methodBreakdown.map((m) => m.amount), 1);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-parchment-3">Ringkasan data komunitas Jagad Shalawat</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5">
          <p className="text-xs text-parchment-3">Total Donasi Terverifikasi</p>
          <p className="mt-1 font-display text-2xl font-semibold text-gradient-gold">{formatRupiah(totalAmount)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-js/20 bg-emerald-js/5 p-5">
          <p className="text-xs text-parchment-3">Terverifikasi</p>
          <p className="mt-1 font-display text-2xl font-semibold text-emerald-300">{verifiedCount} donasi</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="text-xs text-parchment-3">Menunggu Verifikasi</p>
          <p className="mt-1 font-display text-2xl font-semibold text-amber-300">{pendingCount} donasi</p>
        </div>
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
          <p className="text-xs text-parchment-3">Rata-rata Donasi</p>
          <p className="mt-1 font-display text-2xl font-semibold text-purple-300">{formatRupiah(avgDonation)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Chart */}
        <div className="rounded-2xl border border-gold/15 p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-parchment">Donasi Bulanan (6 Bulan Terakhir)</h3>
          <div className="flex items-end gap-2" style={{ height: 180 }}>
            {monthlyData.map((m, i) => {
              const h = m.amount > 0 ? Math.max((m.amount / maxMonthly) * 140, 8) : 4;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] text-parchment-3">
                    {m.amount > 0 ? formatRupiah(m.amount) : "-"}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-gold-3 to-gold-2 transition-all duration-500"
                    style={{ height: h }}
                  />
                  <span className="text-[10px] text-parchment-3">{m.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Method Breakdown */}
        <div className="rounded-2xl border border-gold/15 p-5">
          <h3 className="mb-4 font-display text-base font-semibold text-parchment">Donasi per Metode</h3>
          <div className="space-y-4">
            {methodBreakdown.length === 0 ? (
              <p className="text-sm text-parchment-3">Belum ada data</p>
            ) : (
              methodBreakdown.map((m) => {
                const pct = maxMethod > 0 ? (m.amount / maxMethod) * 100 : 0;
                return (
                  <div key={m.method}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-parchment">{methodLabels[m.method] || m.method}</span>
                      <span className="text-parchment-3">{m.count} donasi · {formatRupiah(m.amount)}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-ink-3">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${methodColors[m.method] || "bg-gold"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Summary */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-ink-3/50 p-3 text-center">
              <p className="text-lg font-display font-semibold text-parchment">{schedules.length}</p>
              <p className="text-[10px] text-parchment-3">Jadwal</p>
            </div>
            <div className="rounded-xl bg-ink-3/50 p-3 text-center">
              <p className="text-lg font-display font-semibold text-parchment">{articles.length}</p>
              <p className="text-[10px] text-parchment-3">Artikel</p>
            </div>
            <div className="rounded-xl bg-ink-3/50 p-3 text-center">
              <p className="text-lg font-display font-semibold text-parchment">{donations.length}</p>
              <p className="text-[10px] text-parchment-3">Total Donasi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="mt-6 rounded-2xl border border-gold/15 p-5">
        <h3 className="mb-4 font-display text-base font-semibold text-parchment">Donasi Terbaru</h3>
        {donations.length === 0 ? (
          <p className="text-sm text-parchment-3">Belum ada donasi</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gold/10 text-[11px] uppercase tracking-wider text-parchment-3">
                  <th className="pb-2 font-medium">Donor</th>
                  <th className="pb-2 font-medium">Nominal</th>
                  <th className="pb-2 font-medium">Metode</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {donations.slice(0, 5).map((d) => (
                  <tr key={d.id}>
                    <td className="py-2.5 text-parchment">{d.isAnonymous ? "Hamba Allah" : d.name}</td>
                    <td className="py-2.5 font-semibold text-gradient-gold">{formatRupiah(d.amount)}</td>
                    <td className="py-2.5 text-parchment-2">{d.channel}</td>
                    <td className="py-2.5">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase ${d.status === "verified" ? "bg-emerald-js/20 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-2.5 text-parchment-3">{formatDateTime(d.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Halaman Donasi ─── */
function DonasiPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "verified">("all");
  const [filterMethod, setFilterMethod] = useState<"all" | "bank_transfer" | "emoney" | "va">("all");
  const [page, setPage] = useState(1);
  const [viewingDonation, setViewingDonation] = useState<Donation | null>(null);

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

  const filtered = useMemo(() => {
    return donations.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        search === "" ||
        d.name.toLowerCase().includes(q) ||
        (d.message && d.message.toLowerCase().includes(q));
      const matchStatus = filterStatus === "all" || d.status === filterStatus;
      const matchMethod = filterMethod === "all" || d.method === filterMethod;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [donations, search, filterStatus, filterMethod]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, filterMethod]);

  const verifiedCount = donations.filter((d) => d.status === "verified").length;
  const totalAmount = donations.reduce((s, d) => s + d.amount, 0);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Riwayat Donasi</h1>
        <p className="mt-1 text-sm text-parchment-3">
          {donations.length} entri · {verifiedCount} terverifikasi · Total{" "}
          {formatRupiah(totalAmount)}
        </p>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Donasi"
          value={formatRupiah(totalAmount)}
          accent="gold"
        />
        <StatCard
          label="Terverifikasi"
          value={`${verifiedCount} dari ${donations.length}`}
          accent="emerald"
        />
        <StatCard
          label="Menunggu"
          value={`${donations.length - verifiedCount} donasi`}
          accent="amber"
        />
      </div>

      {/* Search & Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-3" />
          <input
            type="text"
            placeholder="Cari nama atau pesan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gold/15 bg-ink-2 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-parchment-3 focus:border-gold/50"
          />
        </div>
        <FilterDropdown
          value={filterStatus}
          onChange={(v) => setFilterStatus(v as typeof filterStatus)}
          icon={<Shield className="h-4 w-4" />}
          options={[
            { value: "all", label: "Semua Status" },
            { value: "pending", label: "Pending", icon: <Circle className="h-3.5 w-3.5 text-amber-400" /> },
            { value: "verified", label: "Verified", icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> },
          ]}
        />
        <FilterDropdown
          value={filterMethod}
          onChange={(v) => setFilterMethod(v as typeof filterMethod)}
          icon={<Wallet className="h-4 w-4" />}
          options={[
            { value: "all", label: "Semua Metode" },
            { value: "bank_transfer", label: "Bank Transfer", icon: <Landmark className="h-3.5 w-3.5" /> },
            { value: "emoney", label: "E-Money", icon: <Smartphone className="h-3.5 w-3.5" /> },
            { value: "va", label: "VA", icon: <Banknote className="h-3.5 w-3.5" /> },
          ]}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gold/15">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gold/15 bg-ink-2/60">
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">No</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Nama</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Nominal</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Channel</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Tanggal</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-parchment-3">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold-2" />
                    <p className="mt-2">Memuat data...</p>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-parchment-3">
                    Tidak ada donasi ditemukan.
                  </td>
                </tr>
              ) : (
                paginated.map((d, i) => {
                  const rowNum = (page - 1) * ITEMS_PER_PAGE + i + 1;
                  if (editingId === d.id) {
                    return (
                      <EditRow
                        key={d.id}
                        donation={d}
                        rowNum={rowNum}
                        onCancel={() => setEditingId(null)}
                        onSaved={() => {
                          setEditingId(null);
                          load();
                        }}
                      />
                    );
                  }
                  return (
                    <tr key={d.id} className="border-b border-gold/10 transition hover:bg-ink-2/40">
                      <td className="px-4 py-3 text-parchment-3">{rowNum}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-parchment">
                            {d.isAnonymous ? "Hamba Allah" : d.name}
                          </span>
                          {d.isAnonymous && (
                            <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gold-2">
                              anonim
                            </span>
                          )}
                        </div>
                        {d.message && (
                          <p className="mt-0.5 max-w-[200px] truncate text-xs text-parchment-3">
                            &ldquo;{d.message}&rdquo;
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gradient-gold">
                        {formatRupiah(d.amount)}
                      </td>
                      <td className="px-4 py-3 text-parchment-2">{d.channel}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                            d.status === "verified"
                              ? "bg-emerald-js/20 text-emerald-300"
                              : "bg-amber-500/15 text-amber-300"
                          }`}
                        >
                          {d.status === "verified" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <Circle className="h-3 w-3" />
                          )}
                          {d.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-xs text-parchment-3">
                        {formatDateTime(d.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => setViewingDonation(d)}
                            title="Lihat detail"
                            className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-2.5 py-1 text-[11px] font-medium text-parchment transition hover:bg-gold/10"
                          >
                            <Eye className="h-3 w-3" /> Lihat
                          </button>
                          <button
                            onClick={() =>
                              patch(d.id, {
                                status: d.status === "verified" ? "pending" : "verified",
                              })
                            }
                            title={d.status === "verified" ? "Batalkan verifikasi" : "Verifikasi"}
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                              d.status === "verified"
                                ? "border-emerald-500/40 bg-emerald-js/15 text-emerald-300 hover:bg-emerald-js/25"
                                : "border-gold/30 bg-gold/10 text-gold-2 hover:bg-gold/20"
                            }`}
                          >
                            {d.status === "verified" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Circle className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingId(d.id)}
                            title="Edit"
                            className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-2.5 py-1 text-[11px] font-medium text-parchment transition hover:bg-gold/10"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => del(d.id)}
                            title="Hapus"
                            className="inline-flex items-center gap-1 rounded-full border border-red-500/40 px-2.5 py-1 text-[11px] font-medium text-red-300 transition hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-parchment-3">
          <span>
            Menampilkan {(page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-full border border-gold/20 px-3 py-1.5 text-xs font-medium text-parchment transition hover:bg-gold/10 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>
            <span className="text-xs text-parchment-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 rounded-full border border-gold/20 px-3 py-1.5 text-xs font-medium text-parchment transition hover:bg-gold/10 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {viewingDonation && (
        <DonationDetail
          donation={viewingDonation}
          onClose={() => setViewingDonation(null)}
        />
      )}
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "gold" | "emerald" | "amber";
}) {
  const colors = {
    gold: "border-gold/20 bg-gold/5 text-gold-2",
    emerald: "border-emerald-js/20 bg-emerald-js/5 text-emerald-300",
    amber: "border-amber-500/20 bg-amber-500/5 text-amber-300",
  };
  return (
    <div className={`rounded-2xl border px-5 py-4 ${colors[accent]}`}>
      <p className="text-xs text-parchment-3">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
    </div>
  );
}

/* ─── Detail Modal ─── */
function DonationDetail({
  donation,
  onClose,
}: {
  donation: Donation;
  onClose: () => void;
}) {
  const d = donation;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-lg rounded-3xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/10 font-display text-xl font-semibold text-gold-2">
              {(d.isAnonymous ? "H" : d.name).charAt(0).toUpperCase()}
            </span>
            <div>
              <h3 className="font-display text-xl font-semibold text-parchment">
                {d.isAnonymous ? "Hamba Allah" : d.name}
              </h3>
              <p className="text-sm font-semibold text-gradient-gold">
                {formatRupiah(d.amount)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-parchment-3 transition hover:bg-ink-2 hover:text-parchment"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <DetailRow icon={<User className="h-4 w-4" />} label="Nama" value={d.isAnonymous ? "Hamba Allah (Anonim)" : d.name} />
          <DetailRow icon={<Hash className="h-4 w-4" />} label="Nominal" value={formatRupiah(d.amount)} valueClass="font-semibold text-gradient-gold" />
          <DetailRow
            icon={<Shield className="h-4 w-4" />}
            label="Status"
            value={
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs uppercase tracking-wide ${d.status === "verified" ? "bg-emerald-js/20 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                {d.status === "verified" ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                {d.status}
              </span>
            }
          />
          <DetailRow icon={<Wallet className="h-4 w-4" />} label="Metode" value={titleCase(d.method)} />
          <DetailRow icon={<CreditCard className="h-4 w-4" />} label="Channel" value={d.channel} />
          <DetailRow icon={<Calendar className="h-4 w-4" />} label="Tanggal" value={formatDateTime(d.createdAt)} />
          {d.message && <DetailRow icon={<MessageSquare className="h-4 w-4" />} label="Pesan" value={<span className="italic">&ldquo;{d.message}&rdquo;</span>} />}
          {d.receiptUrl && (
            <DetailRow
              icon={<ImageIcon className="h-4 w-4" />}
              label="Bukti"
              value={
                <a href={d.receiptUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gold-2 underline decoration-gold/40 underline-offset-2 transition hover:text-gold">
                  <FileText className="h-3.5 w-3.5" /> Lihat Bukti
                </a>
              }
            />
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-gold/30 px-5 py-2.5 text-sm font-medium text-parchment transition hover:bg-gold/10 hover:text-gold-2"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-ink-2/50 px-4 py-3">
      <span className="mt-0.5 text-parchment-3">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-parchment-3">{label}</p>
        <div className={`mt-0.5 text-sm text-parchment ${valueClass || ""}`}>{value}</div>
      </div>
    </div>
  );
}

/* ─── Edit Row ─── */
function EditRow({
  donation,
  rowNum,
  onCancel,
  onSaved,
}: {
  donation: Donation;
  rowNum: number;
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
    <tr className="border-b border-gold/40 bg-gold/5">
      <td className="px-4 py-3 text-parchment-3">{rowNum}</td>
      <td colSpan={6} className="px-4 py-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
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
        <div className="mt-3 flex justify-end gap-2">
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
      </td>
    </tr>
  );
}

/* ═══════════════════════════════════════════════════════════
   HALAMAN JADWAL KEGIATAN
   ═══════════════════════════════════════════════════════════ */

interface ScheduleItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  location: string | null;
  type: "sholawat" | "dzikir" | "event" | "meeting";
  status: "upcoming" | "completed" | "cancelled";
  createdAt: string;
}

const SCHEDULE_TYPE_LABELS: Record<string, string> = {
  sholawat: "Sholawat",
  dzikir: "Dzikir",
  event: "Event",
  meeting: "Meeting",
};

const SCHEDULE_TYPE_COLORS: Record<string, string> = {
  sholawat: "bg-gold/15 text-gold-2",
  dzikir: "bg-emerald-js/15 text-emerald-300",
  event: "bg-purple-500/15 text-purple-300",
  meeting: "bg-blue-500/15 text-blue-300",
};

const STATUS_COLORS: Record<string, string> = {
  upcoming: "bg-amber-500/15 text-amber-300",
  completed: "bg-emerald-js/15 text-emerald-300",
  cancelled: "bg-red-500/15 text-red-300",
};

function JadwalPage() {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "sholawat" | "dzikir" | "event" | "meeting">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "completed" | "cancelled">("all");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/schedules");
    const data = await res.json();
    setSchedules(data.schedules || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Hapus jadwal ini?")) return;
    await fetch("/api/admin/schedules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  const filtered = useMemo(() => {
    return schedules.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch = search === "" || s.title.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q));
      const matchType = filterType === "all" || s.type === filterType;
      const matchStatus = filterStatus === "all" || s.status === filterStatus;
      return matchSearch && matchType && matchStatus;
    });
  }, [schedules, search, filterType, filterStatus]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Jadwal Kegiatan</h1>
          <p className="mt-1 text-sm text-parchment-3">{schedules.length} jadwal tercatat</p>
        </div>
        <button
          onClick={() => { setEditingSchedule(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-5 py-2.5 text-sm font-semibold text-ink transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> Tambah Jadwal
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-3" />
          <input
            type="text"
            placeholder="Cari jadwal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gold/15 bg-ink-2 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-parchment-3 focus:border-gold/50"
          />
        </div>
        <FilterDropdown
          value={filterType}
          onChange={(v) => setFilterType(v as typeof filterType)}
          icon={<Calendar className="h-4 w-4" />}
          options={[
            { value: "all", label: "Semua Jenis" },
            { value: "sholawat", label: "Sholawat", icon: <Heart className="h-3.5 w-3.5" /> },
            { value: "dzikir", label: "Dzikir", icon: <BookOpen className="h-3.5 w-3.5" /> },
            { value: "event", label: "Event", icon: <Megaphone className="h-3.5 w-3.5" /> },
            { value: "meeting", label: "Meeting", icon: <User className="h-3.5 w-3.5" /> },
          ]}
        />
        <FilterDropdown
          value={filterStatus}
          onChange={(v) => setFilterStatus(v as typeof filterStatus)}
          icon={<Shield className="h-4 w-4" />}
          options={[
            { value: "all", label: "Semua Status" },
            { value: "upcoming", label: "Upcoming", icon: <Clock className="h-3.5 w-3.5 text-amber-400" /> },
            { value: "completed", label: "Completed", icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> },
            { value: "cancelled", label: "Cancelled", icon: <X className="h-3.5 w-3.5 text-red-400" /> },
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gold/15">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gold/15 bg-ink-2/60">
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">No</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Judul</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Tanggal</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Waktu</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Lokasi</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Jenis</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-parchment-3">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold-2" />
                    <p className="mt-2">Memuat data...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-parchment-3">
                    Belum ada jadwal kegiatan.
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr key={s.id} className="border-b border-gold/10 transition hover:bg-ink-2/40">
                    <td className="px-4 py-3 text-parchment-3">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-parchment">{s.title}</p>
                      {s.description && (
                        <p className="mt-0.5 max-w-[250px] truncate text-xs text-parchment-3">{s.description}</p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-parchment-2">{s.date}</td>
                    <td className="px-4 py-3 text-parchment-2">{s.time || "-"}</td>
                    <td className="px-4 py-3 text-parchment-2">{s.location || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide ${SCHEDULE_TYPE_COLORS[s.type]}`}>
                        {SCHEDULE_TYPE_LABELS[s.type]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide ${STATUS_COLORS[s.status]}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { setEditingSchedule(s); setShowForm(true); }}
                          className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-2.5 py-1 text-[11px] font-medium text-parchment transition hover:bg-gold/10"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => del(s.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-red-500/40 px-2.5 py-1 text-[11px] font-medium text-red-300 transition hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ScheduleForm
          schedule={editingSchedule}
          onClose={() => { setShowForm(false); setEditingSchedule(null); }}
          onSaved={() => { setShowForm(false); setEditingSchedule(null); load(); }}
        />
      )}
    </div>
  );
}

function ScheduleForm({
  schedule,
  onClose,
  onSaved,
}: {
  schedule: ScheduleItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(schedule?.title || "");
  const [description, setDescription] = useState(schedule?.description || "");
  const [date, setDate] = useState(schedule?.date || "");
  const [time, setTime] = useState(schedule?.time || "");
  const [location, setLocation] = useState(schedule?.location || "");
  const [type, setType] = useState<string>(schedule?.type || "sholawat");
  const [status, setStatus] = useState<string>(schedule?.status || "upcoming");
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const method = schedule ? "PATCH" : "POST";
    await fetch("/api/admin/schedules", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: schedule?.id,
        title, description, date, time, location, type, status,
      }),
    });
    setBusy(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-lg rounded-3xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">{schedule ? "Edit Jadwal" : "Tambah Jadwal"}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-parchment-3 transition hover:bg-ink-2 hover:text-parchment">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs text-parchment-3">Judul</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-parchment-3">Deskripsi</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-parchment-3">Tanggal</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-parchment-3">Waktu</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-parchment-3">Lokasi</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-parchment-3">Jenis</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50">
                <option value="sholawat">Sholawat</option>
                <option value="dzikir">Dzikir</option>
                <option value="event">Event</option>
                <option value="meeting">Meeting</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-parchment-3">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50">
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-4 py-2 text-sm text-parchment transition hover:bg-gold/10">
            <X className="h-4 w-4" /> Batal
          </button>
          <button onClick={save} disabled={busy || !title || !date} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-5 py-2 text-sm font-semibold text-ink transition hover:brightness-110 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HALAMAN ARTIKEL & PENGUMUMAN
   ═══════════════════════════════════════════════════════════ */

interface ArticleItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverUrl: string | null;
  category: "artikel" | "pengumuman";
  isPublished: boolean;
  author: string | null;
  createdAt: string;
  updatedAt: string | null;
}

const ARTICLE_CATEGORY_COLORS: Record<string, string> = {
  artikel: "bg-gold/15 text-gold-2",
  pengumuman: "bg-blue-500/15 text-blue-300",
};

function ArtikelPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<"all" | "artikel" | "pengumuman">("all");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/articles");
    const data = await res.json();
    setArticles(data.articles || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Hapus artikel ini?")) return;
    await fetch("/api/admin/articles", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  async function togglePublish(id: string, current: boolean) {
    await fetch("/api/admin/articles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isPublished: !current }),
    });
    await load();
  }

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch = search === "" || a.title.toLowerCase().includes(q) || (a.excerpt && a.excerpt.toLowerCase().includes(q));
      const matchCategory = filterCategory === "all" || a.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [articles, search, filterCategory]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Artikel & Pengumuman</h1>
          <p className="mt-1 text-sm text-parchment-3">{articles.length} artikel tercatat</p>
        </div>
        <button
          onClick={() => { setEditingArticle(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-5 py-2.5 text-sm font-semibold text-ink transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> Tambah Artikel
        </button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-3" />
          <input
            type="text"
            placeholder="Cari artikel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gold/15 bg-ink-2 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-parchment-3 focus:border-gold/50"
          />
        </div>
        <FilterDropdown
          value={filterCategory}
          onChange={(v) => setFilterCategory(v as typeof filterCategory)}
          icon={<BookOpen className="h-4 w-4" />}
          options={[
            { value: "all", label: "Semua Kategori" },
            { value: "artikel", label: "Artikel", icon: <FileText className="h-3.5 w-3.5" /> },
            { value: "pengumuman", label: "Pengumuman", icon: <Megaphone className="h-3.5 w-3.5" /> },
          ]}
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gold/15">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gold/15 bg-ink-2/60">
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">No</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Judul</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Kategori</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Penulis</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Tanggal</th>
                <th className="px-4 py-3 text-xs font-medium text-parchment-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-parchment-3">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-gold-2" />
                    <p className="mt-2">Memuat data...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-parchment-3">
                    Belum ada artikel.
                  </td>
                </tr>
              ) : (
                filtered.map((a, i) => (
                  <tr key={a.id} className="border-b border-gold/10 transition hover:bg-ink-2/40">
                    <td className="px-4 py-3 text-parchment-3">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-parchment">{a.title}</p>
                      {a.excerpt && (
                        <p className="mt-0.5 max-w-[250px] truncate text-xs text-parchment-3">{a.excerpt}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide ${ARTICLE_CATEGORY_COLORS[a.category]}`}>
                        {a.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-parchment-2">{a.author || "-"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => togglePublish(a.id, a.isPublished)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wide transition ${
                          a.isPublished
                            ? "bg-emerald-js/20 text-emerald-300 hover:bg-emerald-js/30"
                            : "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                        }`}
                      >
                        {a.isPublished ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                        {a.isPublished ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-parchment-3">
                      {formatDateTime(a.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { setEditingArticle(a); setShowForm(true); }}
                          className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-2.5 py-1 text-[11px] font-medium text-parchment transition hover:bg-gold/10"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => del(a.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-red-500/40 px-2.5 py-1 text-[11px] font-medium text-red-300 transition hover:bg-red-500/10"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ArticleForm
          article={editingArticle}
          onClose={() => { setShowForm(false); setEditingArticle(null); }}
          onSaved={() => { setShowForm(false); setEditingArticle(null); load(); }}
        />
      )}
    </div>
  );
}

function ArticleForm({
  article,
  onClose,
  onSaved,
}: {
  article: ArticleItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(article?.title || "");
  const [content, setContent] = useState(article?.content || "");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [category, setCategory] = useState<string>(article?.category || "artikel");
  const [author, setAuthor] = useState(article?.author || "");
  const [isPublished, setIsPublished] = useState(article?.isPublished || false);
  const [busy, setBusy] = useState(false);

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function save() {
    setBusy(true);
    const method = article ? "PATCH" : "POST";
    await fetch("/api/admin/articles", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: article?.id,
        title, slug: slugify(title), content, excerpt, category, author, isPublished,
      }),
    });
    setBusy(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">{article ? "Edit Artikel" : "Tambah Artikel"}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-parchment-3 transition hover:bg-ink-2 hover:text-parchment">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs text-parchment-3">Judul</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-parchment-3">Ringkasan</label>
            <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-parchment-3">Konten</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-parchment-3">Kategori</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50">
                <option value="artikel">Artikel</option>
                <option value="pengumuman">Pengumuman</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-parchment-3">Penulis</label>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-parchment-3">Status</label>
              <button
                type="button"
                onClick={() => setIsPublished(!isPublished)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  isPublished
                    ? "border-emerald-500/40 bg-emerald-js/15 text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                }`}
              >
                {isPublished ? "Published" : "Draft"}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-4 py-2 text-sm text-parchment transition hover:bg-gold/10">
            <X className="h-4 w-4" /> Batal
          </button>
          <button onClick={save} disabled={busy || !title || !content} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-5 py-2 text-sm font-semibold text-ink transition hover:brightness-110 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HALAMAN GALERI FOTO
   ═══════════════════════════════════════════════════════════ */

interface GalleryItem {
  id: string;
  photoUrl: string;
  caption: string | null;
  eventDate: string | null;
  category: string | null;
  sortOrder: number;
  isVisible: boolean;
  createdAt: string;
}

function GaleriPage() {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryItem | null>(null);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/gallery");
    const data = await res.json();
    setPhotos(data.photos || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Hapus foto ini?")) return;
    await fetch("/api/admin/gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  async function toggleVisible(id: string, current: boolean) {
    await fetch("/api/admin/gallery", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isVisible: !current }),
    });
    await load();
  }

  const filtered = useMemo(() => {
    return photos.filter((p) => {
      const q = search.toLowerCase();
      return search === "" || (p.caption && p.caption.toLowerCase().includes(q)) || (p.category && p.category.toLowerCase().includes(q));
    });
  }, [photos, search]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Galeri Foto</h1>
          <p className="mt-1 text-sm text-parchment-3">{photos.length} foto tercatat</p>
        </div>
        <button
          onClick={() => { setEditingPhoto(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-5 py-2.5 text-sm font-semibold text-ink transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> Tambah Foto
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-3" />
          <input
            type="text"
            placeholder="Cari foto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gold/15 bg-ink-2 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-parchment-3 focus:border-gold/50"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gold-2" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gold/15 py-16 text-center text-parchment-3">
          Belum ada foto di galeri.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="group overflow-hidden rounded-2xl border border-gold/15 transition hover:border-gold/30">
              <div className="relative aspect-square overflow-hidden bg-ink-2">
                <img
                  src={p.photoUrl}
                  alt={p.caption || ""}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 transition group-hover:opacity-100">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => { setEditingPhoto(p); setShowForm(true); }}
                      className="rounded-full bg-white/20 p-1.5 backdrop-blur-sm transition hover:bg-white/30"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-white" />
                    </button>
                    <button
                      onClick={() => toggleVisible(p.id, p.isVisible)}
                      className={`rounded-full p-1.5 backdrop-blur-sm transition ${p.isVisible ? "bg-white/20 hover:bg-white/30" : "bg-amber-500/30 hover:bg-amber-500/40"}`}
                    >
                      <Eye className="h-3.5 w-3.5 text-white" />
                    </button>
                    <button
                      onClick={() => del(p.id)}
                      className="rounded-full bg-red-500/30 p-1.5 backdrop-blur-sm transition hover:bg-red-500/40"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-parchment">{p.caption || "Tanpa caption"}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-parchment-3">
                  {p.category && <span>{p.category}</span>}
                  {p.eventDate && <span>{p.eventDate}</span>}
                  {!p.isVisible && (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-300">Tersembunyi</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <GalleryForm
          photo={editingPhoto}
          onClose={() => { setShowForm(false); setEditingPhoto(null); }}
          onSaved={() => { setShowForm(false); setEditingPhoto(null); load(); }}
        />
      )}
    </div>
  );
}

function GalleryForm({
  photo,
  onClose,
  onSaved,
}: {
  photo: GalleryItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [photoUrl, setPhotoUrl] = useState(photo?.photoUrl || "");
  const [caption, setCaption] = useState(photo?.caption || "");
  const [eventDate, setEventDate] = useState(photo?.eventDate || "");
  const [category, setCategory] = useState(photo?.category || "");
  const [sortOrder, setSortOrder] = useState(String(photo?.sortOrder || 0));
  const [isVisible, setIsVisible] = useState(photo?.isVisible ?? true);
  const [busy, setBusy] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) setPhotoUrl(data.url);
    setBusy(false);
  }

  async function save() {
    setBusy(true);
    const method = photo ? "PATCH" : "POST";
    await fetch("/api/admin/gallery", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: photo?.id,
        photoUrl, caption, eventDate, category, sortOrder: Number(sortOrder), isVisible,
      }),
    });
    setBusy(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-lg rounded-3xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">{photo ? "Edit Foto" : "Tambah Foto"}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-parchment-3 transition hover:bg-ink-2 hover:text-parchment">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs text-parchment-3">Upload Foto</label>
            <input type="file" accept="image/*" onChange={handleUpload} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
          </div>
          {photoUrl && (
            <div className="overflow-hidden rounded-xl">
              <img src={photoUrl} alt="Preview" className="w-full object-cover" />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs text-parchment-3">Caption</label>
            <input value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-parchment-3">Tanggal Event</label>
              <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-parchment-3">Kategori</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="contoh: Sholawat Jumat" className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-parchment-3">Urutan</label>
              <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-parchment-3">Visibilitas</label>
              <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  isVisible
                    ? "border-emerald-500/40 bg-emerald-js/15 text-emerald-300"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                }`}
              >
                {isVisible ? "Terlihat" : "Tersembunyi"}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-4 py-2 text-sm text-parchment transition hover:bg-gold/10">
            <X className="h-4 w-4" /> Batal
          </button>
          <button onClick={save} disabled={busy || !photoUrl} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-5 py-2 text-sm font-semibold text-ink transition hover:brightness-110 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   HALAMAN DOA & WIRID
   ═══════════════════════════════════════════════════════════ */

interface DoaWiridCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  items: DoaWiridItem[];
}

interface DoaWiridItem {
  id: string;
  categoryId: string;
  title: string;
  arab: string;
  latin: string;
  translation: string;
  contentParts?: ContentPartItem[] | null;
  sortOrder: number;
}

function DoaWiridPage() {
  const [activeTab, setActiveTab] = useState<"doa" | "wirid">("doa");
  const [categories, setCategories] = useState<DoaWiridCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DoaWiridCategory | null>(null);
  const [editingItem, setEditingItem] = useState<DoaWiridItem | null>(null);
  const [search, setSearch] = useState("");

  const apiBase = activeTab === "doa" ? "/api/admin/doa" : "/api/admin/wirid";

  async function load() {
    setLoading(true);
    const res = await fetch(apiBase);
    const data = await res.json();
    setCategories(data.categories || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    setSelectedCategory(null);
    setSearch("");
  }, [activeTab]);

  async function deleteCategory(id: string) {
    if (!confirm("Hapus kategori beserta semua item di dalamnya?")) return;
    await fetch(apiBase, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "category", id }),
    });
    setSelectedCategory(null);
    await load();
  }

  async function deleteItem(id: string) {
    if (!confirm("Hapus bacaan ini?")) return;
    await fetch(apiBase, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "item", id }),
    });
    await load();
  }

  const selectedCat = categories.find((c) => c.id === selectedCategory);

  const filteredCategories = categories.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.items.some((i) => i.title.toLowerCase().includes(q))
    );
  });

  const filteredItems = selectedCat?.items.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      i.translation.toLowerCase().includes(q)
    );
  });

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Doa & Wirid</h1>
          <p className="mt-1 text-sm text-parchment-3">
            {categories.length} kategori · {totalItems} bacaan
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}
            className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-ink-2 px-4 py-2.5 text-sm font-medium text-parchment transition hover:bg-gold/10"
          >
            <Plus className="h-4 w-4" /> Kategori
          </button>
          {selectedCategory && (
            <button
              onClick={() => { setEditingItem(null); setShowItemForm(true); }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-5 py-2.5 text-sm font-semibold text-ink transition hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> Tambah Bacaan
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-ink-2 p-1">
        <button
          onClick={() => setActiveTab("doa")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
            activeTab === "doa"
              ? "bg-gold/15 text-gold-2"
              : "text-parchment-3 hover:bg-ink-3 hover:text-parchment"
          }`}
        >
          Doa ({categories.filter((c) => c.items.length > 0).length > 0 ? categories.reduce((s, c) => s + c.items.length, 0) : 0})
        </button>
        <button
          onClick={() => setActiveTab("wirid")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
            activeTab === "wirid"
              ? "bg-gold/15 text-gold-2"
              : "text-parchment-3 hover:bg-ink-3 hover:text-parchment"
          }`}
        >
          Wirid ({categories.reduce((s, c) => s + c.items.length, 0)})
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-3" />
          <input
            type="text"
            placeholder={selectedCategory ? "Cari bacaan..." : "Cari kategori atau bacaan..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gold/15 bg-ink-2 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-parchment-3 focus:border-gold/50"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-gold-2" />
        </div>
      ) : selectedCategory && selectedCat ? (
        /* Items List */
        <div>
          <button
            onClick={() => setSelectedCategory(null)}
            className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-parchment-3 transition hover:bg-ink-2 hover:text-parchment"
          >
            <ChevronLeft className="h-4 w-4" /> Kembali ke Kategori
          </button>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-parchment">{selectedCat.name}</h2>
            <span className="rounded-full bg-ink-2 px-3 py-1 text-xs text-parchment-3">
              {filteredItems?.length || 0} bacaan
            </span>
          </div>

          <div className="space-y-3">
            {filteredItems && filteredItems.length > 0 ? (
              filteredItems.map((item, i) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-gold/15 bg-ink-2/40 p-4 transition hover:border-gold/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-[11px] font-bold text-gold-2">
                          {i + 1}
                        </span>
                        <h3 className="font-medium text-parchment">{item.title}</h3>
                      </div>
                      <p
                        dir="rtl"
                        className="mt-2 truncate text-right text-sm leading-relaxed text-amber-200/50"
                        style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
                      >
                        {item.arab.slice(0, 120)}{item.arab.length > 120 ? "..." : ""}
                      </p>
                      {item.translation && (
                        <p className="mt-1.5 line-clamp-2 text-xs text-parchment-3">{item.translation}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        onClick={() => { setEditingItem(item); setShowItemForm(true); }}
                        className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-2.5 py-1 text-[11px] font-medium text-parchment transition hover:bg-gold/10"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-500/40 px-2.5 py-1 text-[11px] font-medium text-red-300 transition hover:bg-red-500/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-gold/15 py-12 text-center text-parchment-3">
                {search ? `Tidak ditemukan untuk "${search}"` : "Belum ada bacaan."}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Categories List */
        <div className="space-y-3">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className="group flex items-center gap-4 rounded-2xl border border-gold/15 bg-ink-2/40 p-4 transition hover:border-gold/30"
              >
                <button
                  onClick={() => { setSelectedCategory(cat.id); setSearch(""); }}
                  className="flex min-w-0 flex-1 items-center gap-4 text-left"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                    <BookOpen className="h-5 w-5 text-gold-2" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-parchment">{cat.name}</p>
                    <p className="text-xs text-parchment-3">{cat.items.length} bacaan</p>
                  </div>
                  <span className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold-2">
                    {cat.items.length}
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-parchment-3" />
                </button>
                <div className="flex shrink-0 gap-1.5 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={() => { setEditingCategory(cat); setShowCategoryForm(true); }}
                    className="inline-flex items-center gap-1 rounded-full border border-gold/30 px-2.5 py-1 text-[11px] font-medium text-parchment transition hover:bg-gold/10"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="inline-flex items-center gap-1 rounded-full border border-red-500/40 px-2.5 py-1 text-[11px] font-medium text-red-300 transition hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-gold/15 py-12 text-center text-parchment-3">
              {search ? `Tidak ditemukan untuk "${search}"` : "Belum ada kategori."}
            </div>
          )}
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <DoaWiridCategoryForm
          apiBase={apiBase}
          category={editingCategory}
          onClose={() => { setShowCategoryForm(false); setEditingCategory(null); }}
          onSaved={() => { setShowCategoryForm(false); setEditingCategory(null); load(); }}
        />
      )}

      {/* Item Form Modal */}
      {showItemForm && selectedCategory && (
        <DoaWiridItemForm
          apiBase={apiBase}
          categoryId={selectedCategory}
          item={editingItem}
          onClose={() => { setShowItemForm(false); setEditingItem(null); }}
          onSaved={() => { setShowItemForm(false); setEditingItem(null); load(); }}
        />
      )}
    </div>
  );
}

function DoaWiridCategoryForm({
  apiBase,
  category,
  onClose,
  onSaved,
}: {
  apiBase: string;
  category: DoaWiridCategory | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder || 0));
  const [busy, setBusy] = useState(false);

  function autoSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function save() {
    setBusy(true);
    const method = category ? "PATCH" : "POST";
    await fetch(apiBase, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "category",
        id: category?.id,
        name,
        slug: slug || autoSlug(name),
        sortOrder: Number(sortOrder),
      }),
    });
    setBusy(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-md rounded-3xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">{category ? "Edit Kategori" : "Tambah Kategori"}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-parchment-3 transition hover:bg-ink-2 hover:text-parchment">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs text-parchment-3">Nama Kategori</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); if (!category) setSlug(autoSlug(e.target.value)); }}
              placeholder="contoh: Ratib"
              className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-parchment-3">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="contoh: ratib"
              className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-parchment-3">Urutan</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-4 py-2 text-sm text-parchment transition hover:bg-gold/10">
            <X className="h-4 w-4" /> Batal
          </button>
          <button onClick={save} disabled={busy || !name} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-5 py-2 text-sm font-semibold text-ink transition hover:brightness-110 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

interface ContentPartItem {
  id: string;
  type: "text" | "verse" | "repeat" | "separator";
  label?: string;
  count?: number;
  arab: string;
  latin: string;
  translation: string;
}

function DoaWiridItemForm({
  apiBase,
  categoryId,
  item,
  onClose,
  onSaved,
}: {
  apiBase: string;
  categoryId: string;
  item: DoaWiridItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(item?.title || "");
  const [arab, setArab] = useState(item?.arab || "");
  const [latin, setLatin] = useState(item?.latin || "");
  const [translation, setTranslation] = useState(item?.translation || "");
  const [sortOrder, setSortOrder] = useState(String(item?.sortOrder || 0));
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"arab" | "latin" | "terjemahan">("arab");
  const [editorMode, setEditorMode] = useState<"simple" | "structured">(
    item?.contentParts && Array.isArray(item.contentParts) && (item.contentParts as ContentPartItem[]).length > 0 ? "structured" : "simple"
  );
  const [parts, setParts] = useState<ContentPartItem[]>(() => {
    if (item?.contentParts && Array.isArray(item.contentParts)) {
      return (item.contentParts as ContentPartItem[]).map((p, i) => ({
        ...p,
        id: p.id || `part-${i}`,
      }));
    }
    return [];
  });

  function addPart(type: ContentPartItem["type"]) {
    const newPart: ContentPartItem = {
      id: `part-${Date.now()}`,
      type,
      label: type === "verse" ? `Ayat ${parts.filter((p) => p.type === "verse").length + 1}` : undefined,
      count: type === "repeat" ? 3 : undefined,
      arab: "",
      latin: "",
      translation: "",
    };
    setParts([...parts, newPart]);
  }

  function updatePart(id: string, updates: Partial<ContentPartItem>) {
    setParts(parts.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }

  function removePart(id: string) {
    setParts(parts.filter((p) => p.id !== id));
  }

  function movePart(id: string, direction: "up" | "down") {
    const idx = parts.findIndex((p) => p.id === id);
    if (idx === -1) return;
    const newParts = [...parts];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newParts.length) return;
    [newParts[idx], newParts[swapIdx]] = [newParts[swapIdx], newParts[idx]];
    setParts(newParts);
  }

  async function save() {
    setBusy(true);
    const contentParts = editorMode === "structured" ? parts : null;
    // For simple mode, save directly to arab/latin/translation
    // For structured mode, also generate arab/latin/translation from parts
    let finalArab = arab;
    let finalLatin = latin;
    let finalTranslation = translation;

    if (editorMode === "structured" && parts.length > 0) {
      const arabParts: string[] = [];
      const latinParts: string[] = [];
      const translationParts: string[] = [];

      for (const part of parts) {
        if (part.type === "separator") {
          arabParts.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          latinParts.push("────────────────────────────────────────────────────────────────────────────");
          translationParts.push("────────────────────────────────────────────────────────────────────────────");
          continue;
        }

        if (part.label) {
          arabParts.push(`【 ${part.label} 】`);
          latinParts.push(`── ${part.label} ──`);
          translationParts.push(`── ${part.label} ──`);
        }

        if (part.type === "repeat" && part.count && part.count > 1) {
          arabParts.push(`${part.arab}  ×${part.count}`);
          latinParts.push(`${part.latin}  ×${part.count}`);
          translationParts.push(`${part.translation}  (${part.count}×)`);
        } else {
          if (part.arab) arabParts.push(part.arab);
          if (part.latin) latinParts.push(part.latin);
          if (part.translation) translationParts.push(part.translation);
        }
      }

      finalArab = arabParts.join("\n\n");
      finalLatin = latinParts.join("\n\n");
      finalTranslation = translationParts.join("\n\n");
    }

    const method = item ? "PATCH" : "POST";
    await fetch(apiBase, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "item",
        id: item?.id,
        categoryId,
        title,
        arab: finalArab,
        latin: finalLatin,
        translation: finalTranslation,
        contentParts: contentParts,
        sortOrder: Number(sortOrder),
      }),
    });
    setBusy(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">{item ? "Edit Bacaan" : "Tambah Bacaan"}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-parchment-3 transition hover:bg-ink-2 hover:text-parchment">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="mb-1 block text-xs text-parchment-3">Judul</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="contoh: Ratib al-Haddad"
              className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>

          {/* Editor Mode Toggle */}
          <div>
            <label className="mb-2 block text-xs text-parchment-3">Mode Editor</label>
            <div className="flex gap-1 rounded-lg bg-ink-3 p-0.5">
              <button
                onClick={() => setEditorMode("simple")}
                className={`flex-1 rounded-md py-2.5 text-sm font-medium transition ${
                  editorMode === "simple"
                    ? "bg-gold/15 text-gold-2"
                    : "text-parchment-3 hover:text-parchment"
                }`}
              >
                ✏️ Mode Sederhana
              </button>
              <button
                onClick={() => setEditorMode("structured")}
                className={`flex-1 rounded-md py-2.5 text-sm font-medium transition ${
                  editorMode === "structured"
                    ? "bg-gold/15 text-gold-2"
                    : "text-parchment-3 hover:text-parchment"
                }`}
              >
                📖 Mode Terstruktur
              </button>
            </div>
          </div>

          {/* Simple Mode */}
          {editorMode === "simple" && (
            <div>
              <div className="mb-2 flex gap-1 rounded-lg bg-ink-3 p-0.5">
                {(["arab", "latin", "terjemahan"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                      tab === t
                        ? "bg-gold/15 text-gold-2"
                        : "text-parchment-3 hover:text-parchment"
                    }`}
                  >
                    {t === "arab" ? "Teks Arab" : t === "latin" ? "Bacaan Latin" : "Terjemahan"}
                  </button>
                ))}
              </div>

              {tab === "arab" && (
                <textarea
                  value={arab}
                  onChange={(e) => setArab(e.target.value)}
                  dir="rtl"
                  rows={12}
                  placeholder="Tuliskan teks Arab di sini..."
                  className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-base leading-loose outline-none focus:border-gold/50"
                  style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
                />
              )}

              {tab === "latin" && (
                <textarea
                  value={latin}
                  onChange={(e) => setLatin(e.target.value)}
                  rows={12}
                  placeholder="Tuliskan bacaan Latin di sini..."
                  className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-gold/50"
                />
              )}

              {tab === "terjemahan" && (
                <textarea
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  rows={12}
                  placeholder="Tuliskan terjemahan dalam Bahasa Indonesia..."
                  className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-gold/50"
                />
              )}
            </div>
          )}

          {/* Structured Mode */}
          {editorMode === "structured" && (
            <div className="space-y-3">
              {/* Add Part Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => addPart("text")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-ink-2 px-3 py-1.5 text-xs font-medium text-parchment transition hover:bg-gold/10"
                >
                  <Plus className="h-3 w-3" /> Teks
                </button>
                <button
                  onClick={() => addPart("verse")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20"
                >
                  <Plus className="h-3 w-3" /> Ayat
                </button>
                <button
                  onClick={() => addPart("repeat")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
                >
                  <Plus className="h-3 w-3" /> Ulangi
                </button>
                <button
                  onClick={() => addPart("separator")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-medium text-purple-300 transition hover:bg-purple-500/20"
                >
                  <Plus className="h-3 w-3" /> Pemisah
                </button>
              </div>

              {/* Parts List */}
              {parts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gold/20 py-8 text-center text-sm text-parchment-3">
                  Klik tombol di atas untuk menambah bagian bacaan.
                </div>
              ) : (
                <div className="space-y-3">
                  {parts.map((part, idx) => {
                    const typeColors = {
                      text: "border-gold/20",
                      verse: "border-emerald-500/30",
                      repeat: "border-amber-500/30",
                      separator: "border-purple-500/30",
                    };
                    const typeLabels = {
                      text: "Teks",
                      verse: `Ayat ${parts.filter((p, i) => i <= idx && p.type === "verse").length}`,
                      repeat: `Ulangi ${part.count || 3}×`,
                      separator: "Pemisah",
                    };
                    const typeBg = {
                      text: "bg-gold/5",
                      verse: "bg-emerald-500/5",
                      repeat: "bg-amber-500/5",
                      separator: "bg-purple-500/5",
                    };

                    return (
                      <div
                        key={part.id}
                        className={`rounded-xl border ${typeColors[part.type]} ${typeBg[part.type]} p-4`}
                      >
                        {/* Part Header */}
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-ink-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-parchment-3">
                              {typeLabels[part.type]}
                            </span>
                            {part.type === "repeat" && (
                              <div className="flex items-center gap-1">
                                <label className="text-[10px] text-parchment-3">×Lihat:</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="999"
                                  value={part.count || 3}
                                  onChange={(e) => updatePart(part.id, { count: Number(e.target.value) || 1 })}
                                  className="w-14 rounded border border-gold/15 bg-ink-2 px-2 py-0.5 text-center text-xs outline-none focus:border-gold/50"
                                />
                              </div>
                            )}
                            {part.type !== "separator" && (
                              <input
                                value={part.label || ""}
                                onChange={(e) => updatePart(part.id, { label: e.target.value })}
                                placeholder="Label (opsional)"
                                className="rounded border border-gold/10 bg-transparent px-2 py-0.5 text-xs text-parchment-3 outline-none placeholder:text-parchment-3/50 focus:border-gold/30"
                              />
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => movePart(part.id, "up")}
                              disabled={idx === 0}
                              className="rounded p-1 text-parchment-3 transition hover:bg-ink-2 hover:text-parchment disabled:opacity-30"
                              title="Geser ke atas"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                            </button>
                            <button
                              onClick={() => movePart(part.id, "down")}
                              disabled={idx === parts.length - 1}
                              className="rounded p-1 text-parchment-3 transition hover:bg-ink-2 hover:text-parchment disabled:opacity-30"
                              title="Geser ke bawah"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                            </button>
                            <button
                              onClick={() => removePart(part.id)}
                              className="rounded p-1 text-red-400 transition hover:bg-red-500/10"
                              title="Hapus"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Part Content */}
                        {part.type !== "separator" && (
                          <div className="space-y-2">
                            <div>
                              <label className="mb-1 block text-[10px] text-parchment-3">Teks Arab</label>
                              <textarea
                                value={part.arab}
                                onChange={(e) => updatePart(part.id, { arab: e.target.value })}
                                dir="rtl"
                                rows={3}
                                placeholder="Tuliskan teks Arab..."
                                className="w-full rounded border border-gold/10 bg-ink-2/50 px-2.5 py-2 text-sm leading-relaxed outline-none focus:border-gold/30"
                                style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
                              />
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <div>
                                <label className="mb-1 block text-[10px] text-parchment-3">Bacaan Latin</label>
                                <textarea
                                  value={part.latin}
                                  onChange={(e) => updatePart(part.id, { latin: e.target.value })}
                                  rows={2}
                                  placeholder="Latin..."
                                  className="w-full rounded border border-gold/10 bg-ink-2/50 px-2.5 py-2 text-xs leading-relaxed outline-none focus:border-gold/30"
                                />
                              </div>
                              <div>
                                <label className="mb-1 block text-[10px] text-parchment-3">Terjemahan</label>
                                <textarea
                                  value={part.translation}
                                  onChange={(e) => updatePart(part.id, { translation: e.target.value })}
                                  rows={2}
                                  placeholder="Terjemahan..."
                                  className="w-full rounded border border-gold/10 bg-ink-2/50 px-2.5 py-2 text-xs leading-relaxed outline-none focus:border-gold/30"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs text-parchment-3">Urutan</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full rounded-lg border border-gold/15 bg-ink-2 px-3 py-2.5 text-sm outline-none focus:border-gold/50"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-4 py-2 text-sm text-parchment transition hover:bg-gold/10">
            <X className="h-4 w-4" /> Batal
          </button>
          <button onClick={save} disabled={busy || !title} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-2 via-gold to-gold-3 px-5 py-2 text-sm font-semibold text-ink transition hover:brightness-110 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
