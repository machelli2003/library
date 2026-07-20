import { useEffect, useState } from "react";
import { finesApi } from "../../services/api/finesApi";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function StudentFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    finesApi
      .myFines()
      .then((res) => setFines(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalUnpaid = fines
    .filter((f) => f.status === "unpaid")
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-slate-800">Fines</h1>
      <p className="mb-6 text-sm text-slate-500">
        Outstanding balance:{" "}
        <span className="font-semibold text-red-600">GHS {totalUnpaid.toFixed(2)}</span>
      </p>

      {fines.length === 0 ? (
        <EmptyState title="No fines" subtitle="Return books on time to keep it that way" />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-5 py-3">Book</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Paid At</th>
              </tr>
            </thead>
            <tbody>
              {fines.map((f) => (
                <tr key={f.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-700">{f.book_title || "—"}</td>
                  <td className="px-5 py-3 text-slate-700">GHS {f.amount.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {f.paid_at ? new Date(f.paid_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
