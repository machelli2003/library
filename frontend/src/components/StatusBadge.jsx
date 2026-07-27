import { Badge } from "./ui/badge";

const STATUS_MAP = {
  pending:  { variant: "pending",  dot: true },
  approved: { variant: "approved", dot: true },
  rejected: { variant: "rejected", dot: true },
  borrowed: { variant: "borrowed", dot: true },
  returned: { variant: "returned", dot: true },
  overdue:  { variant: "overdue",  dot: true },
  unpaid:   { variant: "unpaid",   dot: true },
  paid:     { variant: "paid",     dot: true },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status?.toLowerCase()] || { variant: "outline", dot: false };
  return (
    <Badge variant={config.variant} dot={config.dot}>
      {status}
    </Badge>
  );
}