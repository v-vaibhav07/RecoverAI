import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Plus, PlayCircle } from "lucide-react";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import RecoverLoader from "../../components/ui/RecoverLoader";
import ErrorState from "../../components/ui/ErrorState";
import EmptyState from "../../components/ui/EmptyState";
import StatusBadge from "../../components/ui/StatusBadge";
import JsonViewer from "../../components/ui/JsonViewer";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { formatDate, formatDateTime } from "../../utils/date";
import { Campaign, CampaignAction } from "../../types/models";
import { getCampaign, deleteCampaign } from "../../services/campaign.service";
import { listCampaignActionsByCampaign, processCampaignAction } from "../../services/campaignAction.service";
import { getErrorMessage } from "../../utils/errors";
import { useToast } from "../../components/common/Toast";
import CampaignFormModal from "./CampaignFormModal";
import CampaignActionFormModal from "./CampaignActionFormModal";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [actions, setActions] = useState<CampaignAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionFormOpen, setActionFormOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [campaignRes, actionsRes] = await Promise.all([getCampaign(id), listCampaignActionsByCampaign(id)]);
      setCampaign(campaignRes.campaign);
      setActions(actionsRes.campaignActions);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load this campaign."));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleProcess(action: CampaignAction) {
    setProcessingId(action.id);
    try {
      const res = await processCampaignAction(action.id);
      show(
        `Processed — recovery action ${res.processResult.recoveryActionId.slice(0, 8)}… scheduled`,
        "success"
      );
      load();
    } catch (err) {
      show(getErrorMessage(err, "Couldn't process this campaign action."), "error");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete() {
    if (!id) return;
    setDeleteLoading(true);
    try {
      await deleteCampaign(id);
      show("Campaign deleted", "success");
      navigate("/campaigns");
    } catch (err) {
      show(getErrorMessage(err), "error");
    } finally {
      setDeleteLoading(false);
    }
  }

  if (loading) return <RecoverLoader variant="page" size="md" />;
  if (error || !campaign) return <ErrorState message={error ?? "Campaign not found."} onRetry={load} />;

  return (
    <div>
      <button
        onClick={() => navigate("/campaigns")}
        className="mb-3 flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft size={14} /> Back to campaigns
      </button>
      <PageHeader
        title={campaign.name}
        description={campaign.description ?? undefined}
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

      <Card title="Overview">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <Field label="Status" value={<StatusBadge status={campaign.status} />} />
          <Field label="Start date" value={formatDate(campaign.start_date)} />
          <Field label="End date" value={formatDate(campaign.end_date)} />
          <Field label="Created" value={formatDateTime(campaign.created_at)} />
        </div>
        <div className="mt-5">
          <p className="mb-1.5 text-xs text-text-muted">Target criteria</p>
          <JsonViewer data={campaign.target_criteria} />
        </div>
      </Card>

      <Card
        title="Campaign Actions"
        className="mt-6"
        action={
          <Button size="sm" icon={<Plus size={14} />} onClick={() => setActionFormOpen(true)}>
            New action
          </Button>
        }
      >
        {actions.length > 0 ? (
          <div className="flex flex-col divide-y divide-bg-border">
            {actions.map((a) => {
              const canProcess = a.status === "PENDING" && Boolean(a.recovery_case_id);
              return (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{a.action}</p>
                    <p className="text-xs text-text-muted">{formatDateTime(a.created_at)}</p>
                    {a.status === "PENDING" && !a.recovery_case_id && (
                      <p className="mt-0.5 text-xs text-amber-600">No linked recovery case — can't be processed</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {canProcess && (
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<PlayCircle size={13} />}
                        loading={processingId === a.id}
                        onClick={() => handleProcess(a)}
                      >
                        Process
                      </Button>
                    )}
                    <StatusBadge status={a.status} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No campaign actions yet" />
        )}
      </Card>

      <CampaignFormModal open={editOpen} onClose={() => setEditOpen(false)} onSaved={load} campaign={campaign} />
      <CampaignActionFormModal
        open={actionFormOpen}
        onClose={() => setActionFormOpen(false)}
        onSaved={load}
        campaignId={campaign.id}
      />
      <ConfirmDialog
        open={deleteOpen}
        title="Delete campaign?"
        description={`This will permanently remove ${campaign.name}.`}
        confirmLabel="Delete"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
