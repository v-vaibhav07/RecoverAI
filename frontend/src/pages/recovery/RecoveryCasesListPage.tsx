import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable, { Column } from "../../components/tables/DataTable";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import CurrencyDisplay from "../../components/ui/CurrencyDisplay";
import BarChartCard, { BarDatum } from "../../components/charts/BarChartCard";
import { formatDate } from "../../utils/date";
import { getErrorMessage } from "../../utils/errors";
import { RecoveryCase } from "../../types/models";
import { listRecoveryCases } from "../../services/recovery.service";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "#94A3B8",
  ANALYZING: "#5FACFF",
  RECOVERABLE: "#5FACFF",
  ACTION_SCHEDULED: "#3395FF",
  IN_PROGRESS: "#3395FF",
  RECOVERED: "#16A34A",
  PARTIALLY_RECOVERED: "#F59E0B",
  FAILED: "#F87171",
  CLOSED: "#0C2651",
};

export default function RecoveryCasesListPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<RecoveryCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listRecoveryCases();
      setRows(res.recoveryCases);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load recovery cases."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const statusDistribution: BarDatum[] = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of rows) counts.set(c.status, (counts.get(c.status) ?? 0) + 1);
    return Array.from(counts.entries()).map(([name, value]) => ({
      name: name.replaceAll("_", " "),
      value,
      color: STATUS_COLORS[name] ?? "#3395FF",
    }));
  }, [rows]);

  const columns: Column<RecoveryCase>[] = [
    { header: "Customer", accessor: (c) => c.customers?.name ?? "—" },
    { header: "Recoverable", accessor: (c) => <CurrencyDisplay value={c.recoverable_amount} /> },
    { header: "Recovered", accessor: (c) => <CurrencyDisplay value={c.recovered_amount} /> },
    { header: "Priority", accessor: (c) => <StatusBadge status={c.priority} /> },
    { header: "Status", accessor: (c) => <StatusBadge status={c.status} /> },
    { header: "Opened", accessor: (c) => formatDate(c.created_at) },
  ];

  return (
    <div className="flex flex-col gap-6">
      {!loading && !error && rows.length > 0 && (
        <Card title="Case Status Distribution">
          <BarChartCard horizontal data={statusDistribution} />
        </Card>
      )}
      <Card className="!p-0">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          loading={loading}
          error={error}
          onRetry={load}
          onRowClick={(c) => navigate(`/recovery/cases/${c.id}`)}
          emptyTitle="No recovery cases yet"
          emptyDescription="Cases are created from failed payments."
        />
      </Card>
    </div>
  );
}
