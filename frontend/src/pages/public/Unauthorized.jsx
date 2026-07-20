import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4 py-12 text-center">
      {/* Background visual graphics */}
      <div className="absolute right-0 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-indigo/5 blur-3xl" />
      <div className="absolute left-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-sky/5 blur-3xl" />

      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-200/50">
        <span className="stamp text-crimson mb-4 text-[10px]">restricted section</span>
        <h1 className="font-display text-7xl font-bold tracking-tight text-ink">403</h1>
        <h2 className="mt-4 font-display text-xl font-bold text-slate-800">Access Denied</h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          You do not have the necessary permissions to access this restricted section of the library portal. Please sign in with an authorized account.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:bg-indigo hover:shadow-indigo/15 hover:-translate-y-0.5"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

