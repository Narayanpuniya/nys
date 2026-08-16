import * as Icons from "lucide-react";
import { Card } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon,
  tone = "saffron",
  hint,
}: {
  label: string;
  value: string | number;
  icon: string;
  tone?: "saffron" | "green" | "blue" | "red" | "purple";
  hint?: string;
}) {
  const Icon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[icon] ?? Icons.Circle;
  const tones: Record<string, string> = {
    saffron: "bg-saffron-100 text-saffron-700",
    green: "bg-green-100 text-green-700",
    blue: "bg-blue-100 text-blue-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-stone-500">{label}</span>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tones[tone])}>
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-extrabold text-ink">{value}</div>
      {hint && <div className="text-xs text-stone-400">{hint}</div>}
    </Card>
  );
}
