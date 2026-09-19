import { NavLink, Outlet } from "react-router-dom";
import { useApp } from "../../context/AppContext";

const NAV = [
  { to: "/admin", label: "☷ الطلبات", end: true },
  { to: "/admin/teachers", label: "👥 الأساتذة", end: false },
  { to: "/admin/messages", label: "✉️ الرسائل", end: false },
  { to: "/admin/settings", label: "⚙️ الإعدادات", end: false },
];

export default function AdminLayout() {
  const { user, logout, meta } = useApp();

  return (
    <div className="container page">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <h2 style={{ color: "var(--violet)", fontWeight: 900, fontSize: 23 }}>لوحة تحكم {meta?.site_name || "الجمعية"}</h2>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>مرحبًا، {user?.username}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/" className="btn btn-outline btn-sm">العودة للموقع</a>
          <button className="btn btn-ghost btn-sm" onClick={logout}>خروج</button>
        </div>
      </div>

      <div className="admin-layout">
        <aside className="sidebar">
          <h3>لوحة الإدارة</h3>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `sidebtn${isActive ? " active" : ""}`}>
              {n.label}
            </NavLink>
          ))}
        </aside>

        <div style={{ minWidth: 0 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}