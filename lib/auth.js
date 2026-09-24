import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE = "fm_admin";
const MAX_AGE = 60 * 60 * 12; // 12 horas
const secret = () => process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "dev-secret";
const sign = (v) => crypto.createHmac("sha256", secret()).update(v).digest("hex");

export function checkPassword(pw) {
  const real = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "admin" : "");
  if (!real || typeof pw !== "string") return false;
  const a = Buffer.from(sign(pw)), b = Buffer.from(sign(real));
  return crypto.timingSafeEqual(a, b);
}

export async function startSession() {
  const exp = String(Date.now() + MAX_AGE * 1000);
  (await cookies()).set(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: MAX_AGE,
  });
}

export async function endSession() { (await cookies()).delete(COOKIE); }

export async function isAdmin() {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
