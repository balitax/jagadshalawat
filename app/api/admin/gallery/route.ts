import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { gallery } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await db.select().from(gallery).orderBy(gallery.sortOrder);
  return NextResponse.json({ photos: all });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { photoUrl, caption, eventDate, category, sortOrder, isVisible } = body;

  if (!photoUrl) {
    return NextResponse.json({ error: "photoUrl wajib diisi" }, { status: 400 });
  }

  const [created] = await db
    .insert(gallery)
    .values({ photoUrl, caption, eventDate, category, sortOrder, isVisible })
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

  await db.update(gallery).set(fields).where(eq(gallery.id, id));
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

  await db.delete(gallery).where(eq(gallery.id, id));
  return NextResponse.json({ ok: true });
}
