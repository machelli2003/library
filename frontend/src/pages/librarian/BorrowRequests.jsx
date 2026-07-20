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

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Borrow Requests</h1>

      {records.length === 0 ? (
        <EmptyState title="No pending requests" subtitle="You're all caught up" />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Book</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-700">{r.user_name}</td>
                  <td className="px-5 py-3 text-slate-500">{r.book_title}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => act(borrowApi.approve, r.id)}
                      disabled={actingOn === r.id}
                      className="mr-3 text-emerald-600 hover:underline disabled:opacity-40"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => act(borrowApi.reject, r.id)}
                      disabled={actingOn === r.id}
                      className="text-red-500 hover:underline disabled:opacity-40"
                    >
                      Reject
                    </button>
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
