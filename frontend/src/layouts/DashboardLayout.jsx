import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Clock,
  CircleDollarSign,
  Users,
  Tag,
  ClipboardList,
  BookMarked,
  BarChart3,
  Upload,
  LogOut,
  Menu,
  X,
  Library,
  Bell,
  ChevronRight,
  Pin,
  PinOff,
} from "lucide-react";
import { cn } from "../lib/utils";

const NAV_ITEMS = {
  student: [
    { to: "/student",          label: "Dashboard",     icon: LayoutDashboard, end: true },
    { to: "/student/catalogue",label: "Catalogue",     icon: BookOpen },
    { to: "/student/history",  label: "Borrow History",icon: Clock },
    { to: "/student/fines",    label: "Fines",         icon: CircleDollarSign },
  ],
  librarian: [
    { to: "/librarian",                     label: "Dashboard",      icon: LayoutDashboard, end: true },
    { to: "/librarian/books",               label: "Manage Books",   icon: BookMarked },
    { to: "/librarian/books/bulk-import",   label: "Bulk Import",    icon: Upload },
    { to: "/librarian/categories",          label: "Categories",     icon: Tag },
    { to: "/librarian/requests",            label: "Borrow Requests",icon: ClipboardList },
    { to: "/librarian/loans",               label: "Active Loans",   icon: BookOpen },
    { to: "/librarian/fines",               label: "Fines",          icon: CircleDollarSign },
    { to: "/librarian/reports",             label: "Reports",        icon: BarChart3 },
  ],
  admin: [
    { to: "/admin",                   label: "Dashboard",        icon: LayoutDashboard, end: true },
    { to: "/admin/users",             label: "Manage Users",     icon: Users },
    { to: "/admin/books",             label: "Manage Books",     icon: BookMarked },
    { to: "/admin/books/bulk-import", label: "Bulk Import",      icon: Upload },
    { to: "/admin/categories",        label: "Categories",       icon: Tag },
    { to: "/admin/requests",          label: "Borrow Requests",  icon: ClipboardList },
    { to: "/admin/loans",             label: "Active Loans",     icon: BookOpen },
    { to: "/admin/fines",             label: "Fines",            icon: CircleDollarSign },
    { to: "/admin/reports",           label: "Reports & Analytics", icon: BarChart3 },
  ],
};

const ROLE_HEADER_GRADIENTS = {
  student:   "from-blue-600 to-indigo-600 shadow-blue-500/25 text-white",
  librarian: "from-teal-600 to-emerald-600 shadow-teal-500/25 text-white",
  admin:     "from-blue-600 to-indigo-600 shadow-blue-500/25 text-white",
};

const ROLE_SIDEBAR_THEMES = {
  student:   "bg-[#EBF3FF] border-[#C6DCFF] shadow-xl shadow-blue-900/5",
  librarian: "bg-[#E6F4F1] border-[#BBE3DC] shadow-xl shadow-teal-900/5",
  admin:     "bg-[#EBF3FF] border-[#C6DCFF] shadow-xl shadow-blue-900/5",
};

