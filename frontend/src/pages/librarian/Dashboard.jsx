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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="font-display text-3xl font-bold text-ink">Librarian Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">System-wide monitoring of requests, book stock, overdue counts, and outstanding balances</p>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading system statistics..." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Pending Requests" value={stats?.pending_requests} />
          <StatCard label="Overdue Books" value={stats?.overdue_books} />
          <StatCard label="Total Books" value={stats?.total_books} />
          <StatCard label="Unpaid Fines" value={stats?.unpaid_fines !== undefined ? `GHS ${stats.unpaid_fines.toFixed(2)}` : undefined} />
        </div>
      )}
    </div>
  );
}

