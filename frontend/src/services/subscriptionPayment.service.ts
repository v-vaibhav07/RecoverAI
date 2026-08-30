import api from "../api/axios";
import { SubscriptionPayment } from "../types/models";
import { PaymentStatus } from "../types/enums";

export async function listSubscriptionPayments() {
  const res = await api.get("/subscription-payments");
  return res.data.data as { subscriptionPayments: SubscriptionPayment[] };
}

export async function getSubscriptionPayment(id: string) {
  const res = await api.get(`/subscription-payments/${id}`);
  return res.data.data as { subscriptionPayment: SubscriptionPayment };
}

export interface SubscriptionPaymentInput {
  subscriptionId: string;
  paymentId: string;
  billingPeriod: string;
  amount: number | string;
  currency?: string;
  status?: PaymentStatus;
  dueDate: string;
  paidAt?: string;
}

export async function createSubscriptionPayment(input: SubscriptionPaymentInput) {
  const res = await api.post("/subscription-payments", input);
  return res.data.data as { subscriptionPayment: SubscriptionPayment };
}

export async function updateSubscriptionPayment(id: string, input: Partial<SubscriptionPaymentInput>) {
  const res = await api.put(`/subscription-payments/${id}`, input);
  return res.data.data as { subscriptionPayment: SubscriptionPayment };
}

export async function deleteSubscriptionPayment(id: string) {
  await api.delete(`/subscription-payments/${id}`);
}
