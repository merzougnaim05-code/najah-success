import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";

const FEATURES = [
  { ic: "★", t: "أساتذة مؤهلون", s: "خبرة وكفاءة في التدريس" },
  { ic: "👥", t: "جميع الأطوار", s: "ابتدائي · متوسط · ثانوي" },
  { ic: "◎", t: "جميع اللغات", s: "عربية · فرنسية · إنجليزية" },
  { ic: "▣", t: "مختلف المواد", s: "رياضيات · علوم · لغات" },
  { ic: "♥", t: "متابعة مستمرة", s: "تنظيم ومتابعة دورية" },
  { ic: "✓", t: "تتبع الطلبات", s: "تابع حالة طلبك أونلاين" },
];

export default function Home() {
  const { meta } = useApp();

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="ribbon">التسجيل متاح الآن</span>
            <h1>{meta?.site_name || "جمعية النجاح الثقافية"}</h1>
            <p className="tagline">{meta?.tagline || "معًا نحو مستقبل أفضل لأبنائنا"}</p>
            <div className="underline" />
            <p className="lead">
              {meta?.about ||
                "جمعية ثقافية تهتم بتقديم دروس الدعم والتقوية في مختلف المواد واللغات، ولجميع الأطوار: ابتدائي، متوسط، وثانوي."}
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary">
                سجّل الآن في الدروس
              </Link>
              <Link to="/teachers" className="btn btn-outline">
                استكشف الأساتذة
              </Link>
            </div>
          </div>

          <div className="hero-art">
            <div className="halo" />
            <img src="/favicon.svg" alt="شعار الجمعية" className="logo-mark" />
          </div>
        </div>
      </section>

      <div className="container section">
        <div className="pills">
          {FEATURES.map((f) => (
            <div className="pill card-hover" key={f.t}>
              <div className="ic">{f.ic}</div>
              <div>
                <b>{f.t}</b>
                <span>{f.s}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="trust">
          <div className="trust-item">
            <div className="ic">☎</div>
            <div><b>دعم دائم</b><span>على مدار الأسبوع</span></div>
          </div>
          <div className="trust-item">
            <div className="ic">✓</div>
            <div><b>متابعة موثوقة</b><span>لحالة كل طلب</span></div>
          </div>
          <div className="trust-item">
            <div className="ic">🔒</div>
            <div><b>آمن وسهل</b><span>في الاستعمال</span></div>
          </div>
        </div>
      </div>

      <div className="container section">
        <div className="section-head">
          <h2>لماذا جمعية النجاح؟</h2>
          <div className="underline" />
        </div>
        <div className="card pad" style={{ lineHeight: 2, color: "var(--muted)", fontSize: 14.5 }}>
          <p>
            نعمل على توفير فضاء تربوي وثقافي منظم يساعد التلاميذ على تحسين مستواهم، مع إمكانية
            اختيار الطور والمادة والأستاذ والتوقيت، ثم متابعة حالة الطلب عبر منصتنا وبصورة مباشرة
            من إدارة الجمعية. نسعى معًا نحو مستقبل أفضل لأبنائنا.
          </p>
        </div>
      </div>

      <div className="container section">
        <div className="card" style={{ background: "linear-gradient(120deg, var(--maroon-2), var(--maroon))", borderRadius: "var(--r-lg)", padding: 34, textAlign: "center", color: "#fff", position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 6 }}>هل أنت مستعد للانطلاق؟</div>
          <p style={{ color: "#f0d9b8", marginBottom: 18, fontSize: 13.5 }}>
            سجّل طلبك الآن وسيتواصل معك فريق الجمعية خلال وقت قصير.
          </p>
          <Link to="/register" className="btn btn-gold" style={{ margin: "0 auto" }}>
            ابدأ التسجيل الآن
          </Link>
        </div>
      </div>
    </>
  );
}