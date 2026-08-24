import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { schedules } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await db.select().from(schedules).orderBy(schedules.date);
  return NextResponse.json({ schedules: all });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, date, time, location, type, status } = body;

  if (!title || !date || !type) {
    return NextResponse.json({ error: "title, date, type wajib diisi" }, { status: 400 });
  }

  const [created] = await db
    .insert(schedules)
    .values({ title, description, date, time, location, type, status })
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

  await db.update(schedules).set(fields).where(eq(schedules.id, id));
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

  await db.delete(schedules).where(eq(schedules.id, id));
  return NextResponse.json({ ok: true });
}
