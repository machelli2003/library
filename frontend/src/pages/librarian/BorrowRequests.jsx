import { useEffect, useState } from "react";
import { borrowApi } from "../../services/api/borrowApi";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function BorrowRequests() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState(null);

  const load = () => {
    setLoading(true);
    borrowApi
      .pendingRequests()
      .then((res) => setRecords(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const act = async (fn, id) => {
    setActingOn(id);
    try {
      await fn(id);
      load();
    } finally {
      setActingOn(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading borrow requests..." />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="font-display text-3xl font-bold text-ink">Borrow Requests</h1>
        <p className="text-sm text-slate-400 mt-1">Review, approve, or reject student requests to check out textbooks</p>
      </div>

      {records.length === 0 ? (
        <EmptyState title="No pending requests" subtitle="You are all caught up! Student borrow requests will appear here." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase font-bold tracking-wider text-slate-400 bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.map((r) => (
                  <tr key={r.id} className="transition hover:bg-slate-50/30">
                    <td className="px-6 py-4.5 font-semibold text-slate-800">{r.user_name}</td>
                    <td className="px-6 py-4.5 text-slate-500 font-medium">{r.book_title}</td>
                    <td className="px-6 py-4.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-4.5 text-right space-x-3">
                      <button
                        onClick={() => act(borrowApi.approve, r.id)}
                        disabled={actingOn === r.id}
                        className="inline-flex items-center justify-center rounded-lg border border-emerald-100 bg-white px-3 py-1.5 text-xs font-semibold text-emerald transition hover:bg-emerald-50 disabled:opacity-40"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => act(borrowApi.reject, r.id)}
                        disabled={actingOn === r.id}
                        className="inline-flex items-center justify-center rounded-lg border border-red-100 bg-white px-3 py-1.5 text-xs font-semibold text-crimson transition hover:bg-red-50 disabled:opacity-40"
                      >
                        Reject
                      </button>
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

