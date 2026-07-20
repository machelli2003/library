import { useEffect, useState } from "react";
import { borrowApi } from "../../services/api/borrowApi";
import StatusBadge from "../../components/StatusBadge";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

export default function ActiveLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actingOn, setActingOn] = useState(null);

  const load = () => {
    setLoading(true);
    borrowApi
      .activeLoans()
      .then((res) => setLoans(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleReturn = async (id) => {
    setActingOn(id);
    try {
      await borrowApi.return(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record return");
    } finally {
      setActingOn(null);
    }
  };

  const filteredLoans = loans.filter((l) => {
    const q = searchQuery.toLowerCase();
    return (
      l.user_name?.toLowerCase().includes(q) ||
      l.book_title?.toLowerCase().includes(q) ||
      l.status?.toLowerCase().includes(q)
    );
  });

  if (loading) return <LoadingSpinner label="Loading active loan registry..." />;

  return (
    <div className="space-y-6">
      {/* Page Header and Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Active Loans & Returns</h1>
          <p className="text-sm text-slate-400 mt-1">Track active checkouts, overdue dates, and record library returns</p>
        </div>
        
        {/* Search filter block */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by student or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 transition shadow-sm placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
          />
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
        </div>
      </div>

      {filteredLoans.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matching active loans" : "No active loans"}
          subtitle={searchQuery ? "Try checking your spelling or search queries." : "All borrowed books are returned."}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase font-bold tracking-wider text-slate-400 bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Borrow Date</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLoans.map((l) => {
                  const isOverdue = l.status === "overdue";
                  return (
                    <tr
                      key={l.id}
                      className={`transition hover:bg-slate-50/30 ${
                        isOverdue ? "bg-red-50/10 hover:bg-red-50/20" : ""
                      }`}
                    >
                      <td className="px-6 py-4.5 font-semibold text-slate-800">
                        {l.user_name}
                      </td>
                      <td className="px-6 py-4.5 text-slate-600 font-medium">{l.book_title}</td>
                      <td className="px-6 py-4.5 text-slate-500 font-medium">{l.borrow_date || "—"}</td>
                      <td
                        className={`px-6 py-4.5 font-semibold ${
                          isOverdue ? "text-crimson" : "text-slate-500"
                        }`}
                      >
                        {l.due_date || "—"}
                      </td>
                      <td className="px-6 py-4.5">
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <button
                          onClick={() => handleReturn(l.id)}
                          disabled={actingOn === l.id}
                          className="inline-flex items-center justify-center rounded-lg border border-indigo/20 bg-white px-3.5 py-1.5 text-xs font-semibold text-indigo shadow-sm hover:bg-indigo-soft hover:border-indigo/30 disabled:opacity-40"
                        >
                          {actingOn === l.id ? "Processing..." : "Record Return"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

