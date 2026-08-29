import { useCallback, useEffect, useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/tables/SearchInput";
import DataTable, { Column } from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import Card from "../../components/common/Card";
import StatusBadge from "../../components/ui/StatusBadge";
import CurrencyDisplay from "../../components/ui/CurrencyDisplay";
import { formatDateTime } from "../../utils/date";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { getErrorMessage } from "../../utils/errors";
import { CheckoutSession } from "../../types/models";
import { listCheckoutSessions } from "../../services/checkoutSession.service";

export default function CheckoutSessionsListPage() {
  const [rows, setRows] = useState<CheckoutSession[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCheckoutSessions({ page, limit, search: debouncedSearch || undefined });
      setRows(res.checkoutSessions);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load checkout sessions."));
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const columns: Column<CheckoutSession>[] = [
    { header: "Amount", accessor: (s) => <CurrencyDisplay value={s.amount} currency={s.currency} /> },
    { header: "Status", accessor: (s) => <StatusBadge status={s.status} /> },
    { header: "Started", accessor: (s) => formatDateTime(s.started_at) },
    { header: "Last activity", accessor: (s) => formatDateTime(s.last_activity_at) },
    { header: "Expires", accessor: (s) => formatDateTime(s.expires_at) },
  ];

  return (
    <div>
      <PageHeader title="Checkout Sessions" description="In-progress and abandoned checkout attempts." />
      <Card className="!p-0">
        <div className="flex items-center justify-between p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search checkout sessions…" />
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(s) => s.id} loading={loading} error={error} onRetry={load} emptyTitle="No checkout sessions yet" />
        <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} />
      </Card>
    </div>
  );
}
