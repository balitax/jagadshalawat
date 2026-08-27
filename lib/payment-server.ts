import { db } from "@/db";
import { paymentChannels } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { MethodType, PaymentChannel } from "./payment";

/** Server-side lookup of an active payment channel by its slug/id. */
export async function getChannel(slug: string): Promise<PaymentChannel | undefined> {
  const [row] = await db
    .select()
    .from(paymentChannels)
    .where(eq(paymentChannels.slug, slug))
    .limit(1);

  if (!row || !row.isActive) return undefined;

  return {
    id: row.slug,
    type: row.type as MethodType,
    label: row.label,
    name: row.name,
    reference: row.reference,
    holder: row.holder,
    note: row.note,
    bankPrefix: row.bankPrefix,
    accent: row.accent,
  };
}
