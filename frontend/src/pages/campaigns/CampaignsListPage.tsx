import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/common/Button";
import DataTable, { Column } from "../../components/tables/DataTable";
import Card from "../../components/common/Card";
import Dropdown from "../../components/common/Dropdown";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDate } from "../../utils/date";
import { getErrorMessage } from "../../utils/errors";
import { useToast } from "../../components/common/Toast";
import { Campaign } from "../../types/models";
import { listCampaigns, deleteCampaign } from "../../services/campaign.service";
import CampaignFormModal from "./CampaignFormModal";

export default function CampaignsListPage() {
  const navigate = useNavigate();
  const { show } = useToast();
  const [rows, setRows] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState<Campaign | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCampaigns();
      setRows(res.campaigns);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load campaigns."));
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
      await deleteCampaign(deleting.id);
      show("Campaign deleted", "success");
      setDeleting(null);
      load();
    } catch (err) {
      show(getErrorMessage(err), "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  const columns: Column<Campaign>[] = [
    { header: "Name", accessor: (c) => <span className="font-medium text-text-primary">{c.name}</span> },
    { header: "Status", accessor: (c) => <StatusBadge status={c.status} /> },
    { header: "Start", accessor: (c) => formatDate(c.start_date) },
    { header: "End", accessor: (c) => formatDate(c.end_date) },
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
              { label: "Edit", icon: <Pencil size={13} />, onClick: () => { setEditing(c); setFormOpen(true); } },
              { label: "Delete", icon: <Trash2 size={13} />, danger: true, onClick: () => setDeleting(c) },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Campaigns"
        description="Bulk recovery outreach across many customers at once."
        action={
          <Button icon={<Plus size={15} />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            New campaign
          </Button>
        }
      />
      <Card className="!p-0">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          loading={loading}
          error={error}
          onRetry={load}
          onRowClick={(c) => navigate(`/campaigns/${c.id}`)}
          emptyTitle="No campaigns yet"
        />
      </Card>
      <CampaignFormModal open={formOpen} onClose={() => setFormOpen(false)} onSaved={load} campaign={editing} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete campaign?"
        description={`This will permanently remove ${deleting?.name ?? "this campaign"}.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
