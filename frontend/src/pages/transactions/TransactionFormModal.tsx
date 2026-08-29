import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import JsonEditor from "../../components/forms/JsonEditor";
import { Transaction } from "../../types/models";
import { TransactionType, TransactionStatus } from "../../types/enums";
import { createTransaction, updateTransaction, TransactionCreateInput } from "../../services/transaction.service";
import { useToast } from "../../components/common/Toast";
import { getErrorMessage } from "../../utils/errors";

export default function TransactionFormModal({
  open,
  onClose,
  onSaved,
  transaction,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  transaction?: Transaction | null;
}) {
  const { show } = useToast();
  const [form, setForm] = useState<TransactionCreateInput>({ amount: "", type: "PAYMENT", currency: "INR" });
  const [metadata, setMetadata] = useState<Record<string, any> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transaction) {
      setForm({
        customerId: transaction.customer_id ?? undefined,
        orderId: transaction.order_id ?? undefined,
        externalTransactionId: transaction.external_transaction_id ?? undefined,
        amount: transaction.amount,
        currency: transaction.currency,
        type: transaction.type,
        status: transaction.status,
      });
      setMetadata(transaction.metadata);
    } else {
      setForm({ amount: "", type: "PAYMENT", currency: "INR" });
      setMetadata(undefined);
    }
    setError(null);
  }, [transaction, open]);

  async function handleSubmit() {
    if (!form.amount) {
      setError("Amount is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload = { ...form, metadata };
      if (transaction) {
        await updateTransaction(transaction.id, payload);
        show("Transaction updated", "success");
      } else {
        await createTransaction(payload);
        show("Transaction created", "success");
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
      title={transaction ? "Edit transaction" : "New transaction"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {transaction ? "Save changes" : "Create transaction"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Customer ID" value={form.customerId ?? ""} onChange={(e) => setForm({ ...form, customerId: e.target.value })} />
          <Input label="Order ID" value={form.orderId ?? ""} onChange={(e) => setForm({ ...form, orderId: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Amount" type="number" step="0.01" value={String(form.amount)} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Input label="Currency" value={form.currency ?? ""} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Type" value={form.type ?? "PAYMENT"} onChange={(e) => setForm({ ...form, type: e.target.value as any })} options={TransactionType.map((t) => ({ label: t, value: t }))} />
          <Select label="Status" value={form.status ?? ""} onChange={(e) => setForm({ ...form, status: e.target.value as any })} allowEmpty options={TransactionStatus.map((s) => ({ label: s, value: s }))} />
        </div>
        <JsonEditor label="Metadata (JSON)" value={metadata} onChange={setMetadata} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
