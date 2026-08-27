import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import { doaCategories, doaItems } from "./schema.js";
import { wiridCategories, wiridItems } from "./schema.js";
import { readFileSync } from "fs";
import { resolve } from "path";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const client = postgres(url, { max: 10, prepare: false });
const db = drizzle(client, { schema });

interface DoaItemData {
  title: string;
  arab: string;
  latin: string;
  translation: string;
}

interface DoaCategoryData {
  category: string;
  category_slug: string;
  items: DoaItemData[];
}

interface WiridItemData {
  title: string;
  arab: string;
  latin: string;
  translation: string;
}

interface WiridCategoryData {
  category: string;
  category_slug: string;
  items: WiridItemData[];
}

const doaData: DoaCategoryData[] = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "../doa-data.json"), "utf-8")
);
const wiridData: WiridCategoryData[] = JSON.parse(
  readFileSync(resolve(import.meta.dirname, "../wirid-data.json"), "utf-8")
);

async function seed() {
  console.log("Seeding doa categories & items...");

  for (let i = 0; i < doaData.length; i++) {
    const cat = doaData[i];
    const [inserted] = await db
      .insert(doaCategories)
      .values({
        name: cat.category,
        slug: cat.category_slug,
        sortOrder: i + 1,
      })
      .returning();

    for (let j = 0; j < cat.items.length; j++) {
      const item = cat.items[j];
      await db.insert(doaItems).values({
        categoryId: inserted.id,
        title: item.title,
        arab: item.arab,
        latin: item.latin,
        translation: item.translation,
        sortOrder: j + 1,
      });
    }
    console.log(`  ✓ ${cat.category} (${cat.items.length} items)`);
  }

  console.log("Seeding wirid categories & items...");

  for (let i = 0; i < wiridData.length; i++) {
    const cat = wiridData[i];
    const [inserted] = await db
      .insert(wiridCategories)
      .values({
        name: cat.category,
        slug: cat.category_slug,
        sortOrder: i + 1,
      })
      .returning();

    for (let j = 0; j < cat.items.length; j++) {
      const item = cat.items[j];
      await db.insert(wiridItems).values({
        categoryId: inserted.id,
        title: item.title,
        arab: item.arab,
        latin: item.latin,
        translation: item.translation,
        sortOrder: j + 1,
      });
    }
    console.log(`  ✓ ${cat.category} (${cat.items.length} items)`);
  }

  console.log("Done!");
  await client.end();
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
