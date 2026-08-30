import api from "../api/axios";
import { Order, Pagination } from "../types/models";

export async function listOrders(params: { page?: number; limit?: number; search?: string }) {
  const res = await api.get("/orders", { params });
  return res.data.data as { orders: Order[]; pagination: Pagination };
}

export async function getOrder(id: string) {
  const res = await api.get(`/orders/${id}`);
  return res.data.data as { order: Order };
}

export interface OrderInput {
  customerId: string;
  orderNumber: string;
  totalAmount: number | string;
  currency?: string;
  status?: string;
  metadata?: Record<string, any>;
}

export async function createOrder(input: OrderInput) {
  const res = await api.post("/orders", input);
  return res.data.data as { order: Order };
}

export async function updateOrder(id: string, input: Partial<OrderInput>) {
  const res = await api.put(`/orders/${id}`, input);
  return res.data.data as { order: Order };
}

export async function deleteOrder(id: string) {
  await api.delete(`/orders/${id}`);
}
