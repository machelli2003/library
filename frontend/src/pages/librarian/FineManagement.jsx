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

  if (loading) return <LoadingSpinner label="Loading system fine records..." />;

  return (
    <div className="space-y-6">
      {/* Page Header and Balance Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Fine Management</h1>
          <p className="text-sm text-slate-400 mt-1">Review outstanding system fines, filter listings, and register payments</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Unpaid fines summary badge */}
          <div className="rounded-xl border border-red-100 bg-red-50/50 px-4 py-2.5 text-xs flex items-center gap-2.5 shadow-sm shadow-red-100/10 shrink-0">
            <span className="flex h-2 w-2 rounded-full bg-crimson animate-pulse" />
            <span className="font-semibold text-slate-600">Outstanding:</span>
            <span className="font-display font-bold text-crimson">GHS {totalUnpaid.toFixed(2)}</span>
          </div>

          {/* Filter Status Selector */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none appearance-none"
            >
              <option value="">All Fines</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {displayed.length === 0 ? (
        <EmptyState title="No fines recorded" subtitle="There are no fines matching the selected filter status." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase font-bold tracking-wider text-slate-400 bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Fine Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Paid On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayed.map((f) => (
                  <tr key={f.id} className="transition hover:bg-slate-50/30">
                    <td className="px-6 py-4.5">
                      <p className="font-semibold text-slate-800">{f.user_name || "—"}</p>
                      <p className="text-xs text-slate-400 font-medium">{f.user_email || ""}</p>
                    </td>
                    <td className="px-6 py-4.5 text-slate-600 font-medium">{f.book_title || "—"}</td>
                    <td className="px-6 py-4.5 text-slate-700 font-semibold">GHS {f.amount.toFixed(2)}</td>
                    <td className="px-6 py-4.5">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="px-6 py-4.5 font-mono text-xs text-slate-400">
                      {f.paid_at ? new Date(f.paid_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "—"}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      {f.status === "unpaid" && (
                        <button
                          onClick={() => markPaid(f.id)}
                          disabled={payingId === f.id}
                          className="inline-flex items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50/20 px-3.5 py-1.5 text-xs font-semibold text-emerald transition hover:bg-emerald-50 disabled:opacity-40"
                        >
                          {payingId === f.id ? "Saving..." : "Mark Paid"}
                        </button>
                      )}
                      {f.status === "paid" && (
                        <span className="text-xs text-slate-300 font-medium">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

