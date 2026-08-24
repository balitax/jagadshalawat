import { NextResponse } from "next/server";
import { db } from "@/db";
import { doaCategories, doaItems } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const categories = await db
    .select()
    .from(doaCategories)
    .orderBy(asc(doaCategories.sortOrder));

  const items = await db
    .select()
    .from(doaItems)
    .orderBy(asc(doaItems.sortOrder));

  const result = categories.map((cat) => ({
    ...cat,
    items: items.filter((item) => item.categoryId === cat.id),
  }));

  return NextResponse.json({ categories: result });
}
