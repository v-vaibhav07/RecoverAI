import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import JsonEditor from "../../components/forms/JsonEditor";
import { Product } from "../../types/models";
import { createProduct, updateProduct, ProductInput } from "../../services/product.service";
import { useToast } from "../../components/common/Toast";
import { getErrorMessage } from "../../utils/errors";

export default function ProductFormModal({
  open,
  onClose,
  onSaved,
  product,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: Product | null;
}) {
  const { show } = useToast();
  const [form, setForm] = useState<ProductInput>({ name: "", price: "", description: "", currency: "INR" });
  const [metadata, setMetadata] = useState<Record<string, any> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: product.price,
        description: product.description ?? "",
        currency: product.currency,
      });
      setMetadata(product.metadata);
    } else {
      setForm({ name: "", price: "", description: "", currency: "INR" });
      setMetadata(undefined);
    }
    setError(null);
  }, [product, open]);

  async function handleSubmit() {
    if (!form.name.trim() || !form.price) {
      setError("Name and price are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, metadata };
      if (product) {
        await updateProduct(product.id, payload);
        show("Product updated", "success");
      } else {
        await createProduct(payload);
        show("Product created", "success");
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
      title={product ? "Edit product" : "New product"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {product ? "Save changes" : "Create product"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Price"
            type="number"
            step="0.01"
            value={String(form.price)}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <Input
            label="Currency"
            value={form.currency ?? ""}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
          />
        </div>
        <Input
          label="Description"
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <JsonEditor label="Metadata (JSON)" value={metadata} onChange={setMetadata} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
