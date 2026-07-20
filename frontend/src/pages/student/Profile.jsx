import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../services/api/authApi";

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [studentId, setStudentId] = useState(user?.student_id || "");
  const [program, setProgram] = useState(user?.program || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [message, setMessage] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (password && password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      const payload = { name, email };
      if (user.role === "student") {
        payload.student_id = studentId;
        payload.program = program;
      }
      if (password) {
        payload.password = password;
      }

      const res = await authApi.updateProfile(payload);
      setUser(res.data);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="font-display text-3xl font-bold text-ink">My Profile</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account information, program details, and security controls</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {message.text && (
            <div
              className={`p-4 rounded-xl text-sm font-medium border ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald border-emerald-100"
                  : "bg-red-50 text-red-700 border-red-100"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form Input fields */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition shadow-sm placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition shadow-sm placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
              />
            </div>

            {user?.role === "student" && (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Student ID
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition shadow-sm placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Academic Program
                  </label>
                  <input
                    type="text"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition shadow-sm placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
                  />
                </div>
              </>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Change Password Block */}
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-ink">Security Credentials</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your desired new password below if you wish to change it. Otherwise, leave blank.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters (alphanumeric)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition shadow-sm placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition shadow-sm placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-50">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-indigo/10 transition hover:bg-indigo/90 hover:shadow-indigo/15 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

