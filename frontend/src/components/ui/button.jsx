import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:     "bg-brand-700 text-white shadow-md shadow-brand-700/20 hover:bg-brand-800 hover:shadow-lg hover:shadow-brand-700/30",
        secondary:   "bg-slate-800 text-white shadow-md shadow-slate-800/15 hover:bg-slate-900 hover:shadow-lg",
        destructive: "bg-red-600 text-white shadow-md shadow-red-600/20 hover:bg-red-700",
        outline:     "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900",
        ghost:       "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        link:        "text-brand-700 underline-offset-4 hover:underline",
        glass:       "glass border border-slate-200 text-slate-800 hover:border-brand-700/30 hover:bg-brand-50/50",
        danger:      "border border-red-200 bg-white text-red-600 hover:bg-red-50 hover:border-red-300",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm:      "h-8 rounded-lg px-3.5 text-xs",
        lg:      "h-12 rounded-xl px-8 text-base",
        xl:      "h-14 rounded-xl px-10 text-base",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
