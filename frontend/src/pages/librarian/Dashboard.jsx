import { useEffect, useState } from "react";
import { dashboardApi } from "../../services/api/dashboardApi";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function LibrarianDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .librarian()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-800">Librarian Dashboard</h1>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pending Requests" value={stats?.pending_requests} />
          <StatCard label="Overdue Books" value={stats?.overdue_books} />
          <StatCard label="Total Books" value={stats?.total_books} />
          <StatCard label="Unpaid Fines" value={stats?.unpaid_fines} />
        </div>
      )}
    </div>
  );
}
