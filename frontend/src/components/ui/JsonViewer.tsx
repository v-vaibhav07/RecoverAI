import { useState } from "react";
import { ChevronRight } from "lucide-react";

export default function JsonViewer({ data, label }: { data: any; label?: string }) {
  const [open, setOpen] = useState(false);
  const isEmpty =
    data === null ||
    data === undefined ||
    (typeof data === "object" && Object.keys(data).length === 0);

  if (isEmpty) {
    return <span className="text-xs text-text-muted">—</span>;
  }

  return (
    <div className="rounded-lg border border-bg-border bg-bg-surface">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-xs font-medium text-text-muted transition-colors hover:text-text-primary"
      >
        <ChevronRight size={13} className={`transition-transform ${open ? "rotate-90" : ""}`} />
        {label ?? "View JSON"}
      </button>
      {open && (
        <pre className="max-h-72 overflow-auto border-t border-bg-border px-3 py-2 text-xs text-text-secondary">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}
