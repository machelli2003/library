import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Input = forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-10 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200",
      "focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 focus:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
