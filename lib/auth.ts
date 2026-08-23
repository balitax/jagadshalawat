import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isLoggedIn?: boolean;
}

const secret = process.env.SESSION_SECRET ?? "insecure-dev-secret-change-me-in-production";
if (secret.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters long");
}

export const sessionOptions: SessionOptions = {
  password: secret,
  cookieName: "js_admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

const adminPassword = process.env.ADMIN_PASSWORD ?? "";
const HASH_SECRET = process.env.SESSION_SECRET ?? secret;

export async function verifyPassword(input: string): Promise<boolean> {
  if (!adminPassword) return false;
  const hasher = async (value: string) => {
    const { createHash } = await import("node:crypto");
    return createHash("sha256").update(`${value}:${HASH_SECRET}`).digest("hex");
  };
  const [a, b] = await Promise.all([hasher(input), hasher(adminPassword)]);
  if (a.length !== b.length) return false;

  const { timingSafeEqual } = await import("node:crypto");
  return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
}
