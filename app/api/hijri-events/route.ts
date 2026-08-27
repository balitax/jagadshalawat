import { NextResponse } from "next/server";
import { db } from "@/db";
import { hijriEvents } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const events = await db
    .select()
    .from(hijriEvents)
    .orderBy(asc(hijriEvents.hijriMonth), asc(hijriEvents.hijriDay));

  return NextResponse.json({ events });
}
