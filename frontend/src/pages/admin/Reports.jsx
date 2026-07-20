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

// Brand-aligned chart palette
const COLORS = ["#5B5FEF", "#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

// Custom tooltip styling
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-lg text-sm">
        {label && <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>}
        {payload.map((p, i) => (
          <p key={i} className="font-semibold" style={{ color: p.color }}>
            {p.name}: {typeof p.value === "number" && p.name?.toLowerCase().includes("ghs") ? `GHS ${p.value.toFixed(2)}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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

  if (loading) return <LoadingSpinner label="Compiling system analytics..." />;
  if (!data) return (
    <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-600">
      Could not load analytics data. Please refresh and try again.
    </div>
  );

  const topCategory =
    data.by_category.length > 0
      ? [...data.by_category].sort((a, b) => b.value - a.value)[0]?.name
      : "N/A";

  const totalTransactions = data.monthly_activity.reduce((sum, item) => sum + item.borrows, 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="font-display text-3xl font-bold text-ink">System Reports & Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time borrowing trends, revenue tracking, and category distribution insights</p>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Fines Collected */}
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Fines Collected</p>
          <p className="mt-3 font-display text-2xl font-bold text-emerald">GHS {data.total_fine_collected.toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Recovered fine revenue</p>
        </div>

        {/* Outstanding Fines */}
        <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Outstanding Fines</p>
          <p className="mt-3 font-display text-2xl font-bold text-amber">GHS {data.total_fine_outstanding.toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Pending collections</p>
        </div>

        {/* Most Popular Genre */}
        <div className="rounded-2xl border border-indigo/10 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Most Borrowed Category</p>
          <p className="mt-3 font-display text-xl font-bold text-ink leading-tight">{topCategory}</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Top demand category</p>
        </div>

        {/* Total Transactions */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/40">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transactions</p>
          <p className="mt-3 font-display text-2xl font-bold text-ink">{totalTransactions}</p>
          <p className="mt-1 text-xs text-slate-400 font-medium">Recorded borrow events</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Borrowing Trends Area Chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/40 space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Borrowing Trends</h3>
            <p className="text-xs text-slate-400 mt-0.5">Last 6 months of checkout activity</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthly_activity}>
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B5FEF" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#5B5FEF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="borrows"
                  stroke="#5B5FEF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorBorrows)"
                  dot={{ fill: "#5B5FEF", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#5B5FEF" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Books Bar Chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/40 space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Top 5 Borrowed Books</h3>
            <p className="text-xs text-slate-400 mt-0.5">Most checked-out titles by volume</p>
          </div>
          <div className="h-72">
            {data.top_books.length === 0 ? (
              <p className="text-center text-sm text-slate-400 pt-28">No borrow data available yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_books} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={10} width={120} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="borrows" fill="#5B5FEF" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Donut Chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/40 space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Borrow Distribution by Category</h3>
            <p className="text-xs text-slate-400 mt-0.5">Proportion of checkouts per textbook category</p>
          </div>
          <div className="h-72">
            {data.by_category.length === 0 ? (
              <p className="text-center text-sm text-slate-400 pt-28">No category data available yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.by_category}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {data.by_category.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Fine Recovery Bar Chart */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/40 space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-ink">Fines Recovery Status (GHS)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Collected vs. outstanding outstanding balance comparison</p>
          </div>
          <div className="h-72">
            {data.total_fine_collected === 0 && data.total_fine_outstanding === 0 ? (
              <p className="text-center text-sm text-slate-400 pt-28">No fines data available yet</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.fine_metrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
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
