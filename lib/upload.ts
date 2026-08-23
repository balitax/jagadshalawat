import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export function fileExtFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "bin";
  }
}

export async function saveReceipt(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("Ukuran file maksimal 5MB.");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${fileExtFromMime(file.type)}`;
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return `/uploads/${filename}`;
}
