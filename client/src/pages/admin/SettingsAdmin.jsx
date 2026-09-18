import { useEffect, useState } from "react";
import { api } from "../../api";
import { useApp } from "../../context/AppContext";

export default function SettingsAdmin() {
  const { notify, meta } = useApp();
  const [s, setS] = useState(null);
  const [pw, setPw] = useState({ old: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/api/admin/settings").then(setS).catch((e) => notify(e.message, "err"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function parseTimes(t) {
    return t.split("\n").map((x) => x.trim()).filter(Boolean).join("\n");
  }
  function timesToArray(t) {
    return t.split("\n").map((x) => x.trim()).filter(Boolean);
  }

  async function save() {
    setSaving(true);
    try {
      const body = { ...s, times: JSON.stringify(timesToArray(s.times)) };
      await api.put("/api/admin/settings", body);
      notify("تم حفظ الإعدادات بنجاح");
    } catch (e) {
      notify(e.message || "خطأ", "err");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (pw.next !== pw.confirm) { notify("كلمتا المرور غير متطابقتين", "err"); return; }
    if (pw.next.length < 6) { notify("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "err"); return; }
    try {
      await api.post("/api/auth/change-password", { oldPassword: pw.old, newPassword: pw.next });
      notify("تم تغيير كلمة المرور بنجاح");
      setPw({ old: "", next: "", confirm: "" });
    } catch (e) {
      notify(e.message || "خطأ", "err");
    }
  }

  if (!s) return <div className="loading-page"><div className="spinner" /></div>;

  const field = (label, key, hint) => (
    <div className="field">
      <label>{label}</label>
      <input value={s[key] || ""} onChange={(e) => setS({ ...s, [key]: e.target.value })} placeholder={hint} />
    </div>
  );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div className="card form-card">
        <h3>⚙️ إعدادات الجمعية</h3>
        <p className="sub">تُعرض هذه المعلومات في الواجهة العامة للموقع</p>
        <div className="row2">
          {field("اسم الجمعية", "site_name", meta?.site_name)}
          {field("الشعار النصي (tagline)", "tagline", meta?.tagline)}
        </div>
        <div className="field">
          <label>نبذة عن الجمعية</label>
          <textarea value={s.about || ""} onChange={(e) => setS({ ...s, about: e.target.value })} />
        </div>
        <div className="row2">
          {field("رقم الهاتف", "phone", meta?.phone)}
          {field("البريد الإلكتروني", "email", meta?.email)}
        </div>
        <div className="row2">
          {field("العنوان", "address", meta?.address)}
          {field("بريد إشعارات الطلبات (FormSubmit)", "notify_email", meta?.email)}
        </div>
        <div className="field">
          <label>فترات التوقيت المتاحة (كل فترة في سطر)</label>
          <textarea value={s.times ? parseTimes(JSON.parse(s.times || "[]").join("\n")) : ""} onChange={(e) => setS({ ...s, times: JSON.stringify(timesToArray(e.target.value)) })} style={{ minHeight: 90 }} />
        </div>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>

      <div className="card form-card">
        <h3>🔑 تغيير كلمة المرور</h3>
        <p className="sub">الحساب الحالي: admin</p>
        <div className="field">
          <label>كلمة المرور الحالية</label>
          <input type="password" value={pw.old} onChange={(e) => setPw({ ...pw, old: e.target.value })} />
        </div>
        <div className="row2">
          <div className="field">
            <label>كلمة المرور الجديدة</label>
            <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          </div>
          <div className="field">
            <label>تأكيد كلمة المرور</label>
            <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </div>
        </div>
        <button className="btn btn-gold" onClick={changePassword}>تغيير كلمة المرور</button>
      </div>
    </div>
  );
}