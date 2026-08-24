import {
  pgTable,
  uuid,
  text,
  boolean,
  bigint,
  integer,
  date,
  timestamp,
} from "drizzle-orm/pg-core";

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
