const STYLES = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-blue-50 text-blue-700",
  rejected: "bg-red-50 text-red-700",
  borrowed: "bg-blue-50 text-blue-700",
  returned: "bg-emerald-50 text-emerald-700",
  overdue: "bg-red-50 text-red-700",
  unpaid: "bg-red-50 text-red-700",
  paid: "bg-emerald-50 text-emerald-700",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        STYLES[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}
