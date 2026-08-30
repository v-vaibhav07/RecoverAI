import api from "../api/axios";
import { PaymentAttempt } from "../types/models";
import { PaymentAttemptStatus, FailureCategory } from "../types/enums";

export async function listPaymentAttempts() {
  const res = await api.get("/payment-attempts");
  return res.data.data as { paymentAttempts: PaymentAttempt[] };
}

export async function getPaymentAttempt(id: string) {
  const res = await api.get(`/payment-attempts/${id}`);
  return res.data.data as { paymentAttempt: PaymentAttempt };
}

export interface PaymentAttemptInput {
  paymentId: string;
  attemptNumber: number;
  amount: number | string;
  paymentMethodId?: string;
  provider?: string;
  status?: PaymentAttemptStatus;
  failureCode?: string;
  failureCategory?: FailureCategory;
  providerResponse?: Record<string, any>;
  startedAt?: string;
  completedAt?: string;
}

export async function createPaymentAttempt(input: PaymentAttemptInput) {
  const res = await api.post("/payment-attempts", input);
  return res.data.data as { paymentAttempt: PaymentAttempt };
}

export async function updatePaymentAttempt(id: string, input: Partial<PaymentAttemptInput>) {
  const res = await api.put(`/payment-attempts/${id}`, input);
  return res.data.data as { paymentAttempt: PaymentAttempt };
}

export async function deletePaymentAttempt(id: string) {
  await api.delete(`/payment-attempts/${id}`);
}
