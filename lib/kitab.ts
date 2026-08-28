const BASE_URL = "https://api.ahmadsanusi.com";

export interface RawKitab {
  id: number;
  slug: string;
  nama: string;
  nama_arab: string | null;
  pengarang: string | null;
  pengarang_arab: string | null;
  tahun_lahir: string | null;
  tahun_wafat: string | null;
  mazhab: string | null;
  kategori: string;
  bahasa: string | null;
  fitur: string | null;
  deskripsi: string | null;
  catatan: string | null;
  total_bab: number;
}

export interface RawBab {
  nomor: number;
  judul: string | null;
  judul_arab: string | null;
  bagian: string | null;
  keterangan: string | null;
  file: string | null;
  section_id: string | null;
  teks_arab: string | null;
  teks_indonesia: string | null;
  urutan: number;
}

export interface FullKitab extends RawKitab {
  bab: RawBab[];
}

export interface KitabMigration {
  generatedAt: string;
  source: string;
  categories: string[];
  kitab: FullKitab[];
}

function headers(apiKey: string): Record<string, string> {
  return { "X-API-Key": apiKey, Accept: "application/json" };
}

async function apiGet<T = unknown>(
  path: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, { headers: headers(apiKey), signal });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GET ${path} -> ${res.status} ${res.statusText} ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as { status: string; data: T };
  return json.data;
}

export async function getKitabCategories(apiKey: string): Promise<string[]> {
  const data = await apiGet<{ total: number; kategori: string[] }>(
    "/v1/kitab/kategori",
    apiKey,
  );
  return data.kategori;
}

export async function getKitabList(apiKey: string): Promise<RawKitab[]> {
  const data = await apiGet<{ total: number; kitab: RawKitab[] }>("/v1/kitab", apiKey);
  return data.kitab;
}

export async function getKitabBabList(
  apiKey: string,
  slug: string,
  page = 1,
  limit = 200,
): Promise<{ total: number; bab: Array<Omit<RawBab, "teks_arab" | "teks_indonesia">> }> {
  return apiGet(
    `/v1/kitab/${encodeURIComponent(slug)}?page=${page}&limit=${limit}`,
    apiKey,
  );
}

export async function getBabDetail(
  apiKey: string,
  slug: string,
  nomor: number,
): Promise<RawBab> {
  return apiGet(`/v1/kitab/${encodeURIComponent(slug)}/bab/${nomor}`, apiKey);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  const workers = new Array(Math.min(limit, items.length)).fill(0).map(async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

/**
 * Mengambil seluruh data Kitab Kuning dari API dan mengelompokkannya menjadi
 * satu struktur migrasi: kategori + tiap kitab beserta seluruh bab lengkap
 * (teks arab & terjemahan Indonesia).
 */
export async function fetchAllKitab(
  apiKey: string,
  options: { concurrency?: number; onProgress?: (msg: string) => void } = {},
): Promise<KitabMigration> {
  const concurrency = options.concurrency ?? 3;
  const log = options.onProgress ?? (() => {});

  log("Mengambil daftar kategori…");
  const categories = await getKitabCategories(apiKey);

  log("Mengambil daftar kitab…");
  const kitabList = await getKitabList(apiKey);
  log(`  ✓ ${kitabList.length} kitab ditemukan`);

  const kitab = await mapWithConcurrency(kitabList, concurrency, async (k) => {
    log(`Mengambil bab "${k.nama}" (${k.total_bab} bab)…`);
    const list = await getKitabBabList(apiKey, k.slug, 1, 200);
    const bab = await mapWithConcurrency(list.bab, concurrency, async (b) => {
      const detail = await getBabDetail(apiKey, k.slug, b.nomor);
      return detail;
    });
    log(`  ✓ ${k.nama}: ${bab.length} bab`);
    return { ...k, bab };
  });

  return {
    generatedAt: new Date().toISOString(),
    source: BASE_URL,
    categories,
    kitab,
  };
}
