import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedules } from "@/db/schema";
import { gte, asc, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "true";

  if (all) {
    const everything = await db
      .select()
      .from(schedules)
      .orderBy(desc(schedules.date));

    return NextResponse.json({ schedules: everything });
  }

  const today = new Date().toISOString().split("T")[0];

  const upcoming = await db
    .select()
    .from(schedules)
    .where(gte(schedules.date, today))
    .orderBy(asc(schedules.date))
    .limit(6);

  return NextResponse.json({ schedules: upcoming });
}
