// Shared tooltip renderer for all Recharts instances — styled to match the
// rest of the UI (white card, subtle border, no default Recharts chrome).
export function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-bg-border bg-bg-surface px-3 py-2 shadow-popover">
      {label !== undefined && <p className="mb-1 text-xs font-medium text-text-primary">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-text-secondary">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color ?? entry.fill }} />
          <span>{entry.name}:</span>
          <span className="font-medium text-text-primary">
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
