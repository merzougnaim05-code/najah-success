import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
import { hashPassword, verifyPassword, signToken, verifyToken } from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const COOKIE = "najah_token";
const AUTH_COOKIE_SECURE = process.env.NAJAH_COOKIE_SECURE === "1";

const LEVEL_ORDER = { "ابتدائي": 1, "متوسط": 2, "ثانوي": 3 };
const VALID_STATUS = ["في انتظار الرد", "مقبول", "مرفوض"];
const SETTING_KEYS = ["site_name", "tagline", "about", "phone", "email", "address", "notify_email", "times"];

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

/* ---------------- helpers ---------------- */

function getSettings() {
  const rows = db.prepare("SELECT key, value FROM settings").all();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

function publicSettings() {
  const s = getSettings();
  return {
    site_name: s.site_name,
    tagline: s.tagline,
    about: s.about,
    phone: s.phone,
    email: s.email,
    address: s.address,
    times: safeJson(s.times, []),
  };
}

function safeJson(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function authUser(req) {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return (
    db.prepare("SELECT id, username, role FROM users WHERE id = ?").get(payload.uid) || null
  );
}

function requireAuth(req, res, next) {
  const user = authUser(req);
  if (!user) return res.status(401).json({ error: "غير مصرح بالدخول" });
  req.user = user;
  next();
}

const catalogQuery = `
  SELECT id, name, level, subject FROM teachers
  ORDER BY CASE level WHEN 'ابتدائي' THEN 1 WHEN 'متوسط' THEN 2 ELSE 3 END, subject, name
`;

/* ---------------- public API ---------------- */

app.get("/api/meta", (req, res) => res.json({ data: publicSettings() }));

app.get("/api/catalog", (req, res) => {
  const rows = db.prepare(catalogQuery).all();
  const map = {};
  for (const t of rows) {
    (map[t.level] ??= {})[t.subject] ??= [];
    map[t.level][t.subject].push({ id: t.id, name: t.name });
  }
  const levels = Object.keys(map)
    .sort((a, b) => (LEVEL_ORDER[a] ?? 9) - (LEVEL_ORDER[b] ?? 9))
    .map((level) => ({
      name: level,
      subjects: Object.keys(map[level]).map((subject) => ({
        name: subject,
        teachers: map[level][subject],
      })),
    }));
  res.json({ data: levels });
});

app.post("/api/requests", (req, res) => {
  const { name, phone, level, subject, teacher, time_slot, note } = req.body || {};
  if (!name?.trim() || !phone?.trim() || !level || !subject || !teacher) {
    return res.status(400).json({ error: "يرجى إكمال جميع المعلومات الأساسية" });
  }
  const ref = "NJ-" + Date.now().toString(36).toUpperCase().slice(-6);
  const info = db
    .prepare(
      `INSERT INTO requests (ref, name, phone, level, subject, teacher, time_slot, note, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'في انتظار الرد')`
    )
    .run(ref, name.trim(), phone.trim(), level, subject, teacher, time_slot || null, note?.trim() || null);
  res.json({ data: { id: Number(info.lastInsertRowid), ref, status: "في انتظار الرد" } });
});

app.get("/api/requests/track", (req, res) => {
  const phone = String(req.query.phone || "").trim();
  if (!phone) return res.json({ data: [] });
  const rows = db
    .prepare(
      `SELECT ref, name, level, subject, teacher, time_slot, status, created_at
       FROM requests WHERE phone = ? ORDER BY id DESC`
    )
    .all(phone);
  res.json({ data: rows });
});

app.post("/api/messages", (req, res) => {
  const { name, phone, message } = req.body || {};
  if (!name?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "يرجى إدخال الاسم ونص الرسالة" });
  }
  db.prepare("INSERT INTO messages (name, phone, message) VALUES (?, ?, ?)").run(
    name.trim(),
    phone?.trim() || null,
    message.trim()
  );
  res.json({ data: true });
});

/* ---------------- auth API ---------------- */

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get((username || "").trim());
  if (!user || !verifyPassword(password || "", user.password_hash)) {
    return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
  }
  const token = signToken({ uid: user.id, username: user.username, role: user.role });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: AUTH_COOKIE_SECURE,
    path: "/",
    maxAge: 7 * 24 * 3600 * 1000,
  });
  res.json({ data: { id: user.id, username: user.username, role: user.role } });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie(COOKIE, { path: "/" });
  res.json({ data: true });
});

app.get("/api/auth/me", (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ error: "غير مصرح" });
  res.json({ data: user });
});

app.post("/api/auth/change-password", requireAuth, (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
  }
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
  if (!verifyPassword(oldPassword || "", user.password_hash)) {
    return res.status(401).json({ error: "كلمة المرور الحالية غير صحيحة" });
  }
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
    hashPassword(newPassword),
    req.user.id
  );
  res.json({ data: true });
});

/* ---------------- admin API ---------------- */

