import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import { useApp } from "../../context/AppContext";
import Badge from "../../components/Badge";
import Modal from "../../components/Modal";

const STATUSES = ["في انتظار الرد", "مقبول", "مرفوض"];

export default function Dashboard() {
  const { catalog, notify, meta } = useApp();
  const [stats, setStats] = useState(null);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [q, setQ] = useState("");
  const [level, setLevel] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState(null);
  const [viewRow, setViewRow] = useState(null);

  const subjects = [...new Set((catalog || []).flatMap((l) => l.subjects.map((s) => s.name)))];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (level) params.set("level", level);
      if (fStatus) params.set("status", fStatus);
      if (subject) params.set("subject", subject);
      params.set("page", page);
      params.set("pageSize", pageSize);
      const data = await api.get("/api/admin/requests?" + params.toString());
      setRows(data.items);
      setTotal(data.total);
    } catch (e) {
      notify(e.message || "خطأ في تحميل الطلبات", "err");
    } finally {
      setLoading(false);
    }
  }, [q, level, fStatus, subject, page, pageSize, notify]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await api.get("/api/admin/stats"));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadStats(); }, [loadStats]);

  async function setStatus(id, value, msg) {
    try {
      await api.patch(`/api/admin/requests/${id}`, { status: value });
      notify(msg);
      load();
      loadStats();
    } catch (e) {
      notify(e.message || "خطأ", "err");
    }
  }

  async function remove(id) {
    if (!window.confirm("هل تريد حذف هذا الطلب نهائيًا؟")) return;
    try {
      await api.delete(`/api/admin/requests/${id}`);
      notify("تم حذف الطلب");
      load();
      loadStats();
    } catch (e) {
      notify(e.message || "خطأ", "err");
    }
  }

  async function saveEdit() {
    try {
      await api.patch(`/api/admin/requests/${editRow.id}`, {
        name: editRow.name,
        phone: editRow.phone,
        level: editRow.level,
        subject: editRow.subject,
        teacher: editRow.teacher,
        time_slot: editRow.time_slot,
        note: editRow.note,
        status: editRow.status,
      });
      notify("تم حفظ التعديلات");
      setEditRow(null);
      load();
      loadStats();
    } catch (e) {
      notify(e.message || "خطأ", "err");
    }
  }

  function reset() {
    setQ(""); setLevel(""); setFStatus(""); setSubject(""); setPage(1);
  }

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <div className="stats">
        <div className="stat"><small>إجمالي الطلبات</small><strong>{stats?.total ?? "…"}</strong></div>
        <div className="stat ok"><small>مقبولة</small><strong>{stats?.status?.["مقبول"] ?? "…"}</strong></div>
        <div className="stat wait"><small>في انتظار الرد</small><strong>{stats?.status?.["في انتظار الرد"] ?? "…"}</strong></div>
        <div className="stat no"><small>مرفوضة</small><strong>{stats?.status?.["مرفوض"] ?? "…"}</strong></div>
      </div>

      <div className="card filters">
        <input placeholder="🔎 البحث: الاسم، الهاتف، المرجع..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
        <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}>
          <option value="">كل الأطوار</option>
          <option>ابتدائي</option>
          <option>متوسط</option>
          <option>ثانوي</option>
        </select>
        <select value={fStatus} onChange={(e) => { setFStatus(e.target.value); setPage(1); }}>
          <option value="">كل الحالات</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={subject} onChange={(e) => { setSubject(e.target.value); setPage(1); }}>
          <option value="">كل المواد</option>
          {subjects.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-gold btn-sm" onClick={reset}>تصفية</button>
      </div>

      <div className="card table-wrap">
        {loading ? (
          <div className="loading-page"><div className="spinner" /></div>
        ) : rows.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>المرجع</th>
                <th>الاسم واللقب</th>
                <th>الهاتف</th>
                <th>الطور</th>
                <th>المادة</th>
                <th>الأستاذ</th>
                <th>الحالة</th>
                <th>التوقيت</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td data-label="#">{(page - 1) * pageSize + i + 1}</td>
                  <td data-label="المرجع"><b style={{ fontSize: 12 }}>{r.ref}</b></td>
                  <td data-label="الاسم"><b>{r.name}</b></td>
                  <td data-label="الهاتف" dir="ltr">{r.phone}</td>
                  <td data-label="الطور">{r.level}</td>
                  <td data-label="المادة">{r.subject}</td>
                  <td data-label="الأستاذ">{r.teacher}</td>
                  <td data-label="الحالة"><Badge status={r.status} /></td>
                  <td data-label="التوقيت">{r.time_slot || "—"}</td>
                  <td className="no-label">
                    <div className="actions">
                      <button className="act act-view" title="عرض" onClick={() => setViewRow(r)}>👁</button>
                      <button className="act act-edit" title="تعديل" onClick={() => setEditRow({ ...r })}>✎</button>
                      {r.status !== "مقبول" && <button className="act act-ok" title="قبول" onClick={() => setStatus(r.id, "مقبول", "تم قبول الطلب")}>✓</button>}
                      {r.status !== "مرفوض" && <button className="act act-no" title="رفض" onClick={() => setStatus(r.id, "مرفوض", "تم رفض الطلب")}>×</button>}
                      <button className="act act-del" title="حذف" onClick={() => remove(r.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty">لا توجد طلبات مطابقة</div>
        )}
      </div>

      {pages > 1 && (
        <div className="pagination">
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>إجمالي {total} طلب — صفحة {page} من {pages}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>السابق</button>
            <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>التالي</button>
          </div>
        </div>
      )}

      {viewRow && (
        <Modal title={`تفاصيل الطلب ${viewRow.ref}`} onClose={() => setViewRow(null)}>
          <div className="kv">
            <div><b>الاسم:</b> {viewRow.name}</div>
            <div><b>الهاتف:</b> <span dir="ltr">{viewRow.phone}</span></div>
            <div><b>الطور:</b> {viewRow.level}</div>
            <div><b>المادة:</b> {viewRow.subject}</div>
            <div><b>الأستاذ:</b> {viewRow.teacher}</div>
            <div><b>التوقيت:</b> {viewRow.time_slot || "يحدد لاحقًا"}</div>
            <div><b>الحالة:</b> <Badge status={viewRow.status} /></div>
            <div><b>تاريخ الإرسال:</b> {viewRow.created_at}</div>
            {viewRow.note && <div><b>ملاحظات:</b> {viewRow.note}</div>}
          </div>
        </Modal>
      )}

      {editRow && (
        <Modal title={`تعديل الطلب ${editRow.ref}`} onClose={() => setEditRow(null)}>
          <div className="field"><label>الاسم واللقب</label>
            <input value={editRow.name} onChange={(e) => setEditRow({ ...editRow, name: e.target.value })} />
          </div>
          <div className="field"><label>رقم الهاتف</label>
            <input value={editRow.phone} onChange={(e) => setEditRow({ ...editRow, phone: e.target.value })} dir="ltr" style={{ textAlign: "right" }} />
          </div>
          <div className="row2">
            <div className="field"><label>الطور</label>
              <select value={editRow.level} onChange={(e) => setEditRow({ ...editRow, level: e.target.value })}>
                <option>ابتدائي</option><option>متوسط</option><option>ثانوي</option>
              </select>
            </div>
            <div className="field"><label>المادة</label>
              <input value={editRow.subject} onChange={(e) => setEditRow({ ...editRow, subject: e.target.value })} />
            </div>
          </div>
          <div className="field"><label>الأستاذ</label>
            <input value={editRow.teacher} onChange={(e) => setEditRow({ ...editRow, teacher: e.target.value })} />
          </div>
          <div className="row2">
            <div className="field"><label>التوقيت</label>
              <select value={editRow.time_slot || ""} onChange={(e) => setEditRow({ ...editRow, time_slot: e.target.value })}>
                <option value="">يحدد لاحقًا</option>
                {(meta?.times || []).map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field"><label>الحالة</label>
              <select value={editRow.status} onChange={(e) => setEditRow({ ...editRow, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="field"><label>ملاحظات</label>
            <textarea value={editRow.note || ""} onChange={(e) => setEditRow({ ...editRow, note: e.target.value })} />
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            <button className="btn btn-primary" onClick={saveEdit} style={{ flex: 1 }}>حفظ التعديلات</button>
            <button className="btn btn-ghost" onClick={() => setEditRow(null)}>إلغاء</button>
          </div>
        </Modal>
      )}
    </>
  );
}