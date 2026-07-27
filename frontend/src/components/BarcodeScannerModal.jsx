import { useState } from "react";

export default function BarcodeScannerModal({ isOpen, onClose, onScan }) {
  const [manualCode, setManualCode] = useState("");

  if (!isOpen) return null;

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScan(manualCode.trim());
    setManualCode("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-soft text-indigo">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM14.625 3.75c-.621 0-1.125.504-1.125 1.125v4.5c0 .621.504 1.125 1.125 1.125h4.5c.621 0 1.125-.504 1.125-1.125v-4.5c0-.621-.504-1.125-1.125-1.125h-4.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.625 14.625h1.5v1.5h-1.5zM17.625 14.625h1.5v1.5h-1.5zM14.625 17.625h1.5v1.5h-1.5zM17.625 17.625h1.5v1.5h-1.5z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-ink">Barcode / QR Scanner</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 transition"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Viewfinder simulation container */}
        <div className="relative flex flex-col items-center justify-center rounded-2xl bg-slate-900 p-8 text-center overflow-hidden border border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 opacity-60" />
          
          {/* Laser animation */}
          <div className="relative h-44 w-44 rounded-xl border-2 border-dashed border-indigo-400/60 flex items-center justify-center shadow-inner">
            <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse" />
            <svg className="h-16 w-16 text-indigo-400/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316A2.192 2.192 0 0014.53 3.75h-5.06c-.68 0-1.31.326-1.706.877l-.937 1.548z" />
            </svg>
          </div>

          <p className="relative mt-4 text-xs font-semibold text-slate-300">
            Position barcode inside the viewfinder
          </p>
        </div>

        {/* Manual Barcode / ISBN Entry */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Or enter ISBN / Barcode code
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="e.g. 9780743273565..."
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo focus:ring-1 focus:ring-indigo"
              autoFocus
            />
            <button
              type="submit"
              className="rounded-xl bg-indigo px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo/90 transition"
            >
              Lookup
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