app.get("/api/admin/stats", requireAuth, (req, res) => {
  const status = { "مقبول": 0, "مرفوض": 0, "في انتظار الرد": 0 };
  for (const r of db.prepare("SELECT status, COUNT(*) c FROM requests GROUP BY status").all()) {
    status[r.status] = r.c;
  }
  const total = db.prepare("SELECT COUNT(*) c FROM requests").get().c;
  const byLevel = db.prepare("SELECT level, COUNT(*) c FROM requests GROUP BY level").all();
  const messages = db.prepare("SELECT COUNT(*) c FROM messages").get().c;
  const teachers = db.prepare("SELECT COUNT(*) c FROM teachers").get().c;
  res.json({ data: { total, status, byLevel, messages, teachers } });
});

app.get("/api/admin/requests", requireAuth, (req, res) => {
  const { q = "", level = "", status = "", subject = "", page = 1, pageSize = 10 } = req.query;
  const where = [];
  const params = [];
  if (q) {
    where.push("(name LIKE ? OR phone LIKE ? OR ref LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (level) {
    where.push("level = ?");
    params.push(level);
  }
  if (status) {
    where.push("status = ?");
    params.push(status);
  }
  if (subject) {
    where.push("subject = ?");
    params.push(subject);
  }
  const clause = where.length ? "WHERE " + where.join(" AND ") : "";
  const total = db.prepare(`SELECT COUNT(*) c FROM requests ${clause}`).get(...params).c;
  const p = Math.max(1, parseInt(page, 10) || 1);
  const ps = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 10));
  const items = db
    .prepare(`SELECT * FROM requests ${clause} ORDER BY id DESC LIMIT ? OFFSET ?`)
    .all(...params, ps, (p - 1) * ps);
  res.json({ data: { items, total, page: p, pageSize: ps } });
});

app.patch("/api/admin/requests/:id", requireAuth, (req, res) => {
  const row = db.prepare("SELECT * FROM requests WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "الطلب غير موجود" });
  const b = req.body || {};
  const fields = {};
  for (const key of ["name", "phone", "level", "subject", "teacher", "time_slot", "note"]) {
    if (b[key] !== undefined) fields[key] = String(b[key]);
  }
  if (b.status !== undefined) {
    if (!VALID_STATUS.includes(b.status)) return res.status(400).json({ error: "حالة غير صالحة" });
    fields.status = b.status;
  }
  const keys = Object.keys(fields);
  if (keys.length) {
    db.prepare(
      `UPDATE requests SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`
    ).run(...keys.map((k) => fields[k]), Number(req.params.id));
  }
  res.json({ data: db.prepare("SELECT * FROM requests WHERE id = ?").get(req.params.id) });
});

app.delete("/api/admin/requests/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM requests WHERE id = ?").run(Number(req.params.id));
  res.json({ data: true });
});

app.get("/api/admin/teachers", requireAuth, (req, res) => {
  const { level = "", subject = "" } = req.query;
  const where = [];
  const params = [];
  if (level) {
    where.push("level = ?");
    params.push(level);
  }
  if (subject) {
    where.push("subject = ?");
    params.push(subject);
  }
  const clause = where.length ? "WHERE " + where.join(" AND ") : "";
  const rows = db
    .prepare(`SELECT * FROM teachers ${clause} ORDER BY created_at DESC, id DESC`)
    .all(...params);
  res.json({ data: rows });
});

app.post("/api/admin/teachers", requireAuth, (req, res) => {
  const { name, level, subject } = req.body || {};
  if (!name?.trim() || !level || !subject?.trim()) {
    return res.status(400).json({ error: "يرجى إكمال جميع الحقول" });
  }
  const info = db
    .prepare("INSERT INTO teachers (name, level, subject) VALUES (?, ?, ?)")
    .run(name.trim(), level, subject.trim());
  res.json({ data: { id: Number(info.lastInsertRowid), name: name.trim(), level, subject: subject.trim() } });
});

app.delete("/api/admin/teachers/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM teachers WHERE id = ?").run(Number(req.params.id));
  res.json({ data: true });
});

app.get("/api/admin/messages", requireAuth, (req, res) => {
  const rows = db.prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 200").all();
  res.json({ data: rows });
});

app.delete("/api/admin/messages/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM messages WHERE id = ?").run(Number(req.params.id));
  res.json({ data: true });
});

app.get("/api/admin/settings", requireAuth, (req, res) => res.json({ data: getSettings() }));

app.put("/api/admin/settings", requireAuth, (req, res) => {
  const body = req.body || {};
  const upd = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value");
  for (const key of SETTING_KEYS) {
    if (body[key] !== undefined) upd.run(key, String(body[key]));
  }
  res.json({ data: getSettings() });
});

/* ---------------- static + SPA fallback (production) ---------------- */

const dist = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
}

/* ---------------- error handling ---------------- */

app.use((req, res) => res.status(404).json({ error: "غير موجود" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "خطأ داخلي في الخادم" });
});

app.listen(PORT, () => {
  console.log(`✅ خادم جمعية النجاح يعمل على المنفذ ${PORT}`);
});