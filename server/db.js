import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { hashPassword } from "./auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });

export const db = new DatabaseSync(path.join(dataDir, "najah.db"));
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ref TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  level TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher TEXT NOT NULL,
  time_slot TEXT,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'في انتظار الرد',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS teachers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  level TEXT NOT NULL,
  subject TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
`);

const DEFAULT_SETTINGS = {
  site_name: "جمعية النجاح الثقافية",
  tagline: "معًا نحو مستقبل أفضل لأبنائنا",
  about: "جمعية ثقافية تهتم بتقديم دروس الدعم والتقوية في مختلف المواد واللغات، ولجميع الأطوار: ابتدائي، متوسط، وثانوي. نعمل على توفير فضاء تربوي منظم يساعد التلاميذ على تحسين مستواهم مع متابعة مستمرة من إدارة الجمعية.",
  phone: "0555 12 34 56",
  email: "merzougnaim05@gmail.com",
  address: "شارع الاستقلال، مدينة الجزائر",
  notify_email: "merzougnaim05@gmail.com",
  times: JSON.stringify([
    "08:00 - 10:00",
    "10:00 - 12:00",
    "14:00 - 16:00",
    "16:00 - 18:00",
    "18:00 - 20:00",
  ]),
};

function seed() {
  const userCount = db.prepare("SELECT COUNT(*) c FROM users").get().c;
  if (userCount === 0) {
    db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)").run(
      "admin",
      hashPassword(process.env.NAJAH_ADMIN_PASSWORD || "admin123"),
      "admin"
    );
  }

  const settingCount = db.prepare("SELECT COUNT(*) c FROM settings").get().c;
  if (settingCount === 0) {
    const ins = db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)");
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) ins.run(k, v);
  }

  const teacherCount = db.prepare("SELECT COUNT(*) c FROM teachers").get().c;
  if (teacherCount === 0) {
    const ins = db.prepare("INSERT INTO teachers (name, level, subject) VALUES (?, ?, ?)");
    const catalog = {
      "ابتدائي": {
        "رياضيات": ["أ. أحمد قاسم", "أ. ليلى حداد"],
        "لغة عربية": ["أ. كريم بلقاسم", "أ. سميرة عادل"],
        "فرنسية": ["أ. نوال بن علي"],
        "إنجليزية": ["أ. أمينة سعد"],
        "علوم طبيعية": ["أ. سعاد عادل"],
      },
      "متوسط": {
        "رياضيات": ["أ. أحمد بن قاسم", "أ. ليلى حداد"],
        "لغة عربية": ["أ. كريم بلقاسم"],
        "فرنسية": ["أ. نوال بن علي", "أ. سميرة عادل"],
        "إنجليزية": ["أ. أمينة سعد"],
        "علوم طبيعية": ["أ. سعاد عادل"],
        "فيزياء": ["أ. مراد زروال"],
      },
      "ثانوي": {
        "رياضيات": ["أ. أحمد بن قاسم", "أ. مراد زروال"],
        "لغة عربية": ["أ. كريم بلقاسم"],
        "فرنسية": ["أ. نوال بن علي"],
        "إنجليزية": ["أ. أمينة سعد"],
        "علوم طبيعية": ["أ. سعاد عادل"],
        "فيزياء": ["أ. مراد زروال"],
      },
    };
    for (const level of Object.keys(catalog)) {
      for (const subject of Object.keys(catalog[level])) {
        for (const name of catalog[level][subject]) {
          ins.run(name, level, subject);
        }
      }
    }
  }

  const requestCount = db.prepare("SELECT COUNT(*) c FROM requests").get().c;
  if (requestCount === 0) {
    const ins = db.prepare(`
      INSERT INTO requests (ref, name, phone, level, subject, teacher, time_slot, note, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const samples = [
      ["NJ-2M3KQ1", "محمد علي", "0555 12 34 56", "متوسط", "رياضيات", "أ. أحمد بن قاسم", "16:00 - 18:00", "يفضل حصتين أسبوعيًا", "مقبول"],
      ["NJ-8P4VZA", "سارة محمد", "07 12 34 56 78", "ثانوي", "فرنسية", "أ. نوال بن علي", "18:00 - 20:00", null, "في انتظار الرد"],
      ["NJ-1K9WBE", "ياسين بوعلام", "06 98 76 54 32", "ابتدائي", "لغة عربية", "أ. كريم بلقاسم", "14:00 - 16:00", null, "مرفوض"],
    ];
    for (const s of samples) ins.run(...s);
  }
}

seed();