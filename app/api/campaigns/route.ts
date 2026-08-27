import { NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns, donations } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.isActive, true))
    .orderBy(asc(campaigns.sortOrder));

  const totals = await db
    .select({
      campaignId: donations.campaignId,
      raised: sql<number>`coalesce(sum(${donations.amount}), 0)`,
      donorCount: sql<number>`count(*)`,
    })
    .from(donations)
    .where(eq(donations.status, "verified"))
    .groupBy(donations.campaignId);

  const totalsMap = new Map(
    totals.map((t) => [t.campaignId, { raised: Number(t.raised), donorCount: Number(t.donorCount) }])
  );

  const result = rows.map((c) => ({
    ...c,
    raisedAmount: totalsMap.get(c.id)?.raised || 0,
    donorCount: totalsMap.get(c.id)?.donorCount || 0,
  }));

  return NextResponse.json({ campaigns: result });
}
