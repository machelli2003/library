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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="font-display text-3xl font-bold text-ink">Admin Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Platform administration control center, user metrics, and operations logs</p>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading administrative statistics..." />
      ) : (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Users" value={stats?.total_users} />
            <StatCard label="Total Librarians" value={stats?.total_librarians} />
            <StatCard label="Total Books" value={stats?.total_books} />
            <StatCard label="Active Borrows" value={stats?.active_borrows} />
          </div>

          {/* Activities Feed Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-slate-50 pb-4">
              <h2 className="font-display text-xl font-bold text-ink">System Activities Feed</h2>
              <span className="rounded-full bg-indigo-soft px-3 py-1 font-mono text-[10px] font-bold text-indigo uppercase tracking-wider">
                Live Log
              </span>
            </div>

            {activities.length === 0 ? (
              <p className="text-sm text-slate-400 py-12 text-center border border-dashed border-slate-200/80 rounded-2xl bg-slate-50/20">
                No system logs recorded yet.
              </p>
            ) : (
              <div className="flow-root pl-2">
                <ul className="-mb-8">
                  {activities.map((act, actIdx) => {
                    const nameLetter = act.user_name ? act.user_name[0].toUpperCase() : "A";
                    return (
                      <li key={act.id}>
                        <div className="relative pb-8">
                          {actIdx !== activities.length - 1 && (
                            <span className="absolute top-5 left-5 -ml-px h-full w-[2px] bg-slate-100" aria-hidden="true" />
                          )}
                          <div className="relative flex items-start space-x-4">
                            {/* Visual Avatar Pin */}
                            <div>
                              <span className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center ring-8 ring-white text-slate-500 font-bold text-sm shadow-sm transition hover:scale-105">
                                {nameLetter}
                              </span>
                            </div>
                            
                            {/* Log Info */}
                            <div className="flex-1 min-w-0 pt-1.5 flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-2">
                              <div>
                                <p className="text-sm text-slate-600 font-medium">
                                  <span className="font-semibold text-slate-800">{act.user_name}</span>{" "}
                                  <span className="text-slate-500">{act.action}</span>
                                </p>
                              </div>
                              <div className="text-left sm:text-right text-[10px] font-mono font-semibold text-slate-400 whitespace-nowrap">
                                <time dateTime={act.timestamp}>
                                  {new Date(act.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                </time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

