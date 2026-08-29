import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import JsonEditor from "../../components/forms/JsonEditor";
import { Order } from "../../types/models";
import { createOrder, updateOrder, OrderInput } from "../../services/order.service";
import { useToast } from "../../components/common/Toast";
import { getErrorMessage } from "../../utils/errors";

export default function OrderFormModal({
  open,
  onClose,
  onSaved,
  order,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  order?: Order | null;
}) {
  const { show } = useToast();
  const [form, setForm] = useState<OrderInput>({ customerId: "", orderNumber: "", totalAmount: "", currency: "INR" });
  const [metadata, setMetadata] = useState<Record<string, any> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setForm({
        customerId: order.customer_id,
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        currency: order.currency,
        status: order.status,
      });
      setMetadata(order.metadata);
    } else {
      setForm({ customerId: "", orderNumber: "", totalAmount: "", currency: "INR" });
      setMetadata(undefined);
    }
    setError(null);
  }, [order, open]);

  async function handleSubmit() {
    if (!form.customerId.trim() || !form.orderNumber.trim() || !form.totalAmount) {
      setError("Customer ID, order number, and total amount are required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, metadata };
      if (order) {
        await updateOrder(order.id, payload);
        show("Order updated", "success");
      } else {
        await createOrder(payload);
        show("Order created", "success");
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
      title={order ? "Edit order" : "New order"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {order ? "Save changes" : "Create order"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Customer ID" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Order number" value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} />
          <Input label="Total amount" type="number" step="0.01" value={String(form.totalAmount)} onChange={(e) => setForm({ ...form, totalAmount: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Currency" value={form.currency ?? ""} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          <Input label="Status" value={form.status ?? ""} onChange={(e) => setForm({ ...form, status: e.target.value })} placeholder="free text" />
        </div>
        <JsonEditor label="Metadata (JSON)" value={metadata} onChange={setMetadata} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
