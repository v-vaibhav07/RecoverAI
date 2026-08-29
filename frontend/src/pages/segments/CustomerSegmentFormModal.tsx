import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Button from "../../components/common/Button";
import JsonEditor from "../../components/forms/JsonEditor";
import { CustomerSegment } from "../../types/models";
import { createCustomerSegment, updateCustomerSegment } from "../../services/customerSegment.service";
import { useToast } from "../../components/common/Toast";
import { getErrorMessage } from "../../utils/errors";

export default function CustomerSegmentFormModal({
  open,
  onClose,
  onSaved,
  segment,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  segment?: CustomerSegment | null;
}) {
  const { show } = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState<Record<string, any> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (segment) {
      setName(segment.name);
      setDescription(segment.description ?? "");
      setCriteria(segment.criteria);
    } else {
      setName("");
      setDescription("");
      setCriteria(undefined);
    }
    setError(null);
  }, [segment, open]);

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (segment) {
        await updateCustomerSegment(segment.id, { name, description, criteria });
        show("Segment updated", "success");
      } else {
        await createCustomerSegment({ name, description, criteria });
        show("Segment created", "success");
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
      title={segment ? "Edit segment" : "New segment"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {segment ? "Save changes" : "Create segment"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        <JsonEditor label="Criteria (JSON) — free-form, no fixed backend schema" value={criteria} onChange={setCriteria} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
