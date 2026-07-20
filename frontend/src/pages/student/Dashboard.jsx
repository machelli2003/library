import { useEffect, useState } from "react";
import { dashboardApi } from "../../services/api/dashboardApi";
import { borrowApi } from "../../services/api/borrowApi";
import { reservationsApi } from "../../services/api/reservationsApi";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [dueSoonItems, setDueSoonItems] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const loadData = () => {
    Promise.all([
      dashboardApi.student(),
      borrowApi.myHistory(),
      reservationsApi.my(),
    ])
      .then(([statsRes, historyRes, reservationsRes]) => {
        setStats(statsRes.data);
        setReservations(reservationsRes.data);

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() + 2);

        const dueSoon = historyRes.data.filter((r) => {
          if (r.status !== "borrowed" || !r.due_date) return false;
          return new Date(r.due_date) <= cutoff;
        });
        setDueSoonItems(dueSoon);
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const handleCancelReservation = async (id) => {
    setCancellingId(id);
    try {
      await reservationsApi.cancel(id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel reservation");
    } finally {
      setCancellingId(null);
    }
  };

  const activeReservations = reservations.filter((r) => r.status === "pending");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">
        Welcome back, {user?.name}
      </h1>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {dueSoonItems.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="font-medium text-amber-800">
                {dueSoonItems.length === 1
                  ? "You have a book due soon:"
                  : `You have ${dueSoonItems.length} books due soon:`}
              </p>
              <ul className="mt-2 space-y-1 text-sm text-amber-700">
                {dueSoonItems.map((item) => (
                  <li key={item.id}>
                    {item.book_title} — due {item.due_date}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Books Borrowed" value={stats?.books_borrowed} />
            <StatCard label="Due Soon" value={stats?.due_soon} />
            <StatCard label="Outstanding Fines" value={stats?.outstanding_fines} />
            <StatCard label="Active Holds" value={activeReservations.length} />
          </div>

          {/* Active Reservations section */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">My Active Reservations / Holds</h2>
            {activeReservations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-white">
                <p className="text-sm text-slate-400">You don't have any pending reservations</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-100 text-slate-500 bg-slate-50">
                    <tr>
                      <th className="px-5 py-3">Book Title</th>
                      <th className="px-5 py-3">Author</th>
                      <th className="px-5 py-3">Reserved On</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReservations.map((r) => (
                      <tr key={r.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-5 py-3 font-medium text-slate-700">{r.book_title}</td>
                        <td className="px-5 py-3 text-slate-500">{r.book_author}</td>
                        <td className="px-5 py-3 text-xs text-slate-400">
                          {new Date(r.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleCancelReservation(r.id)}
                            disabled={cancellingId === r.id}
                            className="rounded-md border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                          >
                            Cancel Hold
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
