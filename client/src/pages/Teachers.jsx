import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Teachers() {
  const { catalog } = useApp();
  const [level, setLevel] = useState("");
  const [q, setQ] = useState("");

  const levels = catalog
    ?.filter((l) => !level || l.name === level)
    .map((l) => ({
      ...l,
      subjects: l.subjects
        .map((s) => ({
          ...s,
          teachers: s.teachers.filter((t) => !q || t.name.includes(q) || s.name.includes(q)),
        }))
        .filter((s) => s.teachers.length),
    }))
    .filter((l) => l.subjects.length);

  return (
    <div className="container page">
      <div className="section-head">
        <h2>أساتذتنا</h2>
        <div className="underline" />
        <p>فريق من الأساتذة المؤهلين في مختلف المواد واللغات وجميع الأطوار</p>
      </div>

      <div className="filters card" style={{ gridTemplateColumns: "1fr 1fr", maxWidth: 620 }}>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">كل الأطوار</option>
          <option>ابتدائي</option>
          <option>متوسط</option>
          <option>ثانوي</option>
        </select>
        <input placeholder="🔎 ابحث عن أستاذ أو مادة..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {!catalog?.length ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : (
        <div>
          {levels?.length ? (
            levels.map((l) => (
              <div className="teachers-level" key={l.name}>
                <h3>🎓 {l.name}</h3>
                {l.subjects.map((s) => (
                  <div className="subject-block" key={s.name}>
                    <div className="sb-title">{s.name}</div>
                    <div className="teacher-grid">
                      {s.teachers.map((t) => (
                        <div className="card teacher-tile pad card-hover" key={t.id}>
                          <div className="av">{t.name.replace(/^أ\.\s*/, "").charAt(0)}</div>
                          <div>
                            <b>{t.name}</b>
                            <span>{l.name} · {s.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="empty">لا توجد نتائج مطابقة للبحث</div>
          )}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Link to="/register" className="btn btn-primary">سجّل الآن مع أحد أساتذتنا</Link>
      </div>
    </div>
  );
}