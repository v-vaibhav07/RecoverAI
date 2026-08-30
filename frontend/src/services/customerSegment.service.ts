import api from "../api/axios";
import { CustomerSegment, Pagination } from "../types/models";

export async function listCustomerSegments(params: { page?: number; limit?: number; search?: string }) {
  const res = await api.get("/customer-segments", { params });
  return res.data.data as { segments: CustomerSegment[]; pagination: Pagination };
}

export async function getCustomerSegment(id: string) {
  const res = await api.get(`/customer-segments/${id}`);
  return res.data.data as { segment: CustomerSegment };
}

export interface CustomerSegmentInput {
  name: string;
  description?: string;
  criteria?: Record<string, any>;
}

export async function createCustomerSegment(input: CustomerSegmentInput) {
  const res = await api.post("/customer-segments", input);
  return res.data.data as { segment: CustomerSegment };
}

export async function updateCustomerSegment(id: string, input: Partial<CustomerSegmentInput>) {
  const res = await api.put(`/customer-segments/${id}`, input);
  return res.data.data as { segment: CustomerSegment };
}

export async function deleteCustomerSegment(id: string) {
  await api.delete(`/customer-segments/${id}`);
}
