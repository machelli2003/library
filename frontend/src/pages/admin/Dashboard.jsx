import { useEffect, useState } from "react";
import { dashboardApi } from "../../services/api/dashboardApi";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardApi.admin(), dashboardApi.activities()])
      .then(([statsRes, actRes]) => {
        setStats(statsRes.data);
        setActivities(actRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Platform-wide metrics and activity log.</p>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats?.total_users} sub="Registered accounts" />
        <StatCard label="Librarians" value={stats?.total_librarians} sub="Staff members" />
        <StatCard label="Total Books" value={stats?.total_books} sub="In catalogue" />
        <StatCard label="Active Borrows" value={stats?.active_borrows} sub="Currently checked out" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="New Users" value={stats?.new_users_this_month ?? 0} sub="This month" />
        <StatCard label="New Books" value={stats?.new_books_this_month ?? 0} sub="This month" />
        <StatCard
          label="Fines Collected"
          value={`GHS ${(stats?.total_fine_collected || 0).toFixed(2)}`}
          sub="Total processed"
        />
        <StatCard
          label="Fines Outstanding"
          value={`GHS ${(stats?.total_fine_outstanding || 0).toFixed(2)}`}
          sub="Unpaid balances"
        />
      </div>

      {/* Activity Feed */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">
          Recent Activity
        </h2>

        {activities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
            <p className="text-sm text-slate-400">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
            <ul className="divide-y divide-slate-50">
              {activities.map((act) => (
                <li key={act.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                  <div>
                    <span className="text-sm font-medium text-slate-700">{act.user_name}</span>
                    <span className="text-sm text-slate-400"> — {act.action}</span>
                  </div>
                  <time className="shrink-0 ml-4 text-xs text-slate-400">
                    {new Date(act.timestamp).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

    </div>
  );
}
