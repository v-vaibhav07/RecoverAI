import { ReactNode } from "react";
import { motion } from "framer-motion";
import { TableSkeleton } from "../ui/Skeleton";
import EmptyState from "../ui/EmptyState";
import ErrorState from "../ui/ErrorState";
import { DURATION, EASE } from "../../lib/motion";

export interface Column<T> {
  header: string;
  accessor: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  onRetry,
  onRowClick,
  emptyTitle,
  emptyDescription,
}: DataTableProps<T>) {
  if (loading) return <TableSkeleton cols={columns.length} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (rows.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-bg-border">
            {columns.map((col, i) => (
              <th
                key={i}
                className={`px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-muted ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <motion.tr
              key={rowKey(row)}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.base, ease: EASE, delay: Math.min(index * 0.03, 0.3) }}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-bg-border last:border-b-0 ${
                onRowClick ? "cursor-pointer hover:bg-bg-elevated/60" : ""
              } transition-colors`}
            >
              {columns.map((col, i) => (
                <td key={i} className={`px-5 py-3.5 text-text-secondary ${col.className ?? ""}`}>
                  {col.accessor(row)}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
