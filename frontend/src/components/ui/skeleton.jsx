import { cn } from "../../lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("skeleton rounded-xl", className)}
      {...props}
    />
  );
}

export { Skeleton };
