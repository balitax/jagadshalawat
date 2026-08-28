import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { kitabCategories, kitab, kitabBab } from "./schema.js";
import { readFileSync } from "fs";
import { resolve } from "path";

process.loadEnvFile?.(".env");

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const client = postgres(url, { max: 10, prepare: false });
const db = drizzle(client, { schema });

const DATA = resolve(import.meta.dirname, "../kitab-data.json");

async function seed() {
  const migration = JSON.parse(readFileSync(DATA, "utf-8")) as {
    categories: string[];
    kitab: Array<{
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
      bab: Array<{
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
      }>;
    }>;
  };

  console.log("Menghapus data kitab lama…");
  await db.delete(kitabBab);
  await db.delete(kitab);
  await db.delete(kitabCategories);

  console.log("Seeding kategori kitab…");
  const categoryIds = new Map<string, string>();
  for (let i = 0; i < migration.categories.length; i++) {
    const name = migration.categories[i];
    const [row] = await db
      .insert(kitabCategories)
      .values({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), sortOrder: i + 1 })
      .returning();
    categoryIds.set(name, row.id);
  }

  console.log("Seeding kitab & bab…");
  for (let i = 0; i < migration.kitab.length; i++) {
    const k = migration.kitab[i];
    const categoryId = categoryIds.get(k.kategori) ?? null;
    const [inserted] = await db
      .insert(kitab)
      .values({
        slug: k.slug,
        nama: k.nama,
        namaArab: k.nama_arab,
        pengarang: k.pengarang,
        pengarangArab: k.pengarang_arab,
        tahunLahir: k.tahun_lahir,
        tahunWafat: k.tahun_wafat,
        mazhab: k.mazhab,
        kategori: k.kategori,
        categoryId,
        bahasa: k.bahasa,
        fitur: k.fitur,
        deskripsi: k.deskripsi,
        catatan: k.catatan,
        totalBab: k.total_bab,
        sortOrder: i + 1,
      })
      .returning();

    for (let j = 0; j < k.bab.length; j++) {
      const b = k.bab[j];
      await db.insert(kitabBab).values({
        kitabId: inserted.id,
        nomor: b.nomor,
        judul: b.judul,
        judulArab: b.judul_arab,
        bagian: b.bagian,
        keterangan: b.keterangan,
        file: b.file,
        sectionId: b.section_id,
        teksArab: b.teks_arab,
        teksIndonesia: b.teks_indonesia,
        urutan: b.urutan,
        sortOrder: j + 1,
      });
    }
    console.log(`  ✓ ${k.nama} (${k.bab.length} bab)`);
  }

  console.log("Done!");
  await client.end();
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
