import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let realDb: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (realDb) return realDb;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const client = postgres(url, {
    max: 10,
    prepare: false,
    onnotice: () => {},
  });
  realDb = drizzle(client, { schema });
  return realDb;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  },
});

export { schema };
