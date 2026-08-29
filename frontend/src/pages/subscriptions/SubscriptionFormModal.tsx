import { useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import { Subscription } from "../../types/models";
import { BillingInterval, SubscriptionStatus } from "../../types/enums";
import { createSubscription, updateSubscription } from "../../services/subscription.service";
import { useToast } from "../../components/common/Toast";
import { getErrorMessage } from "../../utils/errors";

export default function SubscriptionFormModal({
  open,
  onClose,
  onSaved,
  subscription,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  subscription?: Subscription | null;
}) {
  const { show } = useToast();
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [planName, setPlanName] = useState("");
  const [amount, setAmount] = useState("");
  const [billingInterval, setBillingInterval] = useState<string>("MONTHLY");
  const [status, setStatus] = useState<string>("ACTIVE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subscription) {
      setCustomerId(subscription.customer_id);
      setProductId(subscription.product_id ?? "");
      setPlanName(subscription.plan_name ?? "");
      setAmount(String(subscription.amount));
      setBillingInterval(subscription.billing_interval);
      setStatus(subscription.status);
    } else {
      setCustomerId("");
      setProductId("");
      setPlanName("");
      setAmount("");
      setBillingInterval("MONTHLY");
      setStatus("ACTIVE");
    }
    setError(null);
  }, [subscription, open]);

  async function handleSubmit() {
    if (!amount) {
      setError("Amount is required.");
      return;
    }
    if (!subscription && !customerId.trim()) {
      setError("Customer ID is required.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (subscription) {
        await updateSubscription(subscription.id, {
          planName: planName || undefined,
          amount,
          billingInterval: billingInterval as any,
          status: status as any,
        });
        show("Subscription updated", "success");
      } else {
        await createSubscription({
          customerId,
          productId: productId || undefined,
          planName: planName || undefined,
          amount,
          billingInterval: billingInterval as any,
        });
        show("Subscription created", "success");
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
      title={subscription ? "Edit subscription" : "New subscription"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {subscription ? "Save changes" : "Create subscription"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {!subscription && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Customer ID" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
            <Input label="Product ID (optional)" value={productId} onChange={(e) => setProductId(e.target.value)} />
          </div>
        )}
        <Input label="Plan name" value={planName} onChange={(e) => setPlanName(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Select
            label="Billing interval"
            value={billingInterval}
            onChange={(e) => setBillingInterval(e.target.value)}
            options={BillingInterval.map((b) => ({ label: b, value: b }))}
          />
        </div>
        {subscription && (
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={SubscriptionStatus.map((s) => ({ label: s.replaceAll("_", " "), value: s }))}
          />
        )}
        {error && <p className="text-sm text-rose-600">{error}</p>}
      </div>
    </Modal>
  );
}
