import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = {
  student: [
    { to: "/student", label: "Dashboard", end: true, icon: "dashboard" },
    { to: "/student/catalogue", label: "Catalogue", icon: "catalogue" },
    { to: "/student/history", label: "Borrow History", icon: "history" },
    { to: "/student/fines", label: "Fines", icon: "fines" },
  ],
  librarian: [
    { to: "/librarian", label: "Dashboard", end: true, icon: "dashboard" },
    { to: "/librarian/books", label: "Manage Books", icon: "books" },
    { to: "/librarian/categories", label: "Categories", icon: "categories" },
    { to: "/librarian/requests", label: "Borrow Requests", icon: "requests" },
    { to: "/librarian/fines", label: "Fines", icon: "fines" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", end: true, icon: "dashboard" },
    { to: "/admin/users", label: "Manage Users", icon: "users" },
    { to: "/admin/reports", label: "Reports", icon: "reports" },
  ],
};

function getIconSvg(iconName) {
  const props = { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5 };
  switch (iconName) {
    case "dashboard":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      );
    case "catalogue":
    case "books":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      );
    case "history":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "fines":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.879c1.003 1.003 2.63 1.003 3.633 0L15 13.06m-6-2.244l.879-.879c1.003-1.003 2.63-1.003 3.633 0L15 10.82m-9 7.433c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "categories":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 001.591 0l4.318-4.318a1.125 1.125 0 000-1.591L9.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
      );
    case "requests":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002-2.5V5.25A2.25 2.25 0 0018 3H6a2.25 2.25 0 00-2 2.25v13.5A2.25 2.25 0 006 21h12a2.25 2.25 0 002-2.25V15" />
        </svg>
      );
    case "users":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A2.25 2.25 0 0112.75 21.5h-1.5a2.25 2.25 0 01-2.25-2.263V19.13m4.5-4.004g-4.5 4.004M12.75 15.128a8.9 8.9 0 00-1.5-.084c-1.89 0-3.684.589-5.166 1.594a3.72 3.72 0 00-1.598 3.185v.109a2.25 2.25 0 002.25 2.25h9.75a2.25 2.25 0 002.25-2.25v-.11a3.72 3.72 0 00-1.598-3.184 8.878 8.878 0 00-2.516-1.109zm0-3.75a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0zm7.125-3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      );
    case "reports":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const items = NAV_ITEMS[role] || [];

  const userInitials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="flex min-h-screen bg-paper text-slate-800">
      
      {/* Mobile Top Bar */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white px-6 lg:hidden fixed top-0 z-30 shadow-sm shadow-slate-100/50">
        <div className="flex items-center gap-3">
          <span className="stamp text-indigo scale-90">est. campus library</span>
          <span className="font-display text-lg font-semibold text-ink">Library</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo/25"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </header>

      {/* Backdrop for Mobile Sidebar */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/30 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Navigation Sidebar */}
      <aside className={`fixed bottom-0 top-0 z-20 flex w-64 flex-col bg-ink p-6 transition-all duration-300 lg:sticky lg:left-0 lg:translate-x-0 ${
        mobileMenuOpen ? "left-0 translate-x-0" : "-left-64 translate-x-0 lg:translate-x-0"
      }`}>
        {/* Spine-line element */}
        <div className="absolute bottom-0 left-0 top-0 w-[4px] bg-gradient-to-b from-knust-green via-knust-gold to-knust-green" />

        {/* Brand Header */}
        <div className="mb-8 pl-3 flex flex-col gap-1.5">
          <span className="font-display text-2xl font-bold tracking-tight text-white">
            Library
          </span>
          <div className="inline-flex self-start rounded-full bg-white/10 px-2.5 py-0.5 border border-white/5">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-slate-300">
              {role} portal
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex flex-1 flex-col gap-1.5 pl-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-indigo text-white shadow-md shadow-indigo/20 scale-[1.02]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {getIconSvg(item.icon)}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer / User Profile Panel */}
        <div className="mt-auto border-t border-white/10 pt-4 px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-knust-green to-knust-gold text-sm font-bold text-white shadow-md shadow-knust-green/20 border border-white/10">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.name || "Member"}</p>
              <p className="truncate text-xs text-slate-400 font-medium">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="shrink-0 rounded-lg border border-white/10 bg-white/5 p-1.5 text-slate-400 transition-all duration-200 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/20"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M19.5 12l-3-3m3 3l-3 3m3-3H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10 pt-20 lg:pt-10 max-w-7xl mx-auto w-full transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}