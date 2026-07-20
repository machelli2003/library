export default function StatCard({ label, value }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-slate-100 bg-white p-4 shadow-sm shadow-slate-200/40 transition-all duration-300 hover:shadow-md hover:border-slate-200/60">
      {/* Decorative side color strip */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-indigo via-indigo/70 to-sky" />

      <div className="pl-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {label}
        </p>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
}