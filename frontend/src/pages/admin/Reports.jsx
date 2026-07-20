import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { dashboardApi } from "../../services/api/dashboardApi";
import LoadingSpinner from "../../components/LoadingSpinner";

const COLORS = ["#0f172a", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi
      .reports()
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error loading reports:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!data) return <p className="text-slate-500">Could not load analytics. Please try again.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">System Reports & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time charts and revenue reporting statistics.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Fines Collected</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">GHS {data.total_fine_collected.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Outstanding Fines</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">GHS {data.total_fine_outstanding.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Most Popular Genre</p>
          <p className="mt-2 text-lg font-bold text-slate-800">
            {data.by_category.length > 0
              ? [...data.by_category].sort((a, b) => b.value - a.value)[0]?.name
              : "N/A"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Transactions</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {data.monthly_activity.reduce((sum, item) => sum + item.borrows, 0)}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Activity */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800">Borrowing Trends (Last 6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_activity}>
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="borrows" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorBorrows)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Books */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800">Top 5 Borrowed Books</h3>
          <div className="h-72">
            {data.top_books.length === 0 ? (
              <p className="text-center text-sm text-slate-400 pt-28">No borrow data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_books} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={120} />
                  <Tooltip />
                  <Bar dataKey="borrows" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800">Borrow Distribution by Category</h3>
          <div className="h-72">
            {data.by_category.length === 0 ? (
              <p className="text-center text-sm text-slate-400 pt-28">No category data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.by_category}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Fine metrics */}
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-slate-800">Fines Recovery Status (GHS)</h3>
          <div className="h-72">
            {data.total_fine_collected === 0 && data.total_fine_outstanding === 0 ? (
              <p className="text-center text-sm text-slate-400 pt-28">No fines data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.fine_metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]}>
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
