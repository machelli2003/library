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

  if (loading) return <LoadingSpinner label="Loading fine records..." />;

  const totalUnpaid = fines
    .filter((f) => f.status === "unpaid")
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header and Balance Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Fines & Penalties</h1>
          <p className="text-sm text-slate-400 mt-1">Review outstanding unpaid balances and past transaction histories</p>
        </div>
        
        {/* Balance Badge Container */}
        <div className="rounded-xl border border-red-100 bg-red-50/50 px-5 py-3 text-sm flex items-center gap-3 self-start sm:self-auto shadow-sm shadow-red-100/10">
          <span className="flex h-2.5 w-2.5 rounded-full bg-crimson animate-pulse" />
          <span className="font-semibold text-slate-600">Outstanding Fines:</span>
          <span className="font-display text-base font-bold text-crimson">GHS {totalUnpaid.toFixed(2)}</span>
        </div>
      </div>

      {fines.length === 0 ? (
        <EmptyState title="No fines recorded" subtitle="Congratulations! You have kept your account in good standing." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase font-bold tracking-wider text-slate-400 bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Penalty Amount</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4">Paid On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {fines.map((f) => (
                  <tr key={f.id} className="transition hover:bg-slate-50/30">
                    <td className="px-6 py-4.5 font-semibold text-slate-800">{f.book_title || "—"}</td>
                    <td className="px-6 py-4.5 text-slate-700 font-semibold">GHS {f.amount.toFixed(2)}</td>
                    <td className="px-6 py-4.5">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="px-6 py-4.5 font-mono text-xs text-slate-400">
                      {f.paid_at ? new Date(f.paid_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "—"}
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

