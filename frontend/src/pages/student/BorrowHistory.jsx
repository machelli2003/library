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

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">
        Borrow History
      </h1>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {records.length === 0 ? (
        <EmptyState title="No borrow history yet" subtitle="Requests you make will show up here" />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-5 py-3">Book</th>
                <th className="px-5 py-3">Borrowed</th>
                <th className="px-5 py-3">Due</th>
                <th className="px-5 py-3">Returned</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-5 py-3 font-medium text-slate-700">{r.book_title}</td>
                  <td className="px-5 py-3 text-slate-500">{r.borrow_date || "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{r.due_date || "—"}</td>
                  <td className="px-5 py-3 text-slate-500">{r.return_date || "—"}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-5 py-3 text-right">
                    {r.status === "borrowed" && !r.renewed && (
                      <button
                        onClick={() => handleRenew(r.id)}
                        disabled={renewingId === r.id}
                        className="text-slate-600 hover:underline disabled:opacity-40"
                      >
                        Renew (+7 days)
                      </button>
                    )}
                    {r.status === "borrowed" && r.renewed && (
                      <span className="text-xs text-slate-400">Already renewed</span>
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