const ROLE_ACTIVE_ITEMS = {
  student:   "bg-blue-600 text-white shadow-md shadow-blue-500/30 font-semibold",
  librarian: "bg-teal-600 text-white shadow-md shadow-teal-500/30 font-semibold",
  admin:     "bg-blue-600 text-white shadow-md shadow-blue-500/30 font-semibold",
};

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(() => {
    return localStorage.getItem("sidebar_pinned") === "true";
  });

  const togglePin = () => {
    setIsPinned(prev => {
      const next = !prev;
      localStorage.setItem("sidebar_pinned", String(next));
      return next;
    });
  };

  const isExpanded = isPinned || isHovered;

  const items = NAV_ITEMS[role] || [];

  const userInitials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const headerGradient = ROLE_HEADER_GRADIENTS[role] || ROLE_HEADER_GRADIENTS.student;
  const sidebarTheme = ROLE_SIDEBAR_THEMES[role] || ROLE_SIDEBAR_THEMES.student;
  const activeClass = ROLE_ACTIVE_ITEMS[role] || ROLE_ACTIVE_ITEMS.student;

  return (
    <div className="flex min-h-screen bg-paper text-slate-800 relative">

      {/* ── Mobile Top Bar ── */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white px-5 lg:hidden fixed top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md", headerGradient)}>
            <Library className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-ink">UniLib</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-50 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-500 hover:bg-slate-50 transition-colors focus:outline-none"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Backdrop ── */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-20 bg-ink/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ── Desktop Layout Spacer ── */}
      <div
        className={cn(
          "hidden lg:block shrink-0 transition-all duration-300 ease-in-out",
          isPinned ? "w-64" : "w-20"
        )}
      />

      {/* ── Sidebar ── */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed bottom-0 top-0 z-30 flex flex-col border-r transition-all duration-300 ease-in-out shadow-xl backdrop-blur-md",
          sidebarTheme,
          isExpanded ? "w-64" : "w-20",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Subtle Accent Line */}
        <div className={cn("absolute left-0 inset-y-0 w-[3px] rounded-r bg-gradient-to-b", headerGradient)} />

        {/* ── Sidebar Header ── */}
        <div className={cn(
          "flex items-center border-b border-slate-200/70 transition-all duration-300 py-5",
          isExpanded ? "px-5 justify-between" : "px-3 justify-center"
        )}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md transition-all duration-300 h-10 w-10",
              headerGradient
            )}>
              <Library className="h-5 w-5 text-white" />
            </div>
            {isExpanded && (
              <div className="min-w-0 flex-1 overflow-hidden transition-all duration-200">
                <p className="font-display text-lg font-bold text-slate-900 leading-none truncate">UniLib</p>
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1 truncate">
                  {role} portal
                </p>
              </div>
            )}
          </div>

          {/* Desktop Pin / Auto-Hide Toggle */}
          {isExpanded && (
            <button
              onClick={togglePin}
              title={isPinned ? "Unpin sidebar (Auto-hide on leave)" : "Pin sidebar open"}
              className={cn(
                "hidden lg:flex items-center justify-center h-8 w-8 rounded-lg transition-colors shrink-0",
                isPinned
                  ? "bg-blue-100 text-blue-700 font-semibold border border-blue-200"
                  : "bg-slate-200/60 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-300/50"
              )}
            >
              {isPinned ? <Pin className="h-4 w-4 rotate-45 text-blue-600" /> : <PinOff className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* ── Navigation Items ── */}
        <nav className="flex flex-1 flex-col gap-1.5 px-3 py-5 overflow-y-auto custom-scrollbar">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={!isExpanded ? item.label : undefined}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3.5 rounded-xl transition-all duration-200 relative",
                    isExpanded ? "px-3.5 py-2.5" : "px-3 py-3 justify-center",
                    isActive
                      ? activeClass
                      : "text-slate-700 hover:bg-white hover:text-blue-700 hover:shadow-sm"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200",
                      isActive ? "text-white scale-105" : "text-slate-500 group-hover:text-blue-600 group-hover:scale-110"
                    )} />

                    {isExpanded && (
                      <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
                    )}

                    {isExpanded && isActive && (
                      <ChevronRight className="h-4 w-4 text-white/80 shrink-0" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ── Sidebar Footer / User Profile ── */}
        <div className="mt-auto border-t border-slate-200/70 p-3">
          {isExpanded ? (
            <div className="flex items-center gap-3 rounded-xl bg-white/90 p-2.5 border border-slate-200/80 shadow-sm">
              <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-sm",
                headerGradient
              )}>
                {userInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800 leading-none">{user?.name || "Member"}</p>
                <p className="truncate text-[10px] text-slate-500 mt-1">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-2">
              <div
                title={`${user?.name} (${user?.email})`}
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-sm border border-slate-200",
                  headerGradient
                )}
              >
                {userInitials}
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="flex-1 pt-16 lg:pt-0 min-w-0">
        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}


