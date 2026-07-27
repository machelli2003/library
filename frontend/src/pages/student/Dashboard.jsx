import { useEffect, useState } from "react";
import { dashboardApi } from "../../services/api/dashboardApi";
import { borrowApi } from "../../services/api/borrowApi";
import { reservationsApi } from "../../services/api/reservationsApi";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/StatCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const BORROW_HISTORY_DEMO = [
  { month: "Feb", books: 1 },
  { month: "Mar", books: 3 },
  { month: "Apr", books: 2 },
  { month: "May", books: 4 },
  { month: "Jun", books: 2 },
  { month: "Jul", books: 3 },
];

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

  const fineData = [
    { name: "Outstanding", value: stats?.outstanding_fines || 0 },
    { name: "Clear", value: stats?.outstanding_fines > 0 ? 0 : 1 },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Welcome, {user?.name?.split(" ")[0]}
        </h1>
        <p className="mt-0.5 text-sm text-slate-400">Your library activity at a glance.</p>
      </div>

      {/* Due Soon Alert */}
      {dueSoonItems.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-5 py-3.5">
          <p className="text-sm font-medium text-amber-700">
            ⚠ &nbsp;
            {dueSoonItems.length === 1
              ? "You have 1 book due within 2 days."
              : `You have ${dueSoonItems.length} books due within 2 days.`}
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {dueSoonItems.map((item) => (
              <li key={item.id} className="text-xs text-amber-600">
                {item.book_title} — due {item.due_date}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Books Borrowed" value={stats?.books_borrowed} sub="Currently active" />
        <StatCard label="All Time Borrowed" value={stats?.total_borrowed_all_time} sub="Total records" />
        <StatCard
          label="Outstanding Fines"
          value={`GHS ${(stats?.outstanding_fines || 0).toFixed(2)}`}
          sub="Unpaid balance"
          accent={stats?.outstanding_fines > 0 ? "text-red-500" : "text-slate-800"}
        />
        <StatCard label="Active Holds" value={activeReservations.length} sub="Pending reservations" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Borrow Activity Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-1">Borrow Activity</p>
          <p className="text-xs text-slate-400 mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={BORROW_HISTORY_DEMO} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12 }}
                cursor={{ stroke: "#e2e8f0" }}
              />
              <Area type="monotone" dataKey="books" stroke="#3B82F6" strokeWidth={2} fill="url(#blueGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Fine Status Donut */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col">
          <p className="text-sm font-semibold text-slate-700 mb-1">Fine Status</p>
          <p className="text-xs text-slate-400 mb-2">Current balance</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={fineData}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill={stats?.outstanding_fines > 0 ? "#EF4444" : "#3B82F6"} />
                  <Cell fill="#F1F5F9" />
                </Pie>
                <Tooltip
                  contentStyle={{ border: "none", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-xs text-slate-400">
            {stats?.outstanding_fines > 0 ? "Balance due" : "No fines outstanding"}
          </p>
        </div>
      </div>

      {/* Active Reservations Table */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Active Holds
        </p>
        {activeReservations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 py-8 text-center">
            <p className="text-sm text-slate-400">No active holds at the moment.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-3 font-medium">Book</th>
                  <th className="px-5 py-3 font-medium">Author</th>
                  <th className="px-5 py-3 font-medium">Reserved</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeReservations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-700">{r.book_title}</td>
                    <td className="px-5 py-3.5 text-slate-500">{r.book_author}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleCancelReservation(r.id)}
                        disabled={cancellingId === r.id}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 hover:border-red-200 hover:text-red-500 disabled:opacity-40 transition-colors"
                      >
                        {cancellingId === r.id ? "Cancelling…" : "Cancel"}
                      </button>
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
