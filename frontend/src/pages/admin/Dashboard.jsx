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
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Admin Dashboard</h1>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Users" value={stats?.total_users} />
            <StatCard label="Total Librarians" value={stats?.total_librarians} />
            <StatCard label="Total Books" value={stats?.total_books} />
            <StatCard label="Active Borrows" value={stats?.active_borrows} />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">System Activities Feed</h2>
            {activities.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center border border-dashed border-slate-200 rounded-lg">
                No activities recorded yet.
              </p>
            ) : (
              <div className="flow-root">
                <ul className="-mb-8">
                  {activities.map((act, actIdx) => (
                    <li key={act.id}>
                      <div className="relative pb-8">
                        {actIdx !== activities.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-4">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center ring-8 ring-white text-slate-400 font-bold text-sm">
                              💡
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-slate-600">
                                <span className="font-semibold text-slate-800">{act.user_name}</span>{" "}
                                {act.action}
                              </p>
                            </div>
                            <div className="text-right text-xs whitespace-nowrap text-slate-400">
                              <time dateTime={act.timestamp}>
                                {new Date(act.timestamp).toLocaleString()}
                              </time>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
