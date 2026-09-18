import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

const LINKS = [
  { to: "/", label: "الرئيسية" },
  { to: "/register", label: "التسجيل" },
  { to: "/teachers", label: "الأساتذة" },
  { to: "/track", label: "تتبع طلبك" },
  { to: "/contact", label: "تواصل معنا" },
  { to: "/laws", label: "القوانين" },
];

export default function Navbar() {
  const { user, meta, logout } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="nav-brand" onClick={() => setOpen(false)}>
          <img src="/favicon.svg" alt="شعار الجمعية" className="mark" />
          <span>{meta?.site_name || "جمعية النجاح الثقافية"}</span>
        </Link>

        <nav className="nav-links">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-cta">
          {user ? (
            <>
              <Link to="/admin" className="btn btn-gold btn-sm">لوحة التحكم</Link>
              <button className="btn btn-ghost btn-sm" onClick={logout}>خروج</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-gold btn-sm">دخول الإدارة</Link>
          )}
        </div>

        <button
          className="nav-burger"
          aria-label="القائمة"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      <nav className={`mobile-menu${open ? " open" : ""}`}>
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            end={l.to === "/"}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </NavLink>
        ))}
        <NavLink
          to={user ? "/admin" : "/login"}
          className="nav-link active"
          onClick={() => setOpen(false)}
        >
          {user ? "لوحة التحكم" : "دخول الإدارة"}
        </NavLink>
      </nav>
    </header>
  );
}