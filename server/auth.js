import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "node:crypto";

const SECRET = process.env.NAJAH_SECRET || "najah-association-secret-2026";

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  try {
    const [salt, hash] = String(stored).split(":");
    const candidate = scryptSync(password || "", salt, 64);
    const expected = Buffer.from(hash || "", "hex");
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

export function signToken(payload, expiresInSec = 7 * 24 * 3600) {
  const body = Buffer.from(
    JSON.stringify({ ...payload, exp: Date.now() + expiresInSec * 1000 })
  ).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token) {
  try {
    const [body, sig] = String(token).split(".");
    const expected = createHmac("sha256", SECRET).update(body).digest("base64url");
    if (!timingSafeEqual(Buffer.from(sig || ""), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}