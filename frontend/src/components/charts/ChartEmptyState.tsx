import { BarChart3 } from "lucide-react";

export function ChartEmptyState({ label = "No data yet", height = 220 }: { label?: string; height?: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 text-text-muted"
      style={{ height }}
    >
      <BarChart3 size={22} className="text-bg-border" />
      <p className="text-xs">{label}</p>
    </div>
  );
}
