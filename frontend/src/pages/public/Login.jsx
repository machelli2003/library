import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    setError("");
    try {
      const user = await login(data.email, data.password);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4 py-12">
      {/* Background visual graphics */}
      <div className="absolute right-0 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-indigo/5 blur-3xl" />
      <div className="absolute left-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-sky/5 blur-3xl" />

      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-200/50">
        
        {/* Brand/Heading */}
        <div className="mb-8 text-center">
          <span className="stamp text-indigo mb-3 text-[10px]">campus login</span>
          <h2 className="font-display text-3xl font-bold text-ink">Welcome Back</h2>
          <p className="mt-1.5 text-sm text-slate-400">Sign in to manage your library dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3.5 flex gap-2.5 items-start">
              <svg className="h-5 w-5 shrink-0 text-crimson mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. name@university.edu"
              {...register("email", { required: true })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Password
              </label>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              {...register("password", { required: true })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-indigo focus:ring-1 focus:ring-indigo"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-ink py-3 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:bg-indigo hover:shadow-indigo/15 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400 font-medium">
          New to the library?{" "}
          <Link to="/register" className="font-semibold text-indigo hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

