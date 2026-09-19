import { useState } from "react";
import { api } from "../api";
import { useApp } from "../context/AppContext";

export default function Contact() {
  const { meta, notify } = useApp();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sending, setSending] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) {
      notify("يرجى إدخال الاسم ونص الرسالة", "err");
      return;
    }
    setSending(true);
    try {
      await api.post("/api/messages", form);
      setForm({ name: "", phone: "", message: "" });
      notify("تم إرسال رسالتك بنجاح، سنتواصل معك قريبًا");
    } catch (err) {
      notify(err.message || "تعذر الإرسال", "err");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container page">
      <div className="section-head">
        <h2>تواصل معنا</h2>
        <div className="underline" />
        <p>يسعدنا تواصلكم معنا لأي استفسار أو اقتراح</p>
      </div>

      <div className="split-panel">
        <form className="card form-card" onSubmit={submit} noValidate>
          <div className="field">
            <label>الاسم الكامل *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسمك الكامل" />
          </div>
          <div className="field">
            <label>رقم الهاتف (اختياري)</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0555 12 34 56" dir="ltr" style={{ textAlign: "right" }} />
          </div>
          <div className="field">
            <label>رسالتك *</label>
            <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="اكتب رسالتك هنا..." />
          </div>
          <button className="btn btn-primary btn-block" disabled={sending} type="submit">
            {sending ? "جارٍ الإرسال..." : "إرسال الرسالة"}
          </button>
        </form>

        <div>
          <div className="card pad card-hover">
            <b style={{ color: "var(--violet)", fontSize: 15.5 }}>معلومات التواصل</b>
            <div className="kv" style={{ marginTop: 12 }}>
              <div>📞 الهاتف: <b>{meta?.phone || "-"}</b></div>
              <div>✉️ البريد الإلكتروني: <b dir="ltr" style={{ unicodeBidi: "embed" }}>{meta?.email || "-"}</b></div>
              <div>📍 العنوان: <b>{meta?.address || "-"}</b></div>
              <div>⏰ أوقات العمل: من السبت إلى الخميس، 08:00 – 20:00</div>
            </div>
          </div>
          <div className="card pad" style={{ marginTop: 14, background: "linear-gradient(160deg, var(--violet), var(--violet-2))", color: "#fff" }}>
            <b style={{ fontSize: 15 }}>نصيحة سريعة</b>
            <p style={{ fontSize: 13, color: "#e9d5ff", marginTop: 6, lineHeight: 1.9 }}>
              لإرسال طلب التسجيل في الدروس، استخدم صفحة <a href="/register" style={{ fontWeight: 800, textDecoration: "underline" }}>التسجيل</a> مباشرة،
              واحتفظ برقم المرجع لتدوم على اطلاع بحالة طلبك.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}