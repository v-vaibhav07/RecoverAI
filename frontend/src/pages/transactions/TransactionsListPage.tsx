import { useCallback, useEffect, useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/common/Button";
import SearchInput from "../../components/tables/SearchInput";
import DataTable, { Column } from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import Card from "../../components/common/Card";
import Dropdown from "../../components/common/Dropdown";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CurrencyDisplay from "../../components/ui/CurrencyDisplay";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDate } from "../../utils/date";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { getErrorMessage } from "../../utils/errors";
import { useToast } from "../../components/common/Toast";
import { Transaction } from "../../types/models";
import { listTransactions, deleteTransaction } from "../../services/transaction.service";
import TransactionFormModal from "./TransactionFormModal";

export default function TransactionsListPage() {
  const { show } = useToast();
  const [rows, setRows] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listTransactions({ page, limit, search: debouncedSearch || undefined });
      setRows(res.transactions);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load transactions."));
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

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteTransaction(deleting.id);
      show("Transaction deleted", "success");
      setDeleting(null);
      load();
    } catch (err) {
      show(getErrorMessage(err), "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns: Column<Transaction>[] = [
    { header: "Type", accessor: (t) => t.type },
    { header: "Amount", accessor: (t) => <CurrencyDisplay value={t.amount} currency={t.currency} /> },
    { header: "Status", accessor: (t) => <StatusBadge status={t.status} /> },
    { header: "External ID", accessor: (t) => t.external_transaction_id ?? "—" },
    { header: "Created", accessor: (t) => formatDate(t.created_at) },
    {
      header: "",
      className: "w-10",
      accessor: (t) => (
        <Dropdown
          trigger={
            <button className="rounded-md p-1.5 text-text-muted hover:bg-bg-elevated hover:text-text-secondary">
              <MoreHorizontal size={16} />
            </button>
          }
          items={[
            { label: "Edit", icon: <Pencil size={13} />, onClick: () => { setEditing(t); setFormOpen(true); } },
            { label: "Delete", icon: <Trash2 size={13} />, danger: true, onClick: () => setDeleting(t) },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Every payment, refund, and adjustment transaction."
        action={
          <Button icon={<Plus size={15} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            New transaction
          </Button>
        }
      />
      <Card className="!p-0">
        <div className="flex items-center justify-between p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search transactions…" />
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(t) => t.id} loading={loading} error={error} onRetry={load} emptyTitle="No transactions yet" />
        <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} />
      </Card>
      <TransactionFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} transaction={editing} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete transaction?"
        description="This will permanently remove this transaction."
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
