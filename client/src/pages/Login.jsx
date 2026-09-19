import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Login() {
  const { user, login, notify } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.username, form.password);
      notify("مرحبًا بك في لوحة التحكم");
      navigate("/admin");
    } catch (err) {
      setError(err.message || "بيانات الدخول غير صحيحة");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page">
      <div className="login-wrap">
        <div className="card form-card">
          <div style={{ textAlign: "center" }}>
            <img src="/favicon.svg" alt="الشعار" style={{ width: 72, height: 72 }} />
            <h2 style={{ marginTop: 8 }}>دخول الإدارة</h2>
            <p className="sub">لمسؤولي جمعية النجاح فقط</p>
          </div>
          {error && <div className="notice" style={{ background: "var(--red-soft)", borderColor: "#f3b9c0", color: "#a3222f" }}>{error}</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label>اسم المستخدم</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoFocus />
            </div>
            <div className="field">
              <label>كلمة المرور</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading} type="submit">
              {loading ? "جارٍ الدخول..." : "دخول"}
            </button>
          </form>
          <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", marginTop: 14 }}>
            الحساب الافتراضي: admin / admin123 — يُنصح بتغييره من الإعدادات.
          </p>
        </div>
      </div>
    </div>
  );
}