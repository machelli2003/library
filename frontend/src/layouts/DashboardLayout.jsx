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
  FileText,
  Menu,
  X,
  Library,
  Bell,
  ChevronsLeft,
  ChevronsRight,
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
    { to: "/admin/audit-logs",        label: "Audit Logs",       icon: FileText },
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

const ROLE_ACCENTS = {
  student:   "bg-blue-600 text-white border-blue-500",
  librarian: "bg-emerald-600 text-white border-emerald-500",
  admin:     "bg-indigo-600 text-white border-indigo-500",
};

const ROLE_ACTIVE_ITEMS = {
  student:   "bg-slate-800 text-white",
  librarian: "bg-slate-800 text-white",
  admin:     "bg-slate-800 text-white",
};

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const activeClass = ROLE_ACTIVE_ITEMS[role] || ROLE_ACTIVE_ITEMS.student;

  const items = NAV_ITEMS[role] || [];

  const userInitials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="flex min-h-screen bg-paper text-slate-800 relative">

      {/* ── Mobile Top Bar ── */}
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white px-5 lg:hidden fixed top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-md">
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
      <div className={cn(
        "hidden lg:block shrink-0 transition-all duration-300",
        sidebarCollapsed ? "w-20" : "w-[280px]"
      )} />

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed inset-y-0 z-30 flex flex-col border-r border-slate-900 bg-slate-950 text-slate-200 shadow-xl transition-all duration-300",
          sidebarCollapsed ? "w-20" : "w-[280px]",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >

        {/* ── Sidebar Header ── */}
        <div className="flex items-center gap-3 border-b border-slate-900 px-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-white shadow-sm">
            <Library className="h-6 w-6" />
          </div>
          <div className={cn("overflow-hidden transition-all duration-300", sidebarCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100") }>
            <p className="font-display text-lg font-bold text-white">UniLib</p>
            <p className="text-xs uppercase tracking-widest text-slate-500">{role} portal</p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="ml-auto hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white lg:flex"
          >
            {sidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* ── Navigation Items ── */}
        <nav className="flex flex-1 flex-col gap-2 px-4 py-5 overflow-y-auto custom-scrollbar">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors",
                    sidebarCollapsed ? "justify-center px-3" : "",
                    isActive ? activeClass : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={cn(sidebarCollapsed && "hidden")}>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* ── Sidebar Footer / User Profile ── */}
        <div className="mt-auto border-t border-slate-900 px-4 py-4">
          <div className={cn("flex items-center gap-3 rounded-2xl bg-slate-900 p-3 transition-all duration-300", sidebarCollapsed ? "justify-center" : "") }>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-700 text-sm font-bold text-white">
              {userInitials}
            </div>
            <div className={cn("min-w-0 transition-all duration-300", sidebarCollapsed ? "hidden" : "block") }>
              <p className="truncate text-sm font-semibold text-white">{user?.name || "Member"}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className={cn(
              "mt-3 flex w-full items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white",
              sidebarCollapsed ? "px-3" : ""
            )}
          >
            <LogOut className={cn("h-4 w-4", sidebarCollapsed ? "mr-0" : "mr-2") } />
            <span className={cn(sidebarCollapsed && "hidden")}>Logout</span>
          </button>
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


