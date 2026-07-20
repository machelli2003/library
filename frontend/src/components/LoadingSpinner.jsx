export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-16 text-slate-400">
      {label}
    </div>
  );
}
