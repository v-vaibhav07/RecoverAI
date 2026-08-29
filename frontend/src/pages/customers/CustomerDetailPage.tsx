import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import RecoverLoader from "../../components/ui/RecoverLoader";
import ErrorState from "../../components/ui/ErrorState";
import StatusBadge from "../../components/ui/StatusBadge";
import CurrencyDisplay from "../../components/ui/CurrencyDisplay";
import JsonViewer from "../../components/ui/JsonViewer";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { formatDateTime } from "../../utils/date";
import { Customer } from "../../types/models";
import { getCustomer, deleteCustomer } from "../../services/customer.service";
import { getErrorMessage } from "../../utils/errors";
import { useToast } from "../../components/common/Toast";
import CustomerFormModal from "./CustomerFormModal";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getCustomer(id);
      setCustomer(res.customer);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load this customer."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await deleteCustomer(id);
      show("Customer deleted", "success");
      navigate("/customers");
    } catch (err) {
      show(getErrorMessage(err), "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) return <RecoverLoader variant="page" size="md" />;
  if (error || !customer) return <ErrorState message={error ?? "Customer not found."} onRetry={load} />;

  return (
    <div>
      <button
        onClick={() => navigate("/customers")}
        className="mb-3 flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft size={14} /> Back to customers
      </button>
      <PageHeader
        title={customer.name}
        description={customer.email ?? undefined}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<Pencil size={14} />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="Overview" className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <Field label="Status" value={<StatusBadge status={customer.status} />} />
            <Field label="Phone" value={customer.phone ?? "—"} />
            <Field label="Country" value={customer.country ?? "—"} />
            <Field label="External ID" value={customer.external_customer_id ?? "—"} />
            <Field label="Created" value={formatDateTime(customer.created_at)} />
            <Field label="Updated" value={formatDateTime(customer.updated_at)} />
          </div>
          <div className="mt-5">
            <p className="mb-1.5 text-xs text-text-muted">Metadata</p>
            <JsonViewer data={customer.metadata} />
          </div>
        </Card>

        <Card title="Payment Summary">
          <div className="flex flex-col gap-4">
            <Field label="Lifetime value" value={<CurrencyDisplay value={customer.lifetime_value} />} />
            <Field label="Total transactions" value={customer.total_transactions} />
            <Field label="Successful payments" value={customer.successful_payments} />
            <Field label="Failed payments" value={customer.failed_payments} />
            <Field label="Recovered payments" value={customer.recovered_payments} />
            <Field
              label="Total recovered amount"
              value={<CurrencyDisplay value={customer.total_recovered_amount} />}
            />
          </div>
        </Card>
      </div>

      <CustomerFormModal open={editOpen} onClose={() => setEditOpen(false)} onSaved={load} customer={customer} />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete customer?"
        description={`This will permanently remove ${customer.name}.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
