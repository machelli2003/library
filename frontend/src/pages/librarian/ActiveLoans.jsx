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

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold text-slate-800">Active Loans & Returns</h1>
        <input
          type="text"
          placeholder="Search by student or book title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {filteredLoans.length === 0 ? (
        <EmptyState
          title={searchQuery ? "No matching active loans" : "No active loans"}
          subtitle={searchQuery ? "Try a different search query" : "All borrowed books are returned"}
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500 bg-slate-50/50">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Book Title</th>
                <th className="px-5 py-3">Borrow Date</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((l) => {
                const isOverdue = l.status === "overdue";
                return (
                  <tr
                    key={l.id}
                    className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/30 ${
                      isOverdue ? "bg-red-50/20" : ""
                    }`}
                  >
                    <td className="px-5 py-4 font-medium text-slate-700">
                      {l.user_name}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{l.book_title}</td>
                    <td className="px-5 py-4 text-slate-500">{l.borrow_date || "N/A"}</td>
                    <td
                      className={`px-5 py-4 font-medium ${
                        isOverdue ? "text-red-600" : "text-slate-500"
                      }`}
                    >
                      {l.due_date || "N/A"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleReturn(l.id)}
                        disabled={actingOn === l.id}
                        className="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-40"
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
      )}
    </div>
  );
}
