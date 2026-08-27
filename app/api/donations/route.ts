import { saveReceipt } from "@/lib/upload";
import { getChannel } from "@/lib/payment-server";
import { db } from "@/db";
import { donations, campaigns } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const amountRaw = formData.get("amount");
    const methodRaw = formData.get("method");
    const channelRaw = formData.get("channel");
    const nameRaw = formData.get("name");
    const message = formData.get("message");
    const anonymousRaw = formData.get("anonymous");
    const receipt = formData.get("receipt");
    const campaignIdRaw = formData.get("campaignId");

    if (!amountRaw || !methodRaw || !channelRaw) {
      return NextResponse.json(
        { error: "Data donasi belum lengkap." },
        { status: 400 }
      );
    }

    const amount = Number(amountRaw);
    const method = methodRaw as "bank_transfer" | "emoney" | "va";
    const channelId = String(channelRaw);
    const channel = await getChannel(channelId);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Nominal donasi tidak valid." },
        { status: 400 }
      );
    }
    if (!["bank_transfer", "emoney", "va"].includes(method)) {
      return NextResponse.json(
        { error: "Metode tidak valid." },
        { status: 400 }
      );
    }
    if (!channel) {
      return NextResponse.json(
        { error: "Metode pembayaran tidak ditemukan." },
        { status: 400 }
      );
    }

    const isAnonymous =
      String(anonymousRaw ?? "") === "true" || nameRaw === "";
    const name = isAnonymous
      ? "Hamba Allah"
      : String(nameRaw ?? "").trim().slice(0, 80);

    let receiptUrl: string | null = null;
    if (receipt && receipt instanceof File && receipt.size > 0) {
      receiptUrl = await saveReceipt(receipt);
    }

    let campaignId: string | null = null;
    if (campaignIdRaw && String(campaignIdRaw)) {
      const [campaign] = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, String(campaignIdRaw)))
        .limit(1);
      if (campaign && campaign.isActive) campaignId = campaign.id;
    }

    const [donation] = await db
      .insert(donations)
      .values({
        name,
        isAnonymous,
        amount,
        method,
        channel: channel.bankPrefix ?? channel.id,
        campaignId,
        message: String(message ?? "").trim().slice(0, 300) || null,
        receiptUrl,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ ok: true, id: donation.id }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kesalahan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(donations)
      .where(eq(donations.status, "verified"))
      .orderBy(donations.createdAt);
    return NextResponse.json({ donations: rows });
  } catch {
    return NextResponse.json({ donations: [] });
  }
}
