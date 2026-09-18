import { useState } from "react";
import { api } from "../api";
import { useApp } from "../context/AppContext";
import Badge from "../components/Badge";

export default function Track() {
  const { notify } = useApp();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [done, setDone] = useState(false);

  async function search(e) {
    e?.preventDefault();
    if (!/^[\d\s+-]{6,20}$/.test(phone.trim())) {
      notify("أدخل رقم هاتف صحيح", "err");
      return;
    }
    setLoading(true);
    setDone(true);
    try {
      setResults(await api.get("/api/requests/track?phone=" + encodeURIComponent(phone.trim())));
    } catch (err) {
      notify(err.message || "حدث خطأ", "err");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page">
      <div className="section-head" style={{ textAlign: "center", maxWidth: 620, margin: "0 auto 22px" }}>
        <h2>تتبع حالة طلبك</h2>
        <div className="underline" style={{ margin: "10px auto 14px" }} />
        <p>أدخل رقم الهاتف الذي سجلت به لعرض حالة جميع طلباتك لدى الجمعية</p>
      </div>

      <form className="card form-card" style={{ maxWidth: 520, margin: "0 auto" }} onSubmit={search}>
        <div className="field">
          <label>رقم الهاتف</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="مثال: 0555 12 34 56"
            inputMode="tel"
            dir="ltr"
            style={{ textAlign: "right" }}
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading} type="submit">
          {loading ? "جارٍ البحث..." : "تتبع الطلب"}
        </button>
      </form>

      {done && !loading && (
        <div className="container" style={{ maxWidth: 720, marginTop: 22 }}>
          {results && results.length ? (
            <div style={{ display: "grid", gap: 12 }}>
              {results.map((r) => (
                <div className="card track-card" key={r.ref}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 5 }}>
                      <span className="ref">{r.ref}</span>
                      <Badge status={r.status} />
                    </div>
                    <div className="meta">
                      {r.name} · {r.level} · {r.subject} · {r.teacher}
                    </div>
                    <div className="meta">التوقيت: {r.time_slot || "يحدد لاحقًا"} {r.time_slot && "·"} أرسل في: {r.created_at}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              لا توجد طلبات مطابقة لهذا الرقم.
              <div style={{ marginTop: 10 }}><a href="/register" className="btn btn-gold btn-sm">سجّل الآن</a></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}