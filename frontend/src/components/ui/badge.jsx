import { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
  {
    variants: {
      variant: {
        default:     "border-blue-200 bg-blue-50 text-blue-800",
        secondary:   "border-slate-200 bg-slate-100 text-slate-700",
        destructive: "border-red-200 bg-red-50 text-red-700",
        outline:     "border-slate-200 bg-white text-slate-700",
        pending:     "border-amber-200 bg-amber-50 text-amber-800",
        borrowed:    "border-indigo-200 bg-indigo-50 text-indigo-800",
        returned:    "border-emerald-200 bg-emerald-50 text-emerald-800",
        overdue:     "border-red-200 bg-red-50 text-red-700",
        paid:        "border-emerald-200 bg-emerald-50 text-emerald-800",
        unpaid:      "border-red-200 bg-red-50 text-red-700",
        approved:    "border-blue-200 bg-blue-50 text-blue-800",
        rejected:    "border-red-200 bg-red-50 text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Badge = forwardRef(({ className, variant, dot, ...props }, ref) => (
  <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props}>
    {dot && (
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        variant === "overdue" || variant === "destructive" || variant === "unpaid" || variant === "rejected"
          ? "bg-red-500"
          : variant === "pending"
          ? "bg-amber-500"
          : variant === "borrowed" || variant === "approved"
          ? "bg-blue-500"
          : "bg-brand-700"
      )} />
    )}
    {props.children}
  </span>
));
Badge.displayName = "Badge";

export { Badge, badgeVariants };
