import { useEffect, useState } from "react";
import { borrowApi } from "../../services/api/borrowApi";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function BorrowHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewingId, setRenewingId] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    borrowApi
      .myHistory()
      .then((res) => setRecords(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRenew = async (id) => {
    setError("");
    setRenewingId(id);
    try {
      await borrowApi.renew(id);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not renew this loan");
    } finally {
      setRenewingId(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading borrow history..." />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="font-display text-3xl font-bold text-ink">Borrow History</h1>
        <p className="text-sm text-slate-400 mt-1">Track all checked-out textbooks, due dates, and renewal history</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 text-sm font-medium text-red-700">
          <svg className="h-5 w-5 shrink-0 text-crimson mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {records.length === 0 ? (
        <EmptyState title="No borrow history yet" subtitle="Your requested and active checkouts will be listed here." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase font-bold tracking-wider text-slate-400 bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Borrowed Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Returned Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map((r) => (
                  <tr key={r.id} className="transition hover:bg-slate-50/30">
                    <td className="px-6 py-4.5 font-semibold text-slate-800">{r.book_title}</td>
                    <td className="px-6 py-4.5 text-slate-500 font-medium">{r.borrow_date || "—"}</td>
                    <td className="px-6 py-4.5 text-slate-500 font-medium">{r.due_date || "—"}</td>
                    <td className="px-6 py-4.5 text-slate-500 font-medium">{r.return_date || "—"}</td>
                    <td className="px-6 py-4.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      {r.status === "borrowed" && !r.renewed && (
                        <button
                          onClick={() => handleRenew(r.id)}
                          disabled={renewingId === r.id}
                          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-indigo-soft hover:text-indigo hover:border-indigo/20 disabled:opacity-40"
                        >
                          {renewingId === r.id ? "Renewing..." : "Renew (+7 days)"}
                        </button>
                      )}
                      {r.status === "borrowed" && r.renewed && (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400">
                          Renewed
                        </span>
                      )}
                      {r.status !== "borrowed" && (
                        <span className="text-slate-300 font-medium text-xs">—</span>
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

