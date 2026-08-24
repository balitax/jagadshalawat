import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "true";

  const query = db
    .select()
    .from(articles)
    .where(eq(articles.isPublished, true))
    .orderBy(desc(articles.createdAt));

  const published = all ? await query : await query.limit(6);

  return NextResponse.json({ articles: published });
}
