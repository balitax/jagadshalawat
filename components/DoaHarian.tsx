"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";

interface ContentPart {
  type: "text" | "verse" | "repeat" | "separator";
  label?: string;
  count?: number;
  arab?: string;
  latin?: string;
  translation?: string;
}

interface DoaItem {
  id: string;
  title: string;
  arab: string;
  latin: string;
  translation: string;
  contentParts?: ContentPart[] | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  items: DoaItem[];
}

interface DoaHarianProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DoaHarian({ isOpen, onClose }: DoaHarianProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<"doa" | "wirid">("doa");
  const [doaCategories, setDoaCategories] = useState<Category[]>([]);
  const [wiridCategories, setWiridCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<DoaItem | null>(null);
  const [search, setSearch] = useState("");
  const [fontSize, setFontSize] = useState<"normal" | "large">("large");

  useEffect(() => {
    if (!isOpen) return;

    async function fetchData() {
      setLoading(true);
      try {
        const [doaRes, wiridRes] = await Promise.all([
          fetch("/api/doa"),
          fetch("/api/wirid"),
        ]);
        const doaData = await doaRes.json();
        const wiridData = await wiridRes.json();
        setDoaCategories(doaData.categories || []);
        setWiridCategories(wiridData.categories || []);
      } catch (e) {
        console.error("Failed to fetch data:", e);
      }
      setLoading(false);
    }

    fetchData();
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = activeTab === "doa" ? doaCategories : wiridCategories;
  const selectedCat = categories.find((c) => c.id === selectedCategory);

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.items.some(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.translation.toLowerCase().includes(search.toLowerCase())
      )
  );

  const filteredItems = selectedCat?.items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.translation.toLowerCase().includes(search.toLowerCase()) ||
      item.latin.toLowerCase().includes(search.toLowerCase())
  );

  const doaCount = doaCategories.reduce((acc, c) => acc + c.items.length, 0);
  const wiridCount = wiridCategories.reduce((acc, c) => acc + c.items.length, 0);

  const handleBack = () => {
    if (selectedItem) {
      setSelectedItem(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
      setSearch("");
    }
  };

  const handleTabChange = (tab: "doa" | "wirid") => {
    setActiveTab(tab);
    setSelectedCategory(null);
    setSelectedItem(null);
    setSearch("");
  };

  const handleCategoryClick = (catId: string) => {
    setSelectedCategory(catId);
    setSearch("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border border-gold/10 bg-ink shadow-2xl sm:max-w-xl">
        <div className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cg fill='none' stroke='%23a07820' stroke-width='0.5'%3E%3Cpath d='M30 0v60M0 30h60'/%3E%3Ccircle cx='30' cy='30' r='10' opacity='0.4'/%3E%3C/g%3E%3C/svg%3E\")" }} />
        {/* ── Header (sticky) ── */}
        <div className="relative shrink-0 overflow-hidden border-b border-gold/15 bg-gradient-to-r from-gold/15 via-gold/8 to-gold/15 px-5 pt-4 pb-3">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d3ad57' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

          {/* Title row */}
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15">
                <svg className="h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-parchment-3">Bacaan</p>
                <h2 className="font-display text-lg font-bold leading-tight text-parchment">
                  {activeTab === "doa" ? "Doa Harian" : "Wirid Harian"}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/10 text-parchment-3 transition hover:bg-gold/20 hover:text-parchment"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Tabs - compact, no icon */}
          <div className="relative mt-3 flex gap-1 rounded-lg bg-ink-3 p-0.5">
            <button
              onClick={() => handleTabChange("doa")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-all ${
                activeTab === "doa"
                  ? "bg-gold/15 text-gold-2 shadow-sm"
                  : "text-parchment-3 hover:bg-gold/5 hover:text-parchment"
              }`}
            >
              Doa
              {doaCount > 0 && (
                <span className="rounded-full bg-gold/20 px-1.5 text-[10px] font-bold text-gold-2">
                  {doaCount}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabChange("wirid")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-all ${
                activeTab === "wirid"
                  ? "bg-emerald-js/20 text-emerald-js shadow-sm shadow-emerald-js/10"
                  : "text-parchment-3 hover:bg-gold/5 hover:text-parchment"
              }`}
            >
              Wirid
              {wiridCount > 0 && (
                <span className="rounded-full bg-emerald-js/20 px-1.5 text-[10px] font-bold text-emerald-js">
                  {wiridCount}
                </span>
              )}
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-2.5">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder={selectedCategory ? "Cari bacaan..." : "Cari doa atau wirid..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-ink-3 py-2 pl-9 pr-9 text-sm text-parchment placeholder-parchment-3 outline-none ring-1 ring-gold/10 transition focus:bg-ink-2 focus:ring-gold/30"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-parchment-3 transition hover:bg-gold/10 hover:text-parchment"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto scroll-smooth p-4">
          {loading ? (
            <div className="flex flex-col items-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
              <p className="mt-3 text-sm text-parchment-3">Memuat data...</p>
            </div>
          ) : selectedItem ? (
            /* ── Detail View ── */
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button
                onClick={handleBack}
                className="mb-4 flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-parchment-3 transition hover:bg-gold/5 hover:text-parchment"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Kembali
              </button>

              <div className="rounded-2xl border border-gold/10 bg-ink-2 p-6">
                {/* Title with font size toggle */}
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-lg font-bold text-parchment">{selectedItem.title}</h3>
                  <button
                    onClick={() => setFontSize(fontSize === "normal" ? "large" : "normal")}
                    className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-gold/5 px-3 py-1 text-xs text-parchment-3 transition hover:bg-gold/10 hover:text-parchment"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                    </svg>
                    {fontSize === "normal" ? "Perbesar" : "Perkecil"}
                  </button>
                </div>

                {/* Render Content */}
                {selectedItem.contentParts && Array.isArray(selectedItem.contentParts) && selectedItem.contentParts.length > 0 ? (
                  /* Structured Content */
                  <div className="mt-5 space-y-5">
                    {selectedItem.contentParts.map((part, idx) => {
                      if (part.type === "separator") {
                        return (
                          <div key={idx} className="py-2">
                            <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
                          </div>
                        );
                      }

                      return (
                        <div key={idx} className="space-y-3">
                          {part.label && (
                            <div className="flex items-center gap-2">
                              <div className="h-px flex-1 bg-gold/20" />
                              <p className="text-xs font-semibold text-gold-2">{part.label}</p>
                              <div className="h-px flex-1 bg-gold/20" />
                            </div>
                          )}

                          {part.arab && (
                            <div className="rounded-xl bg-gradient-to-b from-gold/5 to-gold/[0.02] p-5 ring-1 ring-gold/10">
                              <p
                                dir="rtl"
                                className={`text-right leading-[2.2] ${isDark ? "text-amber-100" : "text-parchment"} ${fontSize === "large" ? "text-[1.7rem]" : "text-[1.4rem]"}`}
                                style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
                              >
                                {part.arab}
                                {part.type === "repeat" && part.count && part.count > 1 && (
                                  <span className="mr-3 inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-sm text-gold-2">
                                    ×{part.count}
                                  </span>
                                )}
                              </p>
                            </div>
                          )}

                          {part.latin && (
                            <p className="px-1 text-sm leading-relaxed text-parchment-2 italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                              {part.latin}
                            </p>
                          )}

                          {part.translation && (
                            <p className="px-1 text-sm leading-relaxed text-parchment">
                              {part.translation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Simple Content */
                  <>
                    {/* Arabic */}
                    <div className="mt-5 rounded-xl bg-gradient-to-b from-gold/5 to-gold/[0.02] p-6 ring-1 ring-gold/10">
                      <p
                        dir="rtl"
                        className={`text-right leading-[2.2] ${isDark ? "text-amber-100" : "text-parchment"} ${fontSize === "large" ? "text-[1.7rem]" : "text-[1.4rem]"}`}
                        style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}
                      >
                        {selectedItem.arab}
                      </p>
                    </div>

                    {/* Latin */}
                    <div className="mt-5">
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-gold/20" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-2">Latin</p>
                        <div className="h-px flex-1 bg-gold/20" />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-parchment-2 italic" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {selectedItem.latin}
                      </p>
                    </div>

                    {/* Translation */}
                    <div className="mt-5">
                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-emerald-js/20" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-js">Terjemahan</p>
                        <div className="h-px flex-1 bg-emerald-js/20" />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-parchment">
                        {selectedItem.translation}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : selectedCategory && selectedCat ? (
            /* ── Items List View ── */
            <div>
              <button
                onClick={handleBack}
                className="mb-4 flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-parchment-3 transition hover:bg-gold/5 hover:text-parchment"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Kembali
              </button>

              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-parchment">{selectedCat.name}</h3>
                <span className="rounded-full bg-gold/10 px-3 py-1 text-xs text-parchment-3">
                  {filteredItems?.length} bacaan
                </span>
              </div>

              <div className="space-y-2">
                {filteredItems && filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="flex w-full items-center gap-4 rounded-2xl bg-ink-2 p-4 text-left transition hover:bg-ink-3 active:scale-[0.98]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-sm font-bold text-gold-2">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-parchment">{item.title}</p>
                        <p dir="rtl" className="mt-1 truncate text-right text-sm text-parchment-3" style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}>
                          {item.arab.slice(0, 60)}...
                        </p>
                      </div>
                      <svg className="h-4 w-4 shrink-0 text-parchment-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10">
                      <svg className="h-6 w-6 text-parchment-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                    </div>
                    <p className="mt-3 text-sm text-parchment-3">Tidak ditemukan</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── Categories List View ── */
            <div className="space-y-2">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat, index) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className="flex w-full items-center gap-4 rounded-2xl bg-ink-2 p-4 text-left transition hover:bg-ink-3 active:scale-[0.98]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                      <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-parchment">{cat.name}</p>
                      <p className="text-xs text-parchment-3">{cat.items.length} bacaan</p>
                    </div>
                    <span className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold-2">
                      {cat.items.length}
                    </span>
                    <svg className="h-4 w-4 shrink-0 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                ))
              ) : (
                <div className="flex flex-col items-center py-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10">
                    <svg className="h-7 w-7 text-parchment-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                  </div>
                  <p className="mt-4 text-sm text-parchment-3">
                    {search ? `Tidak ditemukan untuk "${search}"` : "Tidak ada data"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex shrink-0 gap-2 border-t border-gold/10 bg-ink-2/50 px-4 py-3">
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
