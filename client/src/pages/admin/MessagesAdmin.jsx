import { useEffect, useState, useCallback } from "react";
import { api } from "../../api";
import { useApp } from "../../context/AppContext";

export default function MessagesAdmin() {
  const { notify } = useApp();
  const [messages, setMessages] = useState([]);

  const load = useCallback(async () => {
    try {
      setMessages(await api.get("/api/admin/messages"));
    } catch (e) {
      notify(e.message || "خطأ", "err");
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  async function remove(id) {
    if (!window.confirm("حذف هذه الرسالة نهائيًا؟")) return;
    try {
      await api.delete(`/api/admin/messages/${id}`);
      notify("تم حذف الرسالة");
      load();
    } catch (e) {
      notify(e.message || "خطأ", "err");
    }
  }

  return (
    <>
      <div className="card" style={{ padding: 13, marginBottom: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <b style={{ color: "var(--coral-2)" }}>✉️ رسائل الزوار ({messages.length})</b>
        <button className="btn btn-ghost btn-sm" onClick={load}>تحديث</button>
      </div>

      {messages.length ? (
        <div style={{ display: "grid", gap: 11 }}>
          {messages.map((m) => (
            <div className="card pad card-hover" key={m.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                <div>
                  <b style={{ color: "var(--coral-2)" }}>{m.name}</b>
                  {m.phone && <div style={{ fontSize: 12, color: "var(--muted)" }} dir="ltr" align="right">{m.phone}</div>}
                  <p style={{ fontSize: 13.5, marginTop: 8, lineHeight: 1.9 }}>{m.message}</p>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6 }}>{m.created_at}</div>
                </div>
                <button className="act act-del" title="حذف" onClick={() => remove(m.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">لا توجد رسائل بعد</div>
      )}
    </>
  );
}
