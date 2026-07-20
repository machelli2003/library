const STAMP_COLORS = {
  pending: "text-amber",
  approved: "text-sky",
  rejected: "text-crimson",
  borrowed: "text-sky",
  returned: "text-emerald",
  overdue: "text-crimson",
  unpaid: "text-crimson",
  paid: "text-emerald",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`stamp ${STAMP_COLORS[status] || "text-ink"}`}>
      {status}
    </span>
  );
}