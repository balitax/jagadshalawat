import { NextResponse } from "next/server";
import { db } from "@/db";
import { kitab, kitabBab } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const [k] = await db.select().from(kitab).where(eq(kitab.slug, slug)).limit(1);
  if (!k) {
    return NextResponse.json({ error: "Kitab tidak ditemukan" }, { status: 404 });
  }

  const bab = await db
    .select({
      id: kitabBab.id,
      nomor: kitabBab.nomor,
      judul: kitabBab.judul,
      judulArab: kitabBab.judulArab,
      bagian: kitabBab.bagian,
      keterangan: kitabBab.keterangan,
      teksArab: kitabBab.teksArab,
      teksIndonesia: kitabBab.teksIndonesia,
      urutan: kitabBab.urutan,
    })
    .from(kitabBab)
    .where(eq(kitabBab.kitabId, k.id))
    .orderBy(asc(kitabBab.nomor));

  return NextResponse.json({ kitab: k, bab });
}
