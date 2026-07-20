import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { notificationsApi } from "../services/api/notificationsApi";
import { io } from "socket.io-client";

const NAV_ITEMS = {
  student: [
    { to: "/student", label: "Dashboard", end: true },
    { to: "/student/catalogue", label: "Catalogue" },
    { to: "/student/history", label: "Borrow History" },
    { to: "/student/fines", label: "Fines" },
    { to: "/student/profile", label: "My Profile" },
  ],
  librarian: [
    { to: "/librarian", label: "Dashboard", end: true },
    { to: "/librarian/books", label: "Manage Books" },
    { to: "/librarian/categories", label: "Categories" },
    { to: "/librarian/requests", label: "Borrow Requests" },
    { to: "/librarian/loans", label: "Active Loans" },
    { to: "/librarian/fines", label: "Fines" },
    { to: "/librarian/reports", label: "Reports" },
    { to: "/librarian/profile", label: "My Profile" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/users", label: "Manage Users" },
    { to: "/admin/reports", label: "Reports" },
    { to: "/admin/profile", label: "My Profile" },
  ],
};

const TYPE_COLORS = {
  borrow: "text-emerald-600 bg-emerald-50",
  rejection: "text-red-600 bg-red-50",
  fine: "text-amber-600 bg-amber-50",
  overdue: "text-orange-600 bg-orange-50",
};

const TYPE_ICONS = {
  borrow: "✓",
  rejection: "✗",
  fine: "⚠",
  overdue: "⏰",
};

function NotificationDrawer({ onClose }) {
  const [data, setData] = useState({ notifications: [], unread_count: 0 });
  const [loading, setLoading] = useState(true);

  const load = () => {
    notificationsApi.list().then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    load();
  };

  const markOne = async (id) => {
    await notificationsApi.markRead(id);
    load();
  };

  return (
    <div className="absolute right-0 top-10 z-50 w-80 rounded-xl border border-slate-200 bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h3 className="font-semibold text-slate-800">Notifications</h3>
        <div className="flex items-center gap-3">
          {data.unread_count > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">Loading…</p>
        ) : data.notifications.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet</p>
        ) : (
          data.notifications.map((n) => (
            <div
              key={n.id}
              className={`flex gap-3 border-b border-slate-50 px-4 py-3 last:border-0 ${!n.is_read ? "bg-slate-50" : ""}`}
            >
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${TYPE_COLORS[n.type] || "bg-slate-100 text-slate-500"}`}
              >
                {TYPE_ICONS[n.type] || "•"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-snug">{n.message}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(n.created_at).toLocaleDateString()}
                </p>
              </div>
              {!n.is_read && (
                <button
                  onClick={() => markOne(n.id)}
                  className="flex-shrink-0 text-xs text-slate-400 hover:text-slate-600"
                  title="Mark as read"
                >
                  ●
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const items = NAV_ITEMS[role] || [];
  const [showNotifs, setShowNotifs] = useState(false);
  const [unread, setUnread] = useState(0);
  const [toasts, setToasts] = useState([]);
  const bellRef = useRef(null);

  const addToast = (msg) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  // Connect WebSockets for notifications
  useEffect(() => {
    // Initial fetch of unread count
    notificationsApi
      .list()
      .then((res) => setUnread(res.data.unread_count))
      .catch(() => {});

    const token = localStorage.getItem("token");
    if (!token) return;

    const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");
    const socket = io(base, {
      auth: { token: `Bearer ${token}` },
    });

    socket.on("connect", () => {
      console.log("WebSocket connected successfully");
    });

    socket.on("new_notification", (notif) => {
      setUnread((prev) => prev + 1);
      addToast(notif.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [role]);

  // Close drawer when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 flex-col border-r border-slate-200 bg-white p-5">
        <div className="mb-8">
          <p className="text-lg font-semibold text-slate-800">Library</p>
          <p className="text-xs capitalize text-slate-400">{role} portal</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="truncate text-sm text-slate-700">{user?.name}</p>

            {/* Notification bell — visible to all roles */}
            <div className="relative" ref={bellRef}>
              <button
                id="notification-bell"
                onClick={() => setShowNotifs((v) => !v)}
                className="relative flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                title="Notifications"
              >
                🔔
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {showNotifs && (
                <NotificationDrawer onClose={() => setShowNotifs(false)} />
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full rounded-lg border border-slate-200 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <Outlet />
      </main>

      {/* Floating real-time toasts container */}
      <div className="fixed right-6 top-6 z-[9999] flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-100 max-w-sm w-80 animate-slide-in transition-all"
            style={{ animation: "slideIn 0.3s ease-out" }}
          >
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs text-blue-600 font-bold">
              ℹ
            </span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800">New Notification</p>
              <p className="mt-0.5 text-xs text-slate-500 leading-snug">{t.msg}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
              className="text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
