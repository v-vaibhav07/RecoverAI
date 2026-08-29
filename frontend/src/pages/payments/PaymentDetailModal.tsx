import Modal from "../../components/common/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import CurrencyDisplay from "../../components/ui/CurrencyDisplay";
import JsonViewer from "../../components/ui/JsonViewer";
import { formatDateTime } from "../../utils/date";
import { Payment } from "../../types/models";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="mt-1 text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

export default function PaymentDetailModal({
  open,
  onClose,
  payment,
}: {
  open: boolean;
  onClose: () => void;
  payment: Payment | null;
}) {
  if (!payment) return null;
  return (
    <Modal open={open} onClose={onClose} title="Payment details" size="lg">
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
        <Field label="Amount" value={<CurrencyDisplay value={payment.amount} currency={payment.currency} />} />
        <Field label="Status" value={<StatusBadge status={payment.status} />} />
        <Field label="Provider" value={payment.provider ?? "—"} />
        <Field label="Provider payment ID" value={payment.provider_payment_id ?? "—"} />
        <Field label="Customer" value={payment.customers?.name ?? "—"} />
        <Field label="Failure code" value={payment.failure_code ?? "—"} />
        <Field label="Failure message" value={payment.failure_message ?? "—"} />
        <Field label="Created" value={formatDateTime(payment.created_at)} />
        <Field label="Updated" value={formatDateTime(payment.updated_at)} />
      </div>
      <div className="mt-5">
        <p className="mb-1.5 text-xs text-text-muted">Metadata</p>
        <JsonViewer data={payment.metadata} />
      </div>
    </Modal>
  );
}
