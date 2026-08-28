interface BadgeProps {
  children: React.ReactNode;
  color?: "slate" | "green" | "red" | "yellow" | "blue" | "purple";
  className?: string;
}

// Light-theme pastel pill palette — solid tinted background + darker text,
// rather than the low-opacity-on-black trick used in dark themes.
const colorClasses: Record<string, string> = {
  slate: "bg-slate-100 text-text-muted border-slate-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  red: "bg-rose-50 text-rose-700 border-rose-200",
  yellow: "bg-amber-50 text-amber-700 border-amber-200",
  blue: "bg-brand-50 text-brand-dark border-brand-100",
  purple: "bg-violet-50 text-violet-700 border-violet-200",
};

export default function Badge({ children, color = "slate", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${colorClasses[color]} ${className}`}
    >
      {children}
    </span>
  );
}
