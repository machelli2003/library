import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#F7F8FA] px-4 py-12 text-center">
      {/* Background visual graphics */}
      <div className="absolute right-0 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-indigo/5 blur-3xl" />
      <div className="absolute left-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-sky/5 blur-3xl" />

      <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-lg shadow-slate-200/50">
        <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-inset ring-red-200 mb-4">Error 404</span>
        <h1 className="font-display text-7xl font-bold tracking-tight text-ink">404</h1>
        <h2 className="mt-4 font-display text-xl font-bold text-slate-800">Page Not Found</h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          The textbook or section you are trying to read might have been removed, had its catalog location updated, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 transition-all hover:bg-indigo hover:shadow-indigo/15 hover:-translate-y-0.5"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}

