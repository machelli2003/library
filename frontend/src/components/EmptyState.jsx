export default function EmptyState({ title, subtitle }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center">
      <p className="font-medium text-slate-600">{title}</p>
      {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
    </div>
  );
}
