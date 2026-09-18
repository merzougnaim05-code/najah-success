import fs from "node:fs";
import { db } from "./db.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "data");

db.close();
const files = ["najah.db", "najah.db-shm", "najah.db-wal"];
for (const f of files) {
  const p = path.join(dataDir, f);
  if (fs.existsSync(p)) fs.rmSync(p, { force: true });
}
console.log("تم حذف قاعدة البيانات بنجاح. أعد تشغيل الخادم لإعادة التهيئة.");
process.exit(0);