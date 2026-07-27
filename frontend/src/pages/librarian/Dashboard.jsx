import { useEffect, useState } from "react";
import { dashboardApi } from "../../services/api/dashboardApi";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3B82F6", "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function LibrarianDashboard() {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardApi.librarian(), dashboardApi.reports()])
      .then(([statsRes, reportsRes]) => {
        setStats(statsRes.data);
        setReports(reportsRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Librarian Dashboard</h1>
        <p className="mt-0.5 text-sm text-slate-400">Library operations and circulation overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pending Requests" value={stats?.pending_requests} sub="Awaiting approval" />
        <StatCard
          label="Overdue Books"
          value={stats?.overdue_books}
          sub="Past return date"
          accent={stats?.overdue_books > 0 ? "text-red-500" : "text-slate-800"}
        />
        <StatCard label="Borrowed This Month" value={stats?.borrowed_this_month} sub="Active circulation" />
        <StatCard label="Active Borrowers" value={stats?.active_borrowers} sub="Unique students" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Monthly Borrow Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-1">Monthly Borrow Activity</p>
          <p className="text-xs text-slate-400 mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={reports?.monthly_activity || []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12 }}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar dataKey="borrows" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Borrows by Category Donut */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-1">By Category</p>
          <p className="text-xs text-slate-400 mb-2">Borrow distribution</p>
          {(reports?.by_category || []).length === 0 ? (
            <div className="flex h-40 items-center justify-center text-xs text-slate-400">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={reports?.by_category || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(reports?.by_category || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Borrowed Books */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Top Borrowed Books
        </p>
        {(reports?.top_books || []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
            <p className="text-sm text-slate-400">No borrow records yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium text-right">Borrows</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(reports?.top_books || []).map((book, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-slate-400 text-xs">{i + 1}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">{book.name}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        {book.borrows}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
