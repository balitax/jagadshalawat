import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { wiridCategories, wiridItems } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await db
      .select()
      .from(wiridCategories)
      .orderBy(asc(wiridCategories.sortOrder));

    const items = await db
      .select()
      .from(wiridItems)
      .orderBy(asc(wiridItems.sortOrder));

    const result = categories.map((cat) => ({
      ...cat,
      items: items.filter((item) => item.categoryId === cat.id),
    }));

    return NextResponse.json({ categories: result });
  } catch {
    return NextResponse.json({ categories: [] }, { status: 401 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type } = body;

  if (type === "category") {
    const { name, slug, sortOrder } = body;
    if (!name || !slug) {
      return NextResponse.json({ error: "Nama dan slug wajib diisi." }, { status: 400 });
    }

    const [inserted] = await db
      .insert(wiridCategories)
      .values({
        name,
        slug,
        sortOrder: sortOrder || 0,
      })
      .returning();

    return NextResponse.json({ ok: true, category: inserted });
  }

  if (type === "item") {
    const { categoryId, title, arab, latin, translation, contentParts, sortOrder } = body;
    if (!categoryId || !title) {
      return NextResponse.json({ error: "Kategori dan judul wajib diisi." }, { status: 400 });
    }

    const [inserted] = await db
      .insert(wiridItems)
      .values({
        categoryId,
        title,
        arab: arab || "",
        latin: latin || "",
        translation: translation || "",
        contentParts: contentParts || null,
        sortOrder: sortOrder || 0,
      })
      .returning();

    return NextResponse.json({ ok: true, item: inserted });
  }

  return NextResponse.json({ error: "Type tidak valid." }, { status: 400 });
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, id, ...data } = body;

  if (!id) {
    return NextResponse.json({ error: "ID wajib diisi." }, { status: 400 });
  }

  if (type === "category") {
    const patch: Record<string, unknown> = {};
    if (typeof data.name === "string") patch.name = data.name;
    if (typeof data.slug === "string") patch.slug = data.slug;
    if (typeof data.sortOrder === "number") patch.sortOrder = data.sortOrder;

    await db.update(wiridCategories).set(patch).where(eq(wiridCategories.id, id));
    return NextResponse.json({ ok: true });
  }

  if (type === "item") {
    const patch: Record<string, unknown> = {};
    if (typeof data.title === "string") patch.title = data.title;
    if (typeof data.arab === "string") patch.arab = data.arab;
    if (typeof data.latin === "string") patch.latin = data.latin;
    if (typeof data.translation === "string") patch.translation = data.translation;
    if (data.contentParts !== undefined) patch.contentParts = data.contentParts;
    if (typeof data.sortOrder === "number") patch.sortOrder = data.sortOrder;
    if (typeof data.categoryId === "string") patch.categoryId = data.categoryId;

    await db.update(wiridItems).set(patch).where(eq(wiridItems.id, id));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Type tidak valid." }, { status: 400 });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, id } = body;

  if (!id) {
    return NextResponse.json({ error: "ID wajib diisi." }, { status: 400 });
  }

  if (type === "category") {
    await db.delete(wiridItems).where(eq(wiridItems.categoryId, id));
    await db.delete(wiridCategories).where(eq(wiridCategories.id, id));
    return NextResponse.json({ ok: true });
  }

  if (type === "item") {
    await db.delete(wiridItems).where(eq(wiridItems.id, id));
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Type tidak valid." }, { status: 400 });
}
