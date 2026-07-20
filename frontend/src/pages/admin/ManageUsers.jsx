import { useEffect, useState } from "react";
import { usersApi } from "../../services/api/usersApi";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const ROLES = ["student", "librarian", "admin"];

const ROLE_BADGE = {
  student: "bg-sky-50 text-sky border-sky/20",
  librarian: "bg-emerald-50 text-emerald border-emerald/20",
  admin: "bg-indigo-soft text-indigo border-indigo/20",
};

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("");
  const [actingOn, setActingOn] = useState(null);

  // Add staff modal state
  const [showModal, setShowModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", email: "", password: "", role: "librarian" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => {
    setLoading(true);
    usersApi
      .list(filterRole ? { role: filterRole } : {})
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filterRole]);

  const toggleActive = async (user) => {
    setActingOn(user.id);
    try {
      if (user.is_active) {
        await usersApi.deactivate(user.id);
      } else {
        await usersApi.activate(user.id);
      }
      load();
    } finally {
      setActingOn(null);
    }
  };

  const handleRoleChange = async (user, newRole) => {
    if (newRole === user.role) return;
    setActingOn(user.id);
    try {
      await usersApi.changeRole(user.id, newRole);
      load();
    } finally {
      setActingOn(null);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await usersApi.createStaff(newStaff);
      setSuccess("Staff member created successfully!");
      setNewStaff({ name: "", email: "", password: "", role: "librarian" });
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create staff member");
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-emerald shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{success}</span>
          </div>
          <button onClick={() => setSuccess("")} className="text-emerald/60 hover:text-emerald font-bold text-lg leading-none">×</button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Manage Users</h1>
          <p className="text-sm text-slate-400 mt-1">Oversee platform members, assign roles, and control account access</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Role Filter */}
          <div className="relative">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none appearance-none"
            >
              <option value="">All Roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Add Staff Button */}
          <button
            onClick={() => { setError(""); setShowModal(true); }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo/10 transition hover:bg-indigo/90 hover:shadow-indigo/15"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading user registry..." />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" subtitle="Adjust the role filter or add a new staff member." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase font-bold tracking-wider text-slate-400 bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="transition hover:bg-slate-50/30">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-sm text-slate-500">
                          {u.name ? u.name[0].toUpperCase() : "?"}
                        </span>
                        <span className="font-semibold text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{u.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        disabled={actingOn === u.id}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-bold capitalize focus:outline-none focus:ring-1 focus:ring-indigo transition ${ROLE_BADGE[u.role] || "bg-slate-50 text-slate-500 border-slate-200"}`}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${u.is_active ? "bg-emerald-50 text-emerald border-emerald/20" : "bg-red-50 text-crimson border-red-100"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? "bg-emerald" : "bg-crimson"}`} />
                        {u.is_active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleActive(u)}
                        disabled={actingOn === u.id}
                        className={`inline-flex items-center justify-center rounded-lg border px-3.5 py-1.5 text-xs font-semibold shadow-sm transition disabled:opacity-40 ${
                          u.is_active
                            ? "border-red-100 bg-white text-crimson hover:bg-red-50"
                            : "border-emerald-100 bg-white text-emerald hover:bg-emerald-50"
                        }`}
                      >
                        {actingOn === u.id ? "Saving..." : u.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-fade-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-xl font-bold text-ink">Add New Staff Member</h3>
                <p className="text-xs text-slate-400 mt-0.5">Create a librarian or admin account</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-700 flex gap-3">
                  <svg className="h-5 w-5 text-crimson shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Kwame Mensah"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. k.mensah@university.edu.gh"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  placeholder="Min. 8 chars, letters & numbers"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
                />
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Assign Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none appearance-none"
                >
                  <option value="librarian">Librarian</option>
                  <option value="admin">Admin</option>
                </select>
                <div className="absolute right-3.5 bottom-3.5 pointer-events-none text-slate-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-500 shadow-sm transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo/10 transition hover:bg-indigo/90 hover:shadow-indigo/15"
                >
                  Create Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
