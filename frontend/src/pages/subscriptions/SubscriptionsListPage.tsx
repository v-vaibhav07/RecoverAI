import { useCallback, useEffect, useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2, Ban } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/common/Button";
import DataTable, { Column } from "../../components/tables/DataTable";
import Card from "../../components/common/Card";
import Dropdown from "../../components/common/Dropdown";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CurrencyDisplay from "../../components/ui/CurrencyDisplay";
import StatusBadge from "../../components/ui/StatusBadge";
import { getErrorMessage } from "../../utils/errors";
import { useToast } from "../../components/common/Toast";
import { Subscription } from "../../types/models";
import { listSubscriptions, deleteSubscription, cancelSubscription } from "../../services/subscription.service";
import SubscriptionFormModal from "./SubscriptionFormModal";

export default function SubscriptionsListPage() {
  const { show } = useToast();
  const [rows, setRows] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const [deleting, setDeleting] = useState<Subscription | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listSubscriptions();
      setRows(res.subscriptions);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load subscriptions."));
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
      await deleteSubscription(deleting.id);
      show("Subscription deleted", "success");
      setDeleting(null);
      load();
    } catch (err) {
      show(getErrorMessage(err), "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleCancel(s: Subscription) {
    try {
      await cancelSubscription(s.id);
      show("Subscription cancelled", "success");
      load();
    } catch (err) {
      show(getErrorMessage(err), "error");
    }
  }

  const columns: Column<Subscription>[] = [
    { header: "Customer", accessor: (s) => s.customers?.name ?? "—" },
    { header: "Plan", accessor: (s) => s.plan_name ?? "—" },
    { header: "Amount", accessor: (s) => <CurrencyDisplay value={s.amount} currency={s.currency} /> },
    { header: "Interval", accessor: (s) => s.billing_interval },
    { header: "Status", accessor: (s) => <StatusBadge status={s.status} /> },
    {
      header: "",
      className: "w-10",
      accessor: (s) => (
        <Dropdown
          trigger={
            <button className="rounded-md p-1.5 text-text-muted hover:bg-bg-elevated hover:text-text-secondary">
              <MoreHorizontal size={16} />
            </button>
          }
          items={[
            { label: "Edit", icon: <Pencil size={13} />, onClick: () => { setEditing(s); setFormOpen(true); } },
            { label: "Cancel", icon: <Ban size={13} />, onClick: () => handleCancel(s) },
            { label: "Delete", icon: <Trash2 size={13} />, danger: true, onClick: () => setDeleting(s) },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        description="Recurring billing agreements per customer."
        action={
          <Button icon={<Plus size={15} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            New subscription
          </Button>
        }
      />
      <Card className="!p-0">
        <DataTable columns={columns} rows={rows} rowKey={(s) => s.id} loading={loading} error={error} onRetry={load} emptyTitle="No subscriptions yet" />
      </Card>
      <SubscriptionFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} subscription={editing} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete subscription?"
        description="This will permanently remove this subscription."
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
