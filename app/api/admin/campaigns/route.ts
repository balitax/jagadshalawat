import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { campaigns, donations } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, asc, sql } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db.select().from(campaigns).orderBy(asc(campaigns.sortOrder));

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

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, description, coverUrl, targetAmount, deadline, sortOrder, isActive } = body;

  if (!title || !slug || !targetAmount) {
    return NextResponse.json(
      { error: "title, slug, dan targetAmount wajib diisi" },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(campaigns)
    .values({
      title,
      slug,
      description,
      coverUrl,
      targetAmount,
      deadline: deadline || null,
      sortOrder,
      isActive,
    })
    .returning();

  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...fields } = body;

  if (!id) {
    return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
  }

  await db.update(campaigns).set(fields).where(eq(campaigns.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });
  }

  await db.update(donations).set({ campaignId: null }).where(eq(donations.campaignId, id));
  await db.delete(campaigns).where(eq(campaigns.id, id));
  return NextResponse.json({ ok: true });
}
