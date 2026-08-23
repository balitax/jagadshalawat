import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/db";
import { donations, Donation } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();
    if (!session.isLoggedIn) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rows = await db
      .select()
      .from(donations)
      .orderBy(donations.createdAt);
    return NextResponse.json({ donations: rows });
  } catch {
    return NextResponse.json({ donations: [] }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const id = body.id as string | undefined;
  if (!id) {
    return NextResponse.json({ error: "ID tidak ditemukan." }, { status: 400 });
  }

  const patch: Partial<Donation> = {};
  if (typeof body.status === "string") patch.status = body.status;
  if (typeof body.name === "string") patch.name = body.name;
  if (typeof body.isAnonymous === "boolean") patch.isAnonymous = body.isAnonymous;
  if (typeof body.amount === "number") patch.amount = body.amount;
  if (typeof body.method === "string") {
    patch.method = body.method as Donation["method"];
  }
  if (typeof body.channel === "string") patch.channel = body.channel;
  if (typeof body.message === "string") patch.message = body.message;

  await db.update(donations).set(patch).where(eq(donations.id, id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const id = body.id as string | undefined;
  if (!id) {
    return NextResponse.json({ error: "ID tidak ditemukan." }, { status: 400 });
  }

  await db.delete(donations).where(eq(donations.id, id));
  return NextResponse.json({ ok: true });
}
