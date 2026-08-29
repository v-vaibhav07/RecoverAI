import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import JsonEditor from "../../components/forms/JsonEditor";
import { Customer } from "../../types/models";
import { createCustomer, updateCustomer, CustomerInput as CustomerInputType } from "../../services/customer.service";
import { useToast } from "../../components/common/Toast";
import { getErrorMessage } from "../../utils/errors";

export default function CustomerFormModal({
  open,
  onClose,
  onSaved,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  customer?: Customer | null;
}) {
  const { show } = useToast();
  const [form, setForm] = useState<CustomerInputType>({ name: "", email: "", phone: "", country: "" });
  const [metadata, setMetadata] = useState<Record<string, any> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name,
        email: customer.email ?? "",
        phone: customer.phone ?? "",
        country: customer.country ?? "",
        externalCustomerId: customer.external_customer_id ?? "",
      });
      setMetadata(customer.metadata);
    } else {
      setForm({ name: "", email: "", phone: "", country: "" });
      setMetadata(undefined);
    }
    setError(null);
  }, [customer, open]);

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, metadata };
      if (customer) {
        await updateCustomer(customer.id, payload);
        show("Customer updated", "success");
      } else {
        await createCustomer(payload);
        show("Customer created", "success");
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
      title={customer ? "Edit customer" : "New customer"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {customer ? "Save changes" : "Create customer"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Email"
            type="email"
            value={form.email ?? ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Phone"
            value={form.phone ?? ""}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Country"
            value={form.country ?? ""}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            placeholder="IN"
          />
          <Input
            label="External customer ID"
            value={form.externalCustomerId ?? ""}
            onChange={(e) => setForm({ ...form, externalCustomerId: e.target.value })}
          />
        </div>
        <JsonEditor label="Metadata (JSON)" value={metadata} onChange={setMetadata} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
