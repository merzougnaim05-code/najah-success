import { useEffect } from "react";

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal open" onClick={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal-card">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="close" onClick={onClose} aria-label="إغلاق">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}