import { cn } from "../lib/utils";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({ label = "Loading...", size = "default", className }) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center gap-4 py-16",
      className
    )}>
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-brand-700/10 animate-ping scale-110" />
        {/* Spinner */}
        <div className={cn(
          "relative flex items-center justify-center rounded-full bg-gradient-to-br from-brand-700/10 to-brand-700/5",
          size === "sm" ? "h-8 w-8" : "h-12 w-12"
        )}>
          <Loader2 className={cn(
            "animate-spin text-brand-700",
            size === "sm" ? "h-4 w-4" : "h-6 w-6"
          )} />
        </div>
      </div>
      {label && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 animate-pulse-slow">
          {label}
        </p>
      )}
    </div>
  );
}