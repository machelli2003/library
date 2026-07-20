export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-xs font-semibold uppercase tracking-wider text-slate-400">
      <div className="relative flex h-8 w-8 items-center justify-center">
        <span className="absolute h-full w-full animate-ping rounded-full bg-indigo/10 opacity-75" />
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo" />
      </div>
      <span>{label}</span>
    </div>
  );
}