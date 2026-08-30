import api from "../api/axios";
import { Subscription } from "../types/models";
import { BillingInterval, SubscriptionStatus } from "../types/enums";

export async function listSubscriptions() {
  const res = await api.get("/subscriptions");
  return res.data.data as { subscriptions: Subscription[] };
}

export async function getSubscription(id: string) {
  const res = await api.get(`/subscriptions/${id}`);
  return res.data.data as { subscription: Subscription };
}

export interface SubscriptionCreateInput {
  customerId: string;
  productId?: string;
  planName?: string;
  amount: number | string;
  billingInterval: BillingInterval;
}

export interface SubscriptionUpdateInput {
  planName?: string;
  amount?: number | string;
  billingInterval?: BillingInterval;
  status?: SubscriptionStatus;
}

export async function createSubscription(input: SubscriptionCreateInput) {
  const res = await api.post("/subscriptions", input);
  return res.data.data as { subscription: Subscription };
}

export async function updateSubscription(id: string, input: SubscriptionUpdateInput) {
  const res = await api.put(`/subscriptions/${id}`, input);
  return res.data.data as { subscription: Subscription };
}

export async function cancelSubscription(id: string) {
  const res = await api.patch(`/subscriptions/${id}/cancel`);
  return res.data.data as { subscription: Subscription };
}

export async function deleteSubscription(id: string) {
  await api.delete(`/subscriptions/${id}`);
}
