import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import JsonEditor from "../../components/forms/JsonEditor";
import { RecoveryStrategy } from "../../types/models";
import { StrategyType } from "../../types/enums";
import { createRecoveryStrategy, updateRecoveryStrategy, RecoveryStrategyInput } from "../../services/recoveryStrategy.service";
import { useToast } from "../../components/common/Toast";
import { getErrorMessage } from "../../utils/errors";

export default function RecoveryStrategyFormModal({
  open,
  onClose,
  onSaved,
  strategy,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  strategy?: RecoveryStrategy | null;
}) {
  const { show } = useToast();
  const [form, setForm] = useState<RecoveryStrategyInput>({ name: "", type: "AUTOMATIC_RETRY", isActive: true });
  const [configuration, setConfiguration] = useState<Record<string, any> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (strategy) {
      setForm({
        name: strategy.name,
        type: strategy.type,
        description: strategy.description ?? "",
        isActive: strategy.is_active,
      });
      setConfiguration(strategy.configuration);
    } else {
      setForm({ name: "", type: "AUTOMATIC_RETRY", isActive: true });
      setConfiguration(undefined);
    }
    setError(null);
  }, [strategy, open]);

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, configuration };
      if (strategy) {
        await updateRecoveryStrategy(strategy.id, payload);
        show("Strategy updated", "success");
      } else {
        await createRecoveryStrategy(payload);
        show("Strategy created", "success");
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
      title={strategy ? "Edit strategy" : "New strategy"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {strategy ? "Save changes" : "Create strategy"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Select
          label="Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as any })}
          options={StrategyType.map((t) => ({ label: t.replaceAll("_", " "), value: t }))}
        />
        <Textarea
          label="Description"
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
        />
        <JsonEditor label="Configuration (JSON)" value={configuration} onChange={setConfiguration} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
