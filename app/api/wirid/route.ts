import { NextResponse } from "next/server";
import { db } from "@/db";
import { wiridCategories, wiridItems } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const categories = await db
    .select()
    .from(wiridCategories)
    .orderBy(asc(wiridCategories.sortOrder));

  const items = await db
    .select()
    .from(wiridItems)
    .orderBy(asc(wiridItems.sortOrder));

  const result = categories.map((cat) => ({
    ...cat,
    items: items.filter((item) => item.categoryId === cat.id),
  }));

  return NextResponse.json({ categories: result });
}
