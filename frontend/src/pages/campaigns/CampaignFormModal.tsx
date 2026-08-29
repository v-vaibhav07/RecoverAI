import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import JsonEditor from "../../components/forms/JsonEditor";
import { Campaign } from "../../types/models";
import { CampaignStatus } from "../../types/enums";
import { createCampaign, updateCampaign, CampaignInput } from "../../services/campaign.service";
import { useToast } from "../../components/common/Toast";
import { getErrorMessage } from "../../utils/errors";

export default function CampaignFormModal({
  open,
  onClose,
  onSaved,
  campaign,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  campaign?: Campaign | null;
}) {
  const { show } = useToast();
  const [form, setForm] = useState<CampaignInput>({ name: "", status: "DRAFT" });
  const [targetCriteria, setTargetCriteria] = useState<Record<string, any> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (campaign) {
      setForm({
        name: campaign.name,
        description: campaign.description ?? "",
        status: campaign.status,
        startDate: campaign.start_date ?? undefined,
        endDate: campaign.end_date ?? undefined,
      });
      setTargetCriteria(campaign.target_criteria);
    } else {
      setForm({ name: "", status: "DRAFT" });
      setTargetCriteria(undefined);
    }
    setError(null);
  }, [campaign, open]);

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, targetCriteria };
      if (campaign) {
        await updateCampaign(campaign.id, payload);
        show("Campaign updated", "success");
      } else {
        await createCampaign(payload);
        show("Campaign created", "success");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={campaign ? "Edit campaign" : "New campaign"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {campaign ? "Save changes" : "Create campaign"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Select
          label="Status"
          value={form.status ?? "DRAFT"}
          onChange={(e) => setForm({ ...form, status: e.target.value as any })}
          options={CampaignStatus.map((s) => ({ label: s, value: s }))}
        />
        <Textarea label="Description" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start date" type="date" value={form.startDate?.slice(0, 10) ?? ""} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <Input label="End date" type="date" value={form.endDate?.slice(0, 10) ?? ""} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        </div>
        <JsonEditor label="Target criteria (JSON)" value={targetCriteria} onChange={setTargetCriteria} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
