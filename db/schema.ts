import {
  pgTable,
  uuid,
  text,
  boolean,
  bigint,
  timestamp,
} from "drizzle-orm/pg-core";

export const donations = pgTable("donations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  amount: bigint("amount", { mode: "number" }).notNull(),
  method: text("method", {
    enum: ["bank_transfer", "emoney", "va"],
  }).notNull(),
  channel: text("channel").notNull(),
  message: text("message"),
  receiptUrl: text("receipt_url"),
  status: text("status", {
    enum: ["pending", "verified"],
  })
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;
