import { NextResponse } from "next/server";
import { db } from "@/db";
import { kitabCategories, kitab } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const categories = await db
    .select({
      id: kitabCategories.id,
      name: kitabCategories.name,
      slug: kitabCategories.slug,
    })
    .from(kitabCategories)
    .orderBy(asc(kitabCategories.sortOrder));

  const kitabRows = await db
    .select({
      id: kitab.id,
      slug: kitab.slug,
      nama: kitab.nama,
      namaArab: kitab.namaArab,
      pengarang: kitab.pengarang,
      kategori: kitab.kategori,
      mazhab: kitab.mazhab,
      deskripsi: kitab.deskripsi,
      totalBab: kitab.totalBab,
      sortOrder: kitab.sortOrder,
    })
    .from(kitab)
    .orderBy(asc(kitab.sortOrder));

  return NextResponse.json({ categories, kitab: kitabRows });
}
