import { useEffect, useState } from "react";
import { dashboardApi } from "../../services/api/dashboardApi";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AuditLogs() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .activities()
      .then((res) => setActivities(res.data))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-400">View recent system activity and user actions for audit and troubleshooting.</p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-10">
            <LoadingSpinner label="Loading audit logs..." />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">No audit records are available yet.</div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-4">When</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(activity.timestamp).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">{activity.user_name || "System"}</td>
                      <td className="px-6 py-4 text-slate-600">{activity.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
