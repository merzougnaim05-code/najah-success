import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useApp } from "../context/AppContext";

export default function Register() {
  const { catalog, meta, notify } = useApp();
  const [form, setForm] = useState({
    name: "", phone: "", level: "", subject: "", teacher: "", time_slot: "", note: "",
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [notifyEmail, setNotifyEmail] = useState(false);

  const levels = catalog;
  const subjects = levels?.find((l) => l.name === form.level)?.subjects || [];
  const teachers = subjects.find((s) => s.name === form.subject)?.teachers || [];
  const times = meta?.times || [];

  const set = (key) => (e) => {
    const v = e.target.value;
    setForm((f) => {
      const nf = { ...f, [key]: v };
      if (key === "level") { nf.subject = ""; nf.teacher = ""; }
      if (key === "subject") nf.teacher = "";
      return nf;
    });
  };

  async function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "أدخل الاسم واللقب";
    if (!/^[\d\s+-]{6,20}$/.test(form.phone.trim())) errs.phone = "أدخل رقم هاتف صحيح";
    if (!form.level) errs.level = "اختر الطور";
    if (!form.subject) errs.subject = "اختر المادة";
    if (!form.teacher) errs.teacher = "اختر الأستاذ";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSending(true);
    try {
      const res = await api.post("/api/requests", { ...form, level: form.level, subject: form.subject });
      setResult(res);
      if (notifyEmail && meta?.notify_email) {
        const fd = new FormData();
        fd.append("الاسم واللقب", form.name);
        fd.append("رقم الهاتف", form.phone);
        fd.append("الطور", form.level);
        fd.append("المادة", form.subject);
        fd.append("الأستاذ", form.teacher);
        fd.append("توقيت الحضور", form.time_slot || "يحدد لاحقًا");
        fd.append("المرجع", res.ref);
        fd.append("_subject", `طلب تسجيل جديد (${res.ref}) - ${meta?.site_name || "جمعية النجاح"}`);
        fetch("https://formsubmit.co/ajax/" + meta.notify_email, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: fd,
        }).catch(() => {});
      }
      notify("تم إرسال طلبك بنجاح");
    } catch (err) {
      notify(err.message || "تعذر إرسال الطلب", "err");
    } finally {
      setSending(false);
    }
  }

  if (result) {
    return (
      <div className="container page">
        <div className="card form-card success-box" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className="big">🎉</div>
          <h2>تم استلام طلبك بنجاح!</h2>
          <p style={{ color: "var(--muted)", margin: "8px 0 4px" }}>
            احتفظ برقم المرجع الخاص بك لمتابعة حالة الطلب:
          </p>
          <div style={{ fontSize: 26, fontWeight: 900, color: "var(--coral-2)", margin: "8px 0 14px", letterSpacing: 1 }}>
            {result.ref}
          </div>
          <p className="notice" style={{ textAlign: "right" }}>
            طلبك الآن في انتظار الرد من إدارة الجمعية. يمكنك متابعة الحالة في أي وقت من صفحة
            «تتبع طلبك» عبر إدخال رقم هاتفك.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/track" className="btn btn-primary">تتبع طلبي الآن</Link>
            <button className="btn btn-outline" onClick={() => { setResult(null); setForm({ name: "", phone: "", level: "", subject: "", teacher: "", time_slot: "", note: "" }); }}>تسجيل طلب آخر</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="section-head">
        <h2>التسجيل في الدروس</h2>
        <div className="underline" />
        <p>أدخل المعلومات التالية لإرسال طلبك إلى الجمعية</p>
      </div>

      <div className="split-panel">
        <form className="card form-card" onSubmit={submit} noValidate>
          <div className="field">
            <label>الاسم واللقب *</label>
            <input value={form.name} onChange={set("name")} placeholder="أدخل اسمك ولقبك" />
            {errors.name && <div className="field-error">{errors.name}</div>}
          </div>
          <div className="field">
            <label>رقم الهاتف *</label>
            <input value={form.phone} onChange={set("phone")} placeholder="مثال: 0555 12 34 56" inputMode="tel" dir="ltr" style={{ textAlign: "right" }} />
            {errors.phone && <div className="field-error">{errors.phone}</div>}
          </div>
          <div className="row2">
            <div className="field">
              <label>الطور *</label>
              <select value={form.level} onChange={set("level")}>
                <option value="">اختر الطور</option>
                {levels.map((l) => <option key={l.name} value={l.name}>{l.name}</option>)}
              </select>
              {errors.level && <div className="field-error">{errors.level}</div>}
            </div>
            <div className="field">
              <label>المادة / اللغة *</label>
              <select value={form.subject} onChange={set("subject")} disabled={!form.level}>
                <option value="">{form.level ? "اختر المادة" : "اختر الطور أولاً"}</option>
                {subjects.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
              {errors.subject && <div className="field-error">{errors.subject}</div>}
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label>الأستاذ *</label>
              <select value={form.teacher} onChange={set("teacher")} disabled={!form.subject}>
                <option value="">{form.subject ? "اختر الأستاذ" : "اختر المادة أولاً"}</option>
                {teachers.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
              {errors.teacher && <div className="field-error">{errors.teacher}</div>}
            </div>
            <div className="field">
              <label>توقيت الحضور المفضل</label>
              <select value={form.time_slot} onChange={set("time_slot")}>
                <option value="">يحدد لاحقًا</option>
                {times.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label>ملاحظات (اختياري)</label>
            <textarea value={form.note} onChange={set("note")} placeholder="أي ملاحظات تريد إضافتها..." />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "var(--muted)", marginBottom: 15, cursor: "pointer" }}>
            <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} style={{ width: 17, height: 17 }} />
            إرسال إشعار بالبريد الإلكتروني إلى إدارة الجمعية
          </label>

          <button className="btn btn-primary btn-block" disabled={sending} type="submit">
            {sending ? "جارٍ الإرسال..." : "إرسال الطلب"}
          </button>
        </form>

        <div>
          <div className="card pad card-hover">
            <b style={{ color: "var(--coral-2)", fontSize: 15.5 }}>كيف تتم العملية؟</b>
            <div className="kv" style={{ marginTop: 10 }}>
              <div>1️⃣ عبّئ استمارة الطلب بالمعلومات المطلوبة.</div>
              <div>2️⃣ اختر الطور والمادة والأستاذ والتوقيت المناسب.</div>
              <div>3️⃣ احفظ رقم المرجع المقدم بعد الإرسال.</div>
              <div>4️⃣ تابع حالة طلبك من صفحة <b>تتبع طلبك</b> أو انتظر اتصال الجمعية.</div>
            </div>
          </div>
          <div className="card pad card-hover" style={{ marginTop: 14, background: "var(--amber-soft)", borderColor: "#fde68a" }}>
            <b style={{ color: "#92400e" }}>للتذكير</b>
            <p style={{ fontSize: 13, color: "#92400e", marginTop: 6, lineHeight: 1.9 }}>
              يمكنكم زيارة صفحة <Link to="/teachers" style={{ textDecoration: "underline", fontWeight: 700 }}>الأساتذة</Link> للتعرف على كامل التشكيلة قبل التسجيل.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
