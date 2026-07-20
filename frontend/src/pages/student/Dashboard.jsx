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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="pb-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Welcome back, {user?.name || "Student"}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-400 leading-relaxed">
          Manage your borrowed course materials, pending reservations, and library fines directly from your student portal dashboard.
        </p>
      </div>


      {loading ? (
        <LoadingSpinner label="Loading dashboard data..." />
      ) : (
        <>
          {/* Due Soon Alerts Banner */}
          {dueSoonItems.length > 0 && (
            <div className="rounded-2xl border border-amber-200/60 bg-amber-50/70 backdrop-blur-sm p-5 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-amber-900 text-sm">
                  {dueSoonItems.length === 1
                    ? "You have a textbook due soon!"
                    : `You have ${dueSoonItems.length} textbooks due soon!`}
                </p>
                <ul className="space-y-1.5 text-sm text-amber-800/95 font-medium list-disc list-inside">
                  {dueSoonItems.map((item) => (
                    <li key={item.id}>
                      <span className="font-bold">{item.book_title}</span> — due by <span className="underline">{item.due_date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Books Borrowed" value={stats?.books_borrowed} />
            <StatCard label="Due Soon" value={stats?.due_soon} />
            <StatCard label="Outstanding Fines" value={stats?.outstanding_fines !== undefined ? `GHS ${stats.outstanding_fines.toFixed(2)}` : undefined} />
            <StatCard label="Active Holds" value={activeReservations.length} />
          </div>

          {/* Active Reservations section */}
          <div className="pt-4">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold tracking-tight text-ink">
                My Active Reservations & Holds
              </h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {activeReservations.length} active
              </span>
            </div>
            
            {activeReservations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/40 backdrop-blur-sm p-12 text-center">
                <p className="font-display text-base font-semibold text-slate-600">No active reservations</p>
                <p className="mt-1 text-sm text-slate-400">Search the catalogue to reserve books out of stock.</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 text-xs uppercase font-bold tracking-wider text-slate-400 bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4">Book Title</th>
                        <th className="px-6 py-4">Author</th>
                        <th className="px-6 py-4">Reserved On</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {activeReservations.map((r) => (
                        <tr key={r.id} className="transition hover:bg-slate-50/30">
                          <td className="px-6 py-4.5 font-semibold text-slate-800">{r.book_title}</td>
                          <td className="px-6 py-4.5 text-slate-500 font-medium">{r.book_author}</td>
                          <td className="px-6 py-4.5 font-mono text-xs text-slate-400">
                            {new Date(r.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </td>
                          <td className="px-6 py-4.5 text-right">
                            <button
                              onClick={() => handleCancelReservation(r.id)}
                              disabled={cancellingId === r.id}
                              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-red-50 hover:text-crimson hover:border-red-100 disabled:opacity-40"
                            >
                              {cancellingId === r.id ? "Cancelling..." : "Cancel Hold"}
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
        </>
      )}
    </div>
  );
}

