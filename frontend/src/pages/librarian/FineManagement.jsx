import { useEffect, useState } from "react";
import { finesApi } from "../../services/api/finesApi";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function FineManagement() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");

  const load = () => {
    setLoading(true);
    finesApi
      .all()
      .then((res) => setFines(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const markPaid = async (id) => {
    setPayingId(id);
    try {
      await finesApi.markPaid(id);
      load();
    } finally {
      setPayingId(null);
    }
  };

  const displayed = filterStatus
    ? fines.filter((f) => f.status === filterStatus)
    : fines;

  const totalUnpaid = fines
    .filter((f) => f.status === "unpaid")
    .reduce((sum, f) => sum + f.amount, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Fine Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Total outstanding:{" "}
            <span className="font-semibold text-red-600">GHS {totalUnpaid.toFixed(2)}</span>
          </p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">All fines</option>
          <option value="unpaid">Unpaid</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {displayed.length === 0 ? (
        <EmptyState title="No fines recorded" />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Book</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Paid At</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((f) => (
                <tr key={f.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-700">{f.user_name || "—"}</p>
                    <p className="text-xs text-slate-400">{f.user_email || ""}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">{f.book_title || "—"}</td>
                  <td className="px-5 py-3 font-medium text-slate-700">
                    GHS {f.amount.toFixed(2)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">
                    {f.paid_at ? new Date(f.paid_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {f.status === "unpaid" && (
                      <button
                        onClick={() => markPaid(f.id)}
                        disabled={payingId === f.id}
                        className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-40"
                      >
                        Mark Paid
                      </button>
                    )}
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
