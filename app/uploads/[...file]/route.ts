import { readFile } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR } from "@/lib/upload";

export async function GET(
  _req: Request,
  ctx: RouteContext<"/uploads/[...file]">
) {
  const { file } = await ctx.params;
  const filename = file.join("/");
  const safe = path.normalize(filename).replace(/^(\.\.[\/\\])+/, "");
  const full = path.join(UPLOAD_DIR, safe);

  if (!full.startsWith(UPLOAD_DIR)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const data = await readFile(full);
    const ext = path.extname(full).slice(1).toLowerCase();
    const contentType =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
