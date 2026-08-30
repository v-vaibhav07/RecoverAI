import api from "../api/axios";
import { Payment } from "../types/models";
import { PaymentStatus } from "../types/enums";

export async function listPayments() {
  const res = await api.get("/payments");
  return res.data.data as { payments: Payment[] };
}

export async function getPayment(id: string) {
  const res = await api.get(`/payments/${id}`);
  return res.data.data as { payment: Payment };
}

export interface PaymentInput {
  customerId?: string;
  transactionId?: string;
  paymentMethodId?: string;
  amount: number | string;
  provider?: string;
  providerPaymentId?: string;
  status?: PaymentStatus;
  failureCode?: string;
  failureMessage?: string;
  metadata?: Record<string, any>;
}

export async function createPayment(input: PaymentInput) {
  const res = await api.post("/payments", input);
  return res.data.data as { payment: Payment };
}

export async function updatePayment(id: string, input: Partial<PaymentInput>) {
  const res = await api.put(`/payments/${id}`, input);
  return res.data.data as { payment: Payment };
}

export async function deletePayment(id: string) {
  await api.delete(`/payments/${id}`);
}
