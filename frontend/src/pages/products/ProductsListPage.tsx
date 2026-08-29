import { useCallback, useEffect, useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/common/Button";
import DataTable, { Column } from "../../components/tables/DataTable";
import Card from "../../components/common/Card";
import Dropdown from "../../components/common/Dropdown";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CurrencyDisplay from "../../components/ui/CurrencyDisplay";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDate } from "../../utils/date";
import { useToast } from "../../components/common/Toast";
import { getErrorMessage } from "../../utils/errors";
import { Product } from "../../types/models";
import { listProducts, deleteProduct } from "../../services/product.service";
import ProductFormModal from "./ProductFormModal";

export default function ProductsListPage() {
  const { show } = useToast();
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listProducts();
      setRows(res.products);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load products."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteProduct(deleting.id);
      show("Product deleted", "success");
      setDeleting(null);
      load();
    } catch (err) {
      show(getErrorMessage(err), "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns: Column<Product>[] = [
    { header: "Name", accessor: (p) => <span className="font-medium text-text-primary">{p.name}</span> },
    { header: "Price", accessor: (p) => <CurrencyDisplay value={p.price} currency={p.currency} /> },
    { header: "Status", accessor: (p) => <StatusBadge status={p.status} /> },
    { header: "Created", accessor: (p) => formatDate(p.created_at) },
    {
      header: "",
      className: "w-10",
      accessor: (p) => (
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
                setEditing(p);
                setFormOpen(true);
              },
            },
            { label: "Delete", icon: <Trash2 size={13} />, danger: true, onClick: () => setDeleting(p) },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        description="Products and price points customers subscribe to or purchase."
        action={
          <Button
            icon={<Plus size={15} />}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            New product
          </Button>
        }
      />
      <Card className="!p-0">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(p) => p.id}
          loading={loading}
          error={error}
          onRetry={load}
          emptyTitle="No products yet"
        />
      </Card>
      <ProductFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} product={editing} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete product?"
        description={`This will permanently remove ${deleting?.name ?? "this product"}.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
