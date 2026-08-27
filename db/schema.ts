import {
  pgTable,
  uuid,
  text,
  boolean,
  bigint,
  integer,
  date,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

/* ─── Content Parts (for Doa/Wirid structured content) ─── */
export interface ContentPart {
  type: "text" | "verse" | "repeat" | "separator";
  label?: string;       // e.g. "Ayat 1", "Ayat Kursi"
  count?: number;       // for repeat: how many times
  arab?: string;
  latin?: string;
  translation?: string;
}

/* ─── Campaigns (Campaign Donasi) ─── */
export const campaigns = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  coverUrl: text("cover_url"),
  targetAmount: bigint("target_amount", { mode: "number" }).notNull(),
  deadline: date("deadline"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;

/* ─── Donations ─── */
export const donations = pgTable("donations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  amount: bigint("amount", { mode: "number" }).notNull(),
  method: text("method", {
    enum: ["bank_transfer", "emoney", "va"],
  }).notNull(),
  channel: text("channel").notNull(),
  campaignId: uuid("campaign_id").references(() => campaigns.id),
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

/* ─── Schedules (Jadwal Kegiatan) ─── */
export const schedules = pgTable("schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  time: text("time"),
  location: text("location"),
  type: text("type", {
    enum: ["sholawat", "dzikir", "event", "meeting"],
  }).notNull(),
  status: text("status", {
    enum: ["upcoming", "completed", "cancelled"],
  })
    .notNull()
    .default("upcoming"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Schedule = typeof schedules.$inferSelect;
export type NewSchedule = typeof schedules.$inferInsert;

/* ─── Articles (Artikel & Pengumuman) ─── */
export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverUrl: text("cover_url"),
  category: text("category", {
    enum: ["artikel", "pengumuman"],
  })
    .notNull()
    .default("artikel"),
  isPublished: boolean("is_published").notNull().default(false),
  author: text("author"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
});

export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;

/* ─── Gallery (Galeri Foto) ─── */
export const gallery = pgTable("gallery", {
  id: uuid("id").defaultRandom().primaryKey(),
  photoUrl: text("photo_url").notNull(),
  caption: text("caption"),
  eventDate: date("event_date"),
  category: text("category"),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type GalleryPhoto = typeof gallery.$inferSelect;
export type NewGalleryPhoto = typeof gallery.$inferInsert;

/* ─── Doa (Bacaan Doa) ─── */
export const doaCategories = pgTable("doa_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const doaItems = pgTable("doa_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => doaCategories.id),
  title: text("title").notNull(),
  arab: text("arab").notNull(),
  latin: text("latin").notNull(),
  translation: text("translation").notNull(),
  contentParts: jsonb("content_parts"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type DoaCategory = typeof doaCategories.$inferSelect;
export type DoaItem = typeof doaItems.$inferSelect;

/* ─── Wirid (Bacaan Wirid) ─── */
export const wiridCategories = pgTable("wirid_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const wiridItems = pgTable("wirid_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => wiridCategories.id),
  title: text("title").notNull(),
  arab: text("arab").notNull(),
  latin: text("latin").notNull(),
  translation: text("translation").notNull(),
  contentParts: jsonb("content_parts"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type WiridCategory = typeof wiridCategories.$inferSelect;
export type WiridItem = typeof wiridItems.$inferSelect;

/* ─── Payment Channels (Kanal Donasi: bank, e-money, VA) ─── */
export const paymentChannels = pgTable("payment_channels", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  type: text("type", {
    enum: ["bank_transfer", "emoney", "va"],
  }).notNull(),
  label: text("label").notNull(),
  name: text("name").notNull(),
  reference: text("reference").notNull(),
  holder: text("holder"),
  note: text("note"),
  bankPrefix: text("bank_prefix"),
  accent: text("accent").notNull().default("from-gold-2/20 to-gold-2/5"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type PaymentChannelRow = typeof paymentChannels.$inferSelect;
export type NewPaymentChannelRow = typeof paymentChannels.$inferInsert;

/* ─── Hijri Events (Tanggal Penting Kalender Hijriah) ─── */
export const hijriEvents = pgTable("hijri_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  hijriDay: integer("hijri_day").notNull(),
  hijriMonth: integer("hijri_month").notNull(),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type HijriEvent = typeof hijriEvents.$inferSelect;
export type NewHijriEvent = typeof hijriEvents.$inferInsert;
