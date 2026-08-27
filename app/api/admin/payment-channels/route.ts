import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { paymentChannels } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await db
    .select()
    .from(paymentChannels)
    .orderBy(paymentChannels.sortOrder);
  return NextResponse.json({ channels: all });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    slug,
    type,
    label,
    name,
    reference,
    holder,
    note,
    bankPrefix,
    accent,
    sortOrder,
    isActive,
  } = body;

  if (!slug || !type || !label || !name || !reference) {
    return NextResponse.json(
      { error: "slug, type, label, name, dan reference wajib diisi" },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(paymentChannels)
    .values({
      slug,
      type,
      label,
      name,
      reference,
      holder,
      note,
      bankPrefix,
      accent,
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

  await db.update(paymentChannels).set(fields).where(eq(paymentChannels.id, id));
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

  await db.delete(paymentChannels).where(eq(paymentChannels.id, id));
  return NextResponse.json({ ok: true });
}
