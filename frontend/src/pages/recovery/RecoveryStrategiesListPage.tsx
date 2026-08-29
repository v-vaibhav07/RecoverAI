import { useCallback, useEffect, useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Button from "../../components/common/Button";
import DataTable, { Column } from "../../components/tables/DataTable";
import Card from "../../components/common/Card";
import Dropdown from "../../components/common/Dropdown";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Badge from "../../components/common/Badge";
import { getErrorMessage } from "../../utils/errors";
import { useToast } from "../../components/common/Toast";
import { RecoveryStrategy } from "../../types/models";
import { listRecoveryStrategies, deleteRecoveryStrategy } from "../../services/recoveryStrategy.service";
import RecoveryStrategyFormModal from "./RecoveryStrategyFormModal";

export default function RecoveryStrategiesListPage() {
  const { show } = useToast();
  const [rows, setRows] = useState<RecoveryStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecoveryStrategy | null>(null);
  const [deleting, setDeleting] = useState<RecoveryStrategy | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listRecoveryStrategies();
      setRows(res.recoveryStrategies);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load recovery strategies."));
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
      await deleteRecoveryStrategy(deleting.id);
      show("Strategy deleted", "success");
      setDeleting(null);
      load();
    } catch (err) {
      show(getErrorMessage(err), "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns: Column<RecoveryStrategy>[] = [
    { header: "Name", accessor: (s) => <span className="font-medium text-text-primary">{s.name}</span> },
    { header: "Type", accessor: (s) => s.type.replaceAll("_", " ") },
    { header: "Active", accessor: (s) => (s.is_active ? <Badge color="green">Active</Badge> : <Badge color="slate">Inactive</Badge>) },
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
            { label: "Delete", icon: <Trash2 size={13} />, danger: true, onClick: () => setDeleting(s) },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button icon={<Plus size={15} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
          New strategy
        </Button>
      </div>
      <Card className="!p-0">
        <DataTable columns={columns} rows={rows} rowKey={(s) => s.id} loading={loading} error={error} onRetry={load} emptyTitle="No strategies yet" />
      </Card>
      <RecoveryStrategyFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} strategy={editing} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete strategy?"
        description={`This will permanently remove ${deleting?.name ?? "this strategy"}.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
