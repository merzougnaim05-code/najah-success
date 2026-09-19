import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Footer() {
  const { meta } = useApp();
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>{meta?.site_name || "جمعية النجاح"}</h4>
          <p>{meta?.about || ""}</p>
        </div>
        <div>
          <h4>روابط سريعة</h4>
          <div className="footer-links">
            <Link to="/register">التسجيل في الدروس</Link>
            <Link to="/teachers">قائمة الأساتذة</Link>
            <Link to="/track">تتبع حالة الطلب</Link>
            <Link to="/laws">القانون الأساسي والداخلي</Link>
          </div>
        </div>
        <div>
          <h4>تواصل معنا</h4>
          <p>الهاتف: {meta?.phone || "-"}</p>
          <p>البريد: {meta?.email || "-"}</p>
          <p>العنوان: {meta?.address || "-"}</p>
        </div>
      </div>
      <div className="footer-bottom">
        جميع الحقوق محفوظة © {new Date().getFullYear()} {meta?.site_name || "جمعية النجاح"} — {meta?.tagline || ""}
      </div>
    </footer>
  );
}