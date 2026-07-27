import { useEffect, useState } from "react";
import { usersApi } from "../../services/api/usersApi";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";

const ROLES = ["student", "librarian", "admin"];
const ROLE_BADGE = { student: "bg-sky-50 text-sky border-sky/20", librarian: "bg-emerald-50 text-emerald border-emerald/20", admin: "bg-indigo-soft text-indigo border-indigo/20" };

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("");
  const [actingOn, setActingOn] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", email: "", password: "", role: "librarian" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState({ id: null, name: "", email: "" });

  const load = () => { setLoading(true); usersApi.list(filterRole ? { role: filterRole } : {}).then((r) => setUsers(r.data)).finally(() => setLoading(false)); };
  useEffect(load, [filterRole]);

  const toggleActive = async (user) => {
    setActingOn(user.id); setError("");
    try { if (user.is_active) await usersApi.deactivate(user.id); else await usersApi.activate(user.id); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed"); }
    finally { setActingOn(null); }
  };

  const handleRoleChange = async (user, newRole) => {
    if (newRole === user.role) return;
    setActingOn(user.id); setError("");
    try { await usersApi.changeRole(user.id, newRole); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed"); }
    finally { setActingOn(null); }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    try {
      await usersApi.createStaff(newStaff);
      setSuccess("Staff created!"); setNewStaff({ name: "", email: "", password: "", role: "librarian" }); setShowAddModal(false); load();
    } catch (err) { setError(err.response?.data?.message || "Failed"); }
  };

  const openEditModal = (user) => { setEditUser({ id: user.id, name: user.name, email: user.email }); setShowEditModal(true); setError(""); };

  const handleEditUser = async (e) => {
    e.preventDefault(); setError(""); setSuccess("");
    try { await usersApi.update(editUser.id, { name: editUser.name, email: editUser.email }); setSuccess("User updated!"); setShowEditModal(false); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed"); }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Delete this user?")) return;
    setError(""); setSuccess("");
    try { await usersApi.remove(userId); setSuccess("User deleted!"); load(); }
    catch (err) { setError(err.response?.data?.message || "Failed"); }
  };

  return (
    <div className="space-y-6">
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 flex items-center justify-between shadow-sm"><span>{success}</span><button onClick={() => setSuccess("")} className="text-emerald/60 hover:text-emerald font-bold">x</button></div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 flex items-center justify-between shadow-sm"><span>{error}</span><button onClick={() => setError("")} className="text-red/60 hover:text-red font-bold">x</button></div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Manage Users</h1>
          <p className="text-sm text-slate-400 mt-1">Oversee members, assign roles, edit details, and control access</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-2.5 text-xs font-bold text-slate-600 shadow-sm outline-none appearance-none focus:border-indigo focus:ring-1 focus:ring-indigo">
              <option value="">All Roles</option>
              {ROLES.map((r) => (<option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>))}
</select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </div>
          </div>
          <button onClick={() => { setError(""); setShowAddModal(true); }} className="inline-flex items-center gap-2 rounded-xl bg-indigo px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-indigo/90">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span>Add Staff</span>
          </button>
        </div>
      </div>
      {loading ? <LoadingSpinner label="Loading user registry..." /> : users.length === 0 ? <EmptyState title="No users found" subtitle="Adjust the role filter or add a new staff member." /> : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 text-xs uppercase font-bold tracking-wider text-slate-400 bg-slate-50/50">
                <tr><th className="px-6 py-4">User</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-sm text-slate-500">{u.name ? u.name[0].toUpperCase() : "?"}</span>
                        <span className="font-semibold text-slate-800">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{u.email}</td>
                    <td className="px-6 py-4">
                      <select value={u.role} disabled={actingOn === u.id} onChange={(e) => handleRoleChange(u, e.target.value)} className={`rounded-lg border px-2.5 py-1 text-xs font-bold capitalize outline-none focus:ring-1 focus:ring-indigo transition ${ROLE_BADGE[u.role] || "bg-slate-50 text-slate-500 border-slate-200"}`}>
                        {ROLES.map((r) => (<option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${u.is_active ? "bg-emerald-50 text-emerald border-emerald/20" : "bg-red-50 text-crimson border-red-100"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? "bg-emerald" : "bg-crimson"}`} />
                        {u.is_active ? "Active" : "Deactivated"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button onClick={() => openEditModal(u)} disabled={actingOn === u.id} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-40">Edit</button>
                        <button onClick={() => toggleActive(u)} disabled={actingOn === u.id} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-sm transition disabled:opacity-40 ${u.is_active ? "border-red-100 bg-white text-crimson hover:bg-red-50" : "border-emerald-100 bg-white text-emerald hover:bg-emerald-50"}`}>{u.is_active ? "Deactivate" : "Activate"}</button>
                        <button onClick={() => handleDeleteUser(u.id)} disabled={actingOn === u.id} className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-500 shadow-sm hover:bg-red-50 disabled:opacity-40">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-ink">Add New Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <input type="text" required placeholder="Full Name" value={newStaff.name} onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo focus:ring-1 focus:ring-indigo" />
              <input type="email" required placeholder="Email" value={newStaff.email} onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo focus:ring-1 focus:ring-indigo" />
              <input type="password" required placeholder="Password (min 8 chars)" value={newStaff.password} onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo focus:ring-1 focus:ring-indigo" />
              <select value={newStaff.role} onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo focus:ring-1 focus:ring-indigo">
                <option value="librarian">Librarian</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-500 shadow-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-xl bg-indigo px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo/90">Create Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-bold text-ink">Edit User</h3>
              <button onClick={() => setShowEditModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              <input type="text" required placeholder="Full Name" value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo focus:ring-1 focus:ring-indigo" />
              <input type="email" required placeholder="Email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo focus:ring-1 focus:ring-indigo" />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-500 shadow-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" className="rounded-xl bg-indigo px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo/90">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
