import { cn } from "@/lib/utils";

// Loading state — blank screen की जगह skeleton।
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("nys-skeleton rounded-lg", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-saffron-100 bg-white p-4">
      <Skeleton className="mb-3 h-40 w-full" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}
