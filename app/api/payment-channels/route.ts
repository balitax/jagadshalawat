import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentChannels } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  const channels = await db
    .select()
    .from(paymentChannels)
    .where(eq(paymentChannels.isActive, true))
    .orderBy(asc(paymentChannels.sortOrder));

  return NextResponse.json({ channels });
}
