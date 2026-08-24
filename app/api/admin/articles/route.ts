import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const all = await db.select().from(articles).orderBy(articles.createdAt);
  return NextResponse.json({ articles: all });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, slug, content, excerpt, coverUrl, category, author, isPublished } = body;

  if (!title || !slug || !content) {
    return NextResponse.json({ error: "title, slug, content wajib diisi" }, { status: 400 });
  }

  const [created] = await db
    .insert(articles)
    .values({ title, slug, content, excerpt, coverUrl, category, author, isPublished })
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

  fields.updatedAt = new Date();
  await db.update(articles).set(fields).where(eq(articles.id, id));
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

  await db.delete(articles).where(eq(articles.id, id));
  return NextResponse.json({ ok: true });
}
