import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { gallery } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "true";

  const query = db
    .select()
    .from(gallery)
    .where(eq(gallery.isVisible, true))
    .orderBy(asc(gallery.sortOrder));

  const visible = all ? await query : await query.limit(12);

  return NextResponse.json({ photos: visible });
}
