import { useState } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { createCampaignAction } from "../../services/campaignAction.service";
import { useToast } from "../../components/common/Toast";
import { getErrorMessage } from "../../utils/errors";

export default function CampaignActionFormModal({
  open,
  onClose,
  onSaved,
  campaignId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  campaignId: string;
}) {
  const { show } = useToast();
  const [action, setAction] = useState("");
  const [recoveryCaseId, setRecoveryCaseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!action.trim()) {
      setError("Action is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createCampaignAction({ campaignId, action, recoveryCaseId: recoveryCaseId || undefined });
      show("Campaign action created", "success");
      setAction("");
      setRecoveryCaseId("");
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
      title="New campaign action"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Create action
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Action" value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g. SEND_REMINDER" />
        <Input
          label="Recovery case ID (optional)"
          value={recoveryCaseId}
          onChange={(e) => setRecoveryCaseId(e.target.value)}
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
