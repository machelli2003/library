export default function StatCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 flex flex-col gap-1">
      <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`text-2xl font-bold ${accent || "text-slate-800"}`}>{value ?? "—"}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}