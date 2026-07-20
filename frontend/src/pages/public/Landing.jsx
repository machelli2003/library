import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F8FA] text-slate-800">
      {/* Decorative Top-Right Soft Light Orb */}
      <div className="absolute right-0 top-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-indigo/5 to-sky/5 blur-3xl" />
      <div className="absolute left-[-200px] bottom-[-200px] -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-indigo/5 to-transparent blur-3xl" />

      {/* Navigation Header bar */}
      <header className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="stamp text-indigo font-semibold tracking-wider">est. campus library</span>
          <span className="font-display text-xl font-bold tracking-tight text-ink">Library</span>
        </div>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-indigo px-5 py-2 text-sm font-semibold text-white shadow-md shadow-indigo/15 transition-all hover:bg-indigo/90 hover:shadow-lg hover:shadow-indigo/20"
          >
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 pt-16 pb-24 text-center lg:pt-24">
        <div className="inline-flex items-center gap-2.5 rounded-full bg-indigo-soft px-4 py-1.5 border border-indigo/10 mb-6 animate-fade-in">
          <span className="flex h-2 w-2 rounded-full bg-indigo animate-pulse" />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo">
            Welcome to the Academic Portal
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-ink max-w-4xl mx-auto leading-[1.1]">
          The Gateway to <span className="bg-gradient-to-r from-indigo via-indigo/95 to-sky bg-clip-text text-transparent">Academic Discovery</span>
        </h1>
        
        <p className="mt-6 max-w-xl mx-auto text-base md:text-lg text-slate-500 leading-relaxed">
          Search the online catalogue, reserve textbooks, manage loans, and track fines. Accessible for students, faculty, and administrators.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/login"
            className="group flex items-center gap-2 rounded-xl bg-ink px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-ink/10 transition-all hover:bg-indigo hover:shadow-indigo/25 hover:-translate-y-0.5"
          >
            <span>Access Portal</span>
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            to="/register"
            className="rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5"
          >
            Create an Account
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <section className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {/* Card 1 */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/30 transition hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-soft text-indigo mb-4 border border-indigo/5">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold text-ink">Smart Catalogue</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Explore thousands of book references, journals, and technical materials instantly. Filter by category, author, or keywords.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/30 transition hover:shadow-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-soft text-indigo mb-4 border border-indigo/5">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold text-ink">Borrow & Holds</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Request active checkouts, track due dates, request quick 7-day loan renewals, and place reservations/holds on rented books.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-200/30 transition hover:shadow-md sm:col-span-2 lg:col-span-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-soft text-indigo mb-4 border border-indigo/5">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold text-ink">Fine Tracking</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Transparent oversight of unpaid fines. Keep account balance in order and receive automatic email/notification reminders.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}