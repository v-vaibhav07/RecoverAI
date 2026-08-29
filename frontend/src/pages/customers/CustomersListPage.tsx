import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useToast } from "../../components/common/Toast";
import { getErrorMessage } from "../../utils/errors";
import { Customer } from "../../types/models";
import { listCustomers, deleteCustomer } from "../../services/customer.service";
import CustomerFormModal from "./CustomerFormModal";

export default function CustomersListPage() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [rows, setRows] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCustomers({ page, limit, search: debouncedSearch || undefined });
      setRows(res.customers);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load customers."));
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
      await deleteCustomer(deleting.id);
      show("Customer deleted", "success");
      setDeleting(null);
      load();
    } catch (err) {
      show(getErrorMessage(err), "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns: Column<Customer>[] = [
    { header: "Name", accessor: (c) => <span className="font-medium text-text-primary">{c.name}</span> },
    { header: "Email", accessor: (c) => c.email ?? "—" },
    { header: "Country", accessor: (c) => c.country ?? "—" },
    { header: "Lifetime Value", accessor: (c) => <CurrencyDisplay value={c.lifetime_value} /> },
    { header: "Status", accessor: (c) => <StatusBadge status={c.status} /> },
    { header: "Created", accessor: (c) => formatDate(c.created_at) },
    {
      header: "",
      className: "w-10",
      accessor: (c) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={
              <button className="rounded-md p-1.5 text-text-muted hover:bg-bg-elevated hover:text-text-secondary">
                <MoreHorizontal size={16} />
              </button>
            }
            items={[
              {
                label: "Edit",
                icon: <Pencil size={13} />,
                onClick: () => {
                  setEditing(c);
                  setFormOpen(true);
                },
              },
              {
                label: "Delete",
                icon: <Trash2 size={13} />,
                danger: true,
                onClick: () => setDeleting(c),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Everyone who has ever paid or attempted to pay."
        action={
          <Button
            icon={<Plus size={15} />}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            New customer
          </Button>
        }
      />
      <Card className="!p-0">
        <div className="flex items-center justify-between p-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search customers…" />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          loading={loading}
          error={error}
          onRetry={load}
          onRowClick={(c) => navigate(`/customers/${c.id}`)}
          emptyTitle="No customers yet"
          emptyDescription="Customers will appear here once created."
        />
        <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} />
      </Card>

      <CustomerFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={load}
        customer={editing}
      />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete customer?"
        description={`This will permanently remove ${deleting?.name ?? "this customer"}.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
