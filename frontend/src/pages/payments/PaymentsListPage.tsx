import { useCallback, useEffect, useState } from "react";
import DataTable, { Column } from "../../components/tables/DataTable";
import Card from "../../components/common/Card";
import CurrencyDisplay from "../../components/ui/CurrencyDisplay";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDateTime } from "../../utils/date";
import { getErrorMessage } from "../../utils/errors";
import { Payment } from "../../types/models";
import { listPayments } from "../../services/payment.service";
import PaymentDetailModal from "./PaymentDetailModal";

export default function PaymentsListPage() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Payment | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listPayments();
      setRows(res.payments);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load payments."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const columns: Column<Payment>[] = [
    { header: "Customer", accessor: (p) => p.customers?.name ?? "—" },
    { header: "Amount", accessor: (p) => <CurrencyDisplay value={p.amount} currency={p.currency} /> },
    { header: "Provider", accessor: (p) => p.provider ?? "—" },
    { header: "Status", accessor: (p) => <StatusBadge status={p.status} /> },
    { header: "Date", accessor: (p) => formatDateTime(p.created_at) },
  ];

  return (
    <div>
      <Card className="!p-0">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(p) => p.id}
          loading={loading}
          error={error}
          onRetry={load}
          onRowClick={setSelected}
          emptyTitle="No payments yet"
        />
      </Card>
      <PaymentDetailModal open={Boolean(selected)} onClose={() => setSelected(null)} payment={selected} />
    </div>
  );
}
