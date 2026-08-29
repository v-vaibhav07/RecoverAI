import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { RecoveryCase } from "../../types/models";
import { RecoveryStatus, RecoveryPriority } from "../../types/enums";
import { updateRecoveryCase, RecoveryCaseUpdateInput } from "../../services/recovery.service";
import { useToast } from "../../components/common/Toast";
import { getErrorMessage } from "../../utils/errors";

export default function RecoveryCaseEditModal({
  open,
  onClose,
  onSaved,
  recoveryCase,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  recoveryCase: RecoveryCase;
}) {
  const { show } = useToast();
  const [form, setForm] = useState<RecoveryCaseUpdateInput>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      status: recoveryCase.status,
      priority: recoveryCase.priority,
      recoverableAmount: recoveryCase.recoverable_amount,
      recoveredAmount: recoveryCase.recovered_amount,
    });
    setError(null);
  }, [recoveryCase, open]);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      await updateRecoveryCase(recoveryCase.id, form);
      show("Recovery case updated", "success");
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
      title="Edit recovery case"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Status"
            value={form.status ?? ""}
            onChange={(e) => setForm({ ...form, status: e.target.value as any })}
            options={RecoveryStatus.map((s) => ({ label: s.replaceAll("_", " "), value: s }))}
          />
          <Select
            label="Priority"
            value={form.priority ?? ""}
            onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
            options={RecoveryPriority.map((p) => ({ label: p, value: p }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Recoverable amount"
            type="number"
            step="0.01"
            value={String(form.recoverableAmount ?? "")}
            onChange={(e) => setForm({ ...form, recoverableAmount: e.target.value })}
          />
          <Input
            label="Recovered amount"
            type="number"
            step="0.01"
            value={String(form.recoveredAmount ?? "")}
            onChange={(e) => setForm({ ...form, recoveredAmount: e.target.value })}
          />
        </div>
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
