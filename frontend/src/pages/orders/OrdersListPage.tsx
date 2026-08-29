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
import { Order } from "../../types/models";
import { listOrders, deleteOrder } from "../../services/order.service";
import OrderFormModal from "./OrderFormModal";

export default function OrdersListPage() {
  const { show } = useToast();
  const [rows, setRows] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState<Order | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listOrders({ page, limit, search: debouncedSearch || undefined });
      setRows(res.orders);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load orders."));
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
      await deleteOrder(deleting.id);
      show("Order deleted", "success");
      setDeleting(null);
      load();
    } catch (err) {
      show(getErrorMessage(err), "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns: Column<Order>[] = [
    { header: "Order #", accessor: (o) => <span className="font-medium text-text-primary">{o.order_number}</span> },
    { header: "Total", accessor: (o) => <CurrencyDisplay value={o.total_amount} currency={o.currency} /> },
    { header: "Status", accessor: (o) => <StatusBadge status={o.status} /> },
    { header: "Created", accessor: (o) => formatDate(o.created_at) },
    {
      header: "",
      className: "w-10",
      accessor: (o) => (
        <Dropdown
          trigger={
            <button className="rounded-md p-1.5 text-text-muted hover:bg-bg-elevated hover:text-text-secondary">
              <MoreHorizontal size={16} />
            </button>
          }
          items={[
            { label: "Edit", icon: <Pencil size={13} />, onClick: () => { setEditing(o); setFormOpen(true); } },
            { label: "Delete", icon: <Trash2 size={13} />, danger: true, onClick: () => setDeleting(o) },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Customer orders and their fulfillment status."
        action={
          <Button icon={<Plus size={15} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            New order
          </Button>
        }
      />
      <Card className="!p-0">
        <div className="flex items-center justify-between p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search orders…" />
        </div>
        <DataTable columns={columns} rows={rows} rowKey={(o) => o.id} loading={loading} error={error} onRetry={load} emptyTitle="No orders yet" />
        <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} />
      </Card>
      <OrderFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} order={editing} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete order?"
        description={`This will permanently remove order ${deleting?.order_number ?? ""}.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
