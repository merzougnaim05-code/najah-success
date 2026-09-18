import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import { useApp } from "../../context/AppContext";

const LEVELS = ["ابتدائي", "متوسط", "ثانوي"];

export default function TeachersAdmin() {
  const { notify, refreshCatalog } = useApp();
  const [teachers, setTeachers] = useState([]);
  const [loadLevel, setLoadLevel] = useState("");
  const [loadSubject, setLoadSubject] = useState("");
  const [form, setForm] = useState({ name: "", level: "", subject: "" });

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (loadLevel) params.set("level", loadLevel);
      if (loadSubject) params.set("subject", loadSubject);
      const data = await api.get("/api/admin/teachers?" + params.toString());
      setTeachers(data);
    } catch (e) {
      notify(e.message || "خطأ", "err");
    }
  }, [loadLevel, loadSubject, notify]);

  useEffect(() => { load(); }, [load]);

  const grouped = LEVELS.map((lv) => ({
    level: lv,
    subjects: [...new Set(teachers.filter((t) => t.level === lv).map((t) => t.subject))],
  })).filter((g) => g.subjects.length);

  async function add() {
    if (!form.name.trim() || !form.level || !form.subject.trim()) {
      notify("يرجى إكمال جميع الحقول", "err");
      return;
    }
    try {
      await api.post("/api/admin/teachers", form);
      notify("تمت إضافة الأستاذ بنجاح");
      setForm({ name: "", level: "", subject: "" });
      load();
      refreshCatalog();
    } catch (e) {
      notify(e.message || "خطأ", "err");
    }
  }

  async function remove(id, name) {
    if (!window.confirm(`حذف الأستاذ «${name}» نهائيًا؟`)) return;
    try {
      await api.delete(`/api/admin/teachers/${id}`);
      notify("تم حذف الأستاذ");
      load();
      refreshCatalog();
    } catch (e) {
      notify(e.message || "خطأ", "err");
    }
  }

  return (
    <>
      <div className="card" style={{ padding: 14, marginBottom: 14 }}>
        <h3 style={{ margin: "2px 2px 10px", color: "var(--maroon-2)", fontSize: 15 }}>➕ إضافة أستاذ جديد</h3>
        <div className="tform" style={{ padding: 0 }}>
          <input placeholder="اسم الأستاذ (مثال: أ. محمد بن علي)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            <option value="">اختر الطور</option>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
          <input placeholder="المادة / اللغة" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <button className="btn btn-primary" onClick={add}>إضافة</button>
        </div>
      </div>

      <div className="card" style={{ padding: 14, marginBottom: 14, display: "flex", gap: 9, flexWrap: "wrap" }}>
        <select style={{ height: 40, border: "1.5px solid var(--line)", borderRadius: 11, padding: "0 12px" }} value={loadLevel} onChange={(e) => setLoadLevel(e.target.value)}>
          <option value="">كل الأطوار</option>
          {LEVELS.map((l) => <option key={l}>{l}</option>)}
        </select>
        <input style={{ height: 40, border: "1.5px solid var(--line)", borderRadius: 11, padding: "0 12px", flex: 1, minWidth: 160 }} placeholder="تصفية حسب المادة..." value={loadSubject} onChange={(e) => setLoadSubject(e.target.value)} />
      </div>

      {grouped.length ? (
        grouped.map((g) => (
          <div className="card tgroup" key={g.level}>
            <h4>🎓 {g.level}</h4>
            {g.subjects.map((s) => (
              <div className="tsub" key={s}>
                <div className="lbl">{s}</div>
                <div className="tchips">
                  {teachers.filter((t) => t.level === g.level && t.subject === s).map((t) => (
                    <span className="tchip" key={t.id}>
                      {t.name}
                      <button className="x" onClick={() => remove(t.id, t.name)}>×</button>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))
      ) : (
        <div className="empty">لا يوجد أساتذة مطابقون</div>
      )}
    </>
  );
}