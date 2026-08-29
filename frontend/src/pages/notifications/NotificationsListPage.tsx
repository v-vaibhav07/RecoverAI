import { useCallback, useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import DataTable, { Column } from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import Badge from "../../components/common/Badge";
import { formatDateTime } from "../../utils/date";
import { getErrorMessage } from "../../utils/errors";
import { Notification } from "../../types/models";
import { listNotifications } from "../../services/notification.service";

export default function NotificationsListPage() {
  const [rows, setRows] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listNotifications({ page, limit });
      setRows(res.notifications);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load notifications."));
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  const columns: Column<Notification>[] = [
    { header: "Channel", accessor: (n) => <Badge color="blue">{n.channel}</Badge> },
    { header: "Recipient", accessor: (n) => n.recipient ?? "—" },
    { header: "Subject", accessor: (n) => n.subject ?? n.template ?? "—" },
    { header: "Status", accessor: (n) => <StatusBadge status={n.status} /> },
    { header: "Created", accessor: (n) => formatDateTime(n.created_at) },
  ];

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Delivery status of customer notifications. There is no read/unread flag in the backend — status reflects delivery state (pending, sent, delivered, failed, cancelled)."
      />
      <Card className="!p-0">
        <DataTable columns={columns} rows={rows} rowKey={(n) => n.id} loading={loading} error={error} onRetry={load} emptyTitle="No notifications yet" />
        <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} />
      </Card>
    </div>
  );
}
