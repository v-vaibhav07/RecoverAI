import Badge from "../common/Badge";

// Maps every status/enum string used across the app to a badge color.
// Falls back to slate for anything unrecognized (e.g. free-text order.status).
const STATUS_COLOR_MAP: Record<string, "green" | "red" | "yellow" | "blue" | "purple" | "slate"> = {
  // generic success/positive
  ACTIVE: "green",
  SUCCESS: "green",
  RECOVERED: "green",
  COMPLETED: "green",
  DELIVERED: "green",
  SENT: "blue",
  PROCESSED: "blue",
  HEALTHY: "green",
  POSITIVE: "green",
  // in progress / neutral
  PENDING: "yellow",
  PROCESSING: "blue",
  SCHEDULED: "blue",
  RUNNING: "blue",
  IN_PROGRESS: "blue",
  ANALYZING: "blue",
  RECOVERABLE: "blue",
  ACTION_SCHEDULED: "blue",
  PARTIALLY_RECOVERED: "yellow",
  DRAFT: "slate",
  CREATED: "slate",
  OPEN: "yellow",
  WARNING: "yellow",
  NEUTRAL: "slate",
  PAUSED: "yellow",
  PAST_DUE: "yellow",
  ABANDONED: "yellow",
  // negative
  FAILED: "red",
  CANCELLED: "red",
  EXPIRED: "red",
  SUSPENDED: "red",
  INACTIVE: "slate",
  CRITICAL: "red",
  HIGH: "yellow",
  SKIPPED: "slate",
  REFUNDED: "purple",
  CLOSED: "slate",
  NEGATIVE: "red",
  LOW: "slate",
  MEDIUM: "blue",
};

export default function StatusBadge({ status }: { status: string | null | undefined }) {
  if (!status) return <Badge color="slate">—</Badge>;
  const color = STATUS_COLOR_MAP[status] ?? "slate";
  return <Badge color={color}>{status.replaceAll("_", " ")}</Badge>;
}
