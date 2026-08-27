import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { hijriEvents } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await db
    .select()
    .from(hijriEvents)
    .orderBy(hijriEvents.hijriMonth, hijriEvents.hijriDay);
  return NextResponse.json({ events: all });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { hijriDay, hijriMonth, title, sortOrder } = body;

  if (!hijriDay || !hijriMonth || !title) {
    return NextResponse.json(
      { error: "hijriDay, hijriMonth, dan title wajib diisi" },
      { status: 400 }
    );
  }

  const [created] = await db
    .insert(hijriEvents)
    .values({ hijriDay, hijriMonth, title, sortOrder })
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

  await db.update(hijriEvents).set(fields).where(eq(hijriEvents.id, id));
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

  await db.delete(hijriEvents).where(eq(hijriEvents.id, id));
  return NextResponse.json({ ok: true });
}
