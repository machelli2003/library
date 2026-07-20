import { useEffect, useState } from "react";
import { usersApi } from "../../services/api/usersApi";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const ROLES = ["student", "librarian", "admin"];

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
    <div>
      {success && (
        <div className="mb-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-100 flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} className="font-bold">✕</button>
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-800">Manage Users</h1>
        <div className="flex items-center gap-3">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setError("");
              setShowModal(true);
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-sm"
          >
            + Add Staff
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-slate-500 bg-slate-50/50">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/30">
                  <td className="px-5 py-4 font-medium text-slate-700">{u.name}</td>
                  <td className="px-5 py-4 text-slate-500">{u.email}</td>
                  <td className="px-5 py-4">
                    <select
                      value={u.role}
                      disabled={actingOn === u.id}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs capitalize focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span className={u.is_active ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
                      {u.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => toggleActive(u)}
                      disabled={actingOn === u.id}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                    >
                      {u.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Staff creation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-100">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">Add New Staff Member</h3>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">{error}</div>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  placeholder="Min. 8 chars, letters & numbers"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Role
                </label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white bg-white"
                >
                  <option value="librarian">Librarian</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 shadow-sm"
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
