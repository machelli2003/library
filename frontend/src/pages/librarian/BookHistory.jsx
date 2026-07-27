import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { booksApi } from "../../services/api/booksApi";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function BookHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    booksApi
      .history(id)
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error loading book history:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading book borrowing history..." />;
  if (!data) return <p className="text-slate-500 text-center py-12">Book not found.</p>;

  const { book, borrow_records, total_borrows } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 transition"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h1 className="font-display text-3xl font-bold text-ink">Borrowing History</h1>
              <p className="text-sm text-slate-400 mt-1">Transaction log for a specific book</p>
            </div>
          </div>
        </div>
      </div>

      {/* Book Summary Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-ink">{book.title}</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">{book.author}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-100">
                ISBN: {book.isbn || "N/A"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-100">
                Category: {book.category || "General"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-100">
                Total Borrows: {total_borrows}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 font-medium">Available Copies</p>
            <p className="font-display text-2xl font-bold text-ink">{book.available_copies} / {book.quantity}</p>
          </div>
        </div>
      </div>

      {/* Borrow Records Table */}
      {borrow_records.length === 0 ? (
        <EmptyState title="No borrowing history" subtitle="This book has never been borrowed." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase font-bold tracking-wider text-slate-400 bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Borrow Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Return Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Renewed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {borrow_records.map((r) => (
                  <tr key={r.id} className="transition hover:bg-slate-50/30">
                    <td className="px-6 py-4.5 font-semibold text-slate-800">{r.user_name || "—"}</td>
                    <td className="px-6 py-4.5 text-slate-500 font-medium">{r.borrow_date || "—"}</td>
                    <td className="px-6 py-4.5 text-slate-500 font-medium">{r.due_date || "—"}</td>
                    <td className="px-6 py-4.5 text-slate-500 font-medium">{r.return_date || "—"}</td>
                    <td className="px-6 py-4.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${
                        r.renewed
                          ? "bg-amber-50 text-amber border-amber/20"
                          : "bg-slate-50 text-slate-400 border-slate-100"
                      }`}>
                        {r.renewed ? "Yes" : "No"}
                      </span>
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

