import api from "../api/axios";
import { PaymentFailure } from "../types/models";
import { FailureCategory, FailureSeverity } from "../types/enums";

export async function listPaymentFailures() {
  const res = await api.get("/payment-failures");
  return res.data.data as { paymentFailures: PaymentFailure[] };
}

export async function getPaymentFailure(id: string) {
  const res = await api.get(`/payment-failures/${id}`);
  return res.data.data as { paymentFailure: PaymentFailure };
}

export interface PaymentFailureInput {
  paymentId: string;
  paymentAttemptId?: string;
  failureCode?: string;
  failureCategory: FailureCategory;
  failureReason?: string;
  retryable?: boolean;
  severity?: FailureSeverity;
  provider?: string;
  metadata?: Record<string, any>;
}

export async function createPaymentFailure(input: PaymentFailureInput) {
  const res = await api.post("/payment-failures", input);
  return res.data.data as { paymentFailure: PaymentFailure };
}

export async function updatePaymentFailure(id: string, input: Partial<PaymentFailureInput>) {
  const res = await api.put(`/payment-failures/${id}`, input);
  return res.data.data as { paymentFailure: PaymentFailure };
}

export async function deletePaymentFailure(id: string) {
  await api.delete(`/payment-failures/${id}`);
}
