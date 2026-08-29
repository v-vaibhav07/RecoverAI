import { useCallback, useEffect, useState } from "react";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/common/Button";
import DataTable, { Column } from "../../components/tables/DataTable";
import Pagination from "../../components/tables/Pagination";
import Card from "../../components/common/Card";
import Dropdown from "../../components/common/Dropdown";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { formatDate } from "../../utils/date";
import { getErrorMessage } from "../../utils/errors";
import { useToast } from "../../components/common/Toast";
import { CustomerSegment } from "../../types/models";
import { listCustomerSegments, deleteCustomerSegment } from "../../services/customerSegment.service";
import CustomerSegmentFormModal from "./CustomerSegmentFormModal";

export default function CustomerSegmentsListPage() {
  const { show } = useToast();
  const [rows, setRows] = useState<CustomerSegment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerSegment | null>(null);
  const [deleting, setDeleting] = useState<CustomerSegment | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCustomerSegments({ page, limit });
      setRows(res.segments);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load segments."));
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      await deleteCustomerSegment(deleting.id);
      show("Segment deleted", "success");
      setDeleting(null);
      load();
    } catch (err) {
      show(getErrorMessage(err), "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns: Column<CustomerSegment>[] = [
    { header: "Name", accessor: (s) => <span className="font-medium text-text-primary">{s.name}</span> },
    { header: "Description", accessor: (s) => s.description ?? "—" },
    { header: "Created", accessor: (s) => formatDate(s.created_at) },
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
      <PageHeader
        title="Customer Segments"
        description="Custom groupings of customers, defined by free-form criteria."
        action={
          <Button icon={<Plus size={15} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            New segment
          </Button>
        }
      />
      <Card className="!p-0">
        <DataTable columns={columns} rows={rows} rowKey={(s) => s.id} loading={loading} error={error} onRetry={load} emptyTitle="No segments yet" />
        <Pagination page={page} totalPages={totalPages} total={total} limit={limit} onPageChange={setPage} />
      </Card>
      <CustomerSegmentFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} segment={editing} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete segment?"
        description={`This will permanently remove ${deleting?.name ?? "this segment"}.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
