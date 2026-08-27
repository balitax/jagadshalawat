import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { paymentChannels, hijriEvents } from "./schema.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const client = postgres(url, { max: 10, prepare: false });
const db = drizzle(client, { schema });

const CHANNEL_SEED = [
  {
    slug: "bsi",
    type: "bank_transfer" as const,
    label: "Bank Transfer",
    name: "Bank Syariah Indonesia",
    reference: "1117230606",
    holder: "Achmad Jafar Al Kadafi",
    note: null,
    bankPrefix: "BSI",
    accent: "from-emerald-500/20 to-emerald-500/5",
    sortOrder: 1,
  },
  {
    slug: "ovo-dana",
    type: "emoney" as const,
    label: "E-money",
    name: "OVO / DANA",
    reference: "085755322554",
    holder: "Achmad Jafar Al Kadafi",
    note: null,
    bankPrefix: "E-Wallet",
    accent: "from-amber-500/20 to-amber-500/5",
    sortOrder: 1,
  },
  {
    slug: "bca",
    type: "va" as const,
    label: "Virtual Account",
    name: "Bank Central Asia",
    reference: "3901085755322554",
    holder: null,
    note: null,
    bankPrefix: "BCA",
    accent: "from-blue-500/20 to-blue-500/5",
    sortOrder: 1,
  },
  {
    slug: "bri",
    type: "va" as const,
    label: "Virtual Account",
    name: "Bank Rakyat Indonesia",
    reference: "88810085755322554",
    holder: null,
    note: "Hanya aktif pukul 00.30–21.30 WIB.",
    bankPrefix: "BRI",
    accent: "from-sky-500/20 to-sky-500/5",
    sortOrder: 2,
  },
  {
    slug: "mandiri",
    type: "va" as const,
    label: "Virtual Account",
    name: "Bank Mandiri",
    reference: "89508085755322554",
    holder: null,
    note: null,
    bankPrefix: "Mandiri",
    accent: "from-yellow-500/20 to-yellow-500/5",
    sortOrder: 3,
  },
  {
    slug: "btn",
    type: "va" as const,
    label: "Virtual Account",
    name: "Bank Tabungan Negara",
    reference: "8528085755322554",
    holder: null,
    note: null,
    bankPrefix: "BTN",
    accent: "from-orange-500/20 to-orange-500/5",
    sortOrder: 4,
  },
];

const HIJRI_EVENT_SEED = [
  { hijriDay: 1, hijriMonth: 1, title: "Tahun Baru Hijriah" },
  // Tanggal aslinya salah di kode lama ("3-12" & "9-1"); dikoreksi ke tanggal
  // yang benar: Maulid Nabi = 12 Rabi'ul Awal, Isra Mi'raj = 27 Rajab.
  { hijriDay: 12, hijriMonth: 3, title: "Maulid Nabi" },
  { hijriDay: 27, hijriMonth: 7, title: "Isra Mi'raj" },
  { hijriDay: 10, hijriMonth: 1, title: "Asyura" },
  { hijriDay: 15, hijriMonth: 8, title: "Nisfu Sya'ban" },
  { hijriDay: 1, hijriMonth: 9, title: "Awal Ramadhan" },
  { hijriDay: 27, hijriMonth: 9, title: "Lailatul Qadr" },
  { hijriDay: 1, hijriMonth: 10, title: "Idul Fitri" },
  { hijriDay: 9, hijriMonth: 12, title: "Arafah" },
  { hijriDay: 10, hijriMonth: 12, title: "Idul Adha" },
];

async function seed() {
  console.log("Seeding payment channels...");
  for (let i = 0; i < CHANNEL_SEED.length; i++) {
    await db.insert(paymentChannels).values(CHANNEL_SEED[i]);
  }
  console.log(`Inserted ${CHANNEL_SEED.length} payment channels.`);

  console.log("Seeding hijri events...");
  for (let i = 0; i < HIJRI_EVENT_SEED.length; i++) {
    await db.insert(hijriEvents).values({ ...HIJRI_EVENT_SEED[i], sortOrder: i + 1 });
  }
  console.log(`Inserted ${HIJRI_EVENT_SEED.length} hijri events.`);

  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
