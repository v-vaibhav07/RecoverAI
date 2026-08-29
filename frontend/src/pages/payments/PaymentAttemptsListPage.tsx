import { useCallback, useEffect, useState } from "react";
import DataTable, { Column } from "../../components/tables/DataTable";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import CurrencyDisplay from "../../components/ui/CurrencyDisplay";
import { formatDateTime } from "../../utils/date";
import { getErrorMessage } from "../../utils/errors";
import { PaymentAttempt } from "../../types/models";
import { listPaymentAttempts } from "../../services/paymentAttempt.service";

export default function PaymentAttemptsListPage() {
  const [rows, setRows] = useState<PaymentAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listPaymentAttempts();
      setRows(res.paymentAttempts);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load payment attempts."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns: Column<PaymentAttempt>[] = [
    { header: "Attempt #", accessor: (a) => a.attempt_number },
    { header: "Amount", accessor: (a) => <CurrencyDisplay value={a.amount} /> },
    { header: "Provider", accessor: (a) => a.provider ?? "—" },
    { header: "Status", accessor: (a) => <StatusBadge status={a.status} /> },
    { header: "Failure category", accessor: (a) => a.failure_category?.replaceAll("_", " ") ?? "—" },
    { header: "Started", accessor: (a) => formatDateTime(a.started_at) },
  ];

  return (
    <div>
      <Card className="!p-0">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(a) => a.id}
          loading={loading}
          error={error}
          onRetry={load}
          emptyTitle="No payment attempts recorded"
        />
      </Card>
    </div>
  );
}
