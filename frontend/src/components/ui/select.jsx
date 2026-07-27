import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Select = forwardRef(({ className, children, ...props }, ref) => (
  <select
    className={cn(
      "flex h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 transition-all duration-200",
      "focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 focus:outline-none",
      "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
      "bg-[url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")] bg-no-repeat bg-[right_0.75rem_center]",
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export { Select };
