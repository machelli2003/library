export default function StatCard({ label, value }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-800">{value ?? "—"}</p>
    </div>
  );
}
