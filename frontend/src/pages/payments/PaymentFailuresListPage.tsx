import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable, { Column } from "../../components/tables/DataTable";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import Badge from "../../components/common/Badge";
import DonutChart, { DonutDatum, DONUT_PALETTE } from "../../components/charts/DonutChart";
import { formatDateTime } from "../../utils/date";
import { getErrorMessage } from "../../utils/errors";
import { PaymentFailure } from "../../types/models";
import { listPaymentFailures } from "../../services/paymentFailure.service";

export default function PaymentFailuresListPage() {
  const [rows, setRows] = useState<PaymentFailure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listPaymentFailures();
      setRows(res.paymentFailures);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load payment failures."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categoryDistribution: DonutDatum[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of rows) counts.set(f.failure_category, (counts.get(f.failure_category) ?? 0) + 1);
    return Array.from(counts.entries()).map(([name, value], i) => ({
      name: name.replaceAll("_", " "),
      value,
      color: DONUT_PALETTE[i % DONUT_PALETTE.length],
    }));
  }, [rows]);

  const columns: Column<PaymentFailure>[] = [
    { header: "Category", accessor: (f) => <Badge color="slate">{f.failure_category.replaceAll("_", " ")}</Badge> },
    { header: "Reason", accessor: (f) => f.failure_reason ?? "—" },
    { header: "Severity", accessor: (f) => <StatusBadge status={f.severity} /> },
    { header: "Retryable", accessor: (f) => (f.retryable ? <Badge color="green">Yes</Badge> : <Badge color="red">No</Badge>) },
    { header: "Provider", accessor: (f) => f.provider ?? "—" },
    { header: "Occurred", accessor: (f) => formatDateTime(f.created_at) },
  ];

  return (
    <div className="flex flex-col gap-6">
      {!loading && !error && rows.length > 0 && (
        <Card title="Failure Category Breakdown">
          <DonutChart data={categoryDistribution} />
        </Card>
      )}
      <Card className="!p-0">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(f) => f.id}
          loading={loading}
          error={error}
          onRetry={load}
          emptyTitle="No payment failures recorded"
        />
      </Card>
    </div>
  );
}
