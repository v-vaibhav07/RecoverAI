import api from "../api/axios";
import { CheckoutSession, Pagination } from "../types/models";
import { CheckoutStatus } from "../types/enums";

export async function listCheckoutSessions(params: { page?: number; limit?: number; search?: string }) {
  const res = await api.get("/checkout-sessions", { params });
  return res.data.data as { checkoutSessions: CheckoutSession[]; pagination: Pagination };
}

export async function getCheckoutSession(id: string) {
  const res = await api.get(`/checkout-sessions/${id}`);
  return res.data.data as { checkoutSession: CheckoutSession };
}

export interface CheckoutSessionInput {
  customerId?: string;
  orderId?: string;
  amount: number | string;
  currency?: string;
  status?: CheckoutStatus;
  lastActivityAt?: string;
  completedAt?: string;
  abandonedAt?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export async function createCheckoutSession(input: CheckoutSessionInput) {
  const res = await api.post("/checkout-sessions", input);
  return res.data.data as { checkoutSession: CheckoutSession };
}

export async function updateCheckoutSession(id: string, input: Partial<CheckoutSessionInput>) {
  const res = await api.put(`/checkout-sessions/${id}`, input);
  return res.data.data as { checkoutSession: CheckoutSession };
}

export async function deleteCheckoutSession(id: string) {
  await api.delete(`/checkout-sessions/${id}`);
}
