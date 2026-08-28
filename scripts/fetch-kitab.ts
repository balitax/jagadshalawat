import { getKitabCategories, getKitabList, getKitabBabList, getBabDetail } from "../lib/kitab";
import type { FullKitab, KitabMigration, RawBab } from "../lib/kitab";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

process.loadEnvFile?.(".env");

const apiKey = process.env.AHMAD_SANUSI_API_KEY;
if (!apiKey) throw new Error("AHMAD_SANUSI_API_KEY belum di-set di .env");
const KEY: string = apiKey;

const OUT = resolve(import.meta.dirname, "../kitab-data.json");
const CONCURRENCY = 3;
const DELAY_MS = 250;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function mapLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return out;
}

async function main() {
  const existing: KitabMigration | null = existsSync(OUT)
    ? JSON.parse(readFileSync(OUT, "utf-8"))
    : null;
  const existingBySlug = new Map((existing?.kitab ?? []).map((k) => [k.slug, k]));

  console.log("Mengambil daftar kategori…");
  const categories = existing?.categories?.length
    ? existing.categories
    : await getKitabCategories(KEY);

  console.log("Mengambil daftar kitab…");
  const list = await getKitabList(KEY);

  const kitab: FullKitab[] = [];

  for (const k of list) {
    const cached = existingBySlug.get(k.slug);
    if (cached && cached.bab.length === k.total_bab) {
      console.log(`↺ skip (cache) ${k.nama} — ${cached.bab.length} bab`);
      kitab.push(cached);
      continue;
    }

    console.log(`↓ ${k.nama} (${k.total_bab} bab)…`);
    const { bab: babList } = await getKitabBabList(KEY, k.slug, 1, 200);
    const bab: RawBab[] = await mapLimit(babList, CONCURRENCY, async (b) => {
      await sleep(DELAY_MS);
      return getBabDetail(KEY, k.slug, b.nomor);
    });
    kitab.push({ ...k, bab });
    console.log(`  ✓ ${k.nama}: ${bab.length} bab`);

    // simpan progres tiap kitab selesai (aman kalau kena rate-limit)
    const snapshot: KitabMigration = {
      generatedAt: new Date().toISOString(),
      source: "https://api.ahmadsanusi.com",
      categories,
      kitab,
    };
    writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
  }

  const total = kitab.reduce((n, k) => n + k.bab.length, 0);
  console.log(`\nSelesai. ${kitab.length} kitab, ${total} bab → ${OUT}`);
}

main().catch((e) => {
  console.error("Fetch gagal:", e.message);
  process.exit(1);
});
