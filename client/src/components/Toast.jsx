import { useApp } from "../context/AppContext";

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className={`toast show toast-${toast.type === "err" ? "err" : "ok"}`} role="alert">
      {toast.msg}
    </div>
  );
}