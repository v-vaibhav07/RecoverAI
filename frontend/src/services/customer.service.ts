import api from "../api/axios";
import { Customer, Pagination } from "../types/models";

export interface CustomerListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function listCustomers(params: CustomerListParams) {
  const res = await api.get("/customers", { params });
  return res.data.data as { customers: Customer[]; pagination: Pagination };
}

export async function getCustomer(id: string) {
  const res = await api.get(`/customers/${id}`);
  return res.data.data as { customer: Customer };
}

export interface CustomerInput {
  name: string;
  email?: string;
  phone?: string;
  country?: string;
  externalCustomerId?: string;
  metadata?: Record<string, any>;
}

export async function createCustomer(input: CustomerInput) {
  const res = await api.post("/customers", input);
  return res.data.data as { customer: Customer };
}

export async function updateCustomer(id: string, input: Partial<CustomerInput>) {
  const res = await api.put(`/customers/${id}`, input);
  return res.data.data as { customer: Customer };
}

export async function deleteCustomer(id: string) {
  await api.delete(`/customers/${id}`);
}
