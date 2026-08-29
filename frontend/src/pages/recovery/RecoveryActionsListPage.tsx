import { useCallback, useEffect, useState } from "react";
import DataTable, { Column } from "../../components/tables/DataTable";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDateTime } from "../../utils/date";
import { getErrorMessage } from "../../utils/errors";
import { RecoveryAction } from "../../types/models";
import { listRecoveryActions } from "../../services/recoveryAction.service";

export default function RecoveryActionsListPage() {
  const [rows, setRows] = useState<RecoveryAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listRecoveryActions();
      setRows(res.recoveryActions);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load recovery actions."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns: Column<RecoveryAction>[] = [
    { header: "Action type", accessor: (a) => a.action_type.replaceAll("_", " ") },
    { header: "Attempt #", accessor: (a) => a.attempt_number },
    { header: "Status", accessor: (a) => <StatusBadge status={a.status} /> },
    { header: "Scheduled", accessor: (a) => formatDateTime(a.scheduled_at) },
    { header: "Completed", accessor: (a) => formatDateTime(a.completed_at) },
    { header: "Result", accessor: (a) => a.result ?? "—" },
  ];

  return (
    <div>
      <Card className="!p-0">
        <DataTable columns={columns} rows={rows} rowKey={(a) => a.id} loading={loading} error={error} onRetry={load} emptyTitle="No recovery actions yet" />
      </Card>
    </div>
  );
}
