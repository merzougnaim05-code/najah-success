export default function Badge({ status }) {
  if (status === "مقبول") return <span className="badge b-ok">مقبول</span>;
  if (status === "مرفوض") return <span className="badge b-no">مرفوض</span>;
  return <span className="badge b-wait">في انتظار الرد</span>;
}