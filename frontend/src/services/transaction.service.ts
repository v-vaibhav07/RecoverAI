import api from "../api/axios";
import { Transaction, Pagination } from "../types/models";
import { TransactionType, TransactionStatus } from "../types/enums";

export async function listTransactions(params: { page?: number; limit?: number; search?: string }) {
  const res = await api.get("/transactions", { params });
  return res.data.data as { transactions: Transaction[]; pagination: Pagination };
}

export async function getTransaction(id: string) {
  const res = await api.get(`/transactions/${id}`);
  return res.data.data as { transaction: Transaction };
}

export interface TransactionCreateInput {
  customerId?: string;
  orderId?: string;
  externalTransactionId?: string;
  amount: number | string;
  currency?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  metadata?: Record<string, any>;
}

export interface TransactionUpdateInput {
  externalTransactionId?: string;
  amount?: number | string;
  currency?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  metadata?: Record<string, any>;
}

export async function createTransaction(input: TransactionCreateInput) {
  const res = await api.post("/transactions", input);
  return res.data.data as { transaction: Transaction };
}

// NOTE: backend uses PATCH here, not PUT, unlike every other module.
export async function updateTransaction(id: string, input: TransactionUpdateInput) {
  const res = await api.patch(`/transactions/${id}`, input);
  return res.data.data as { transaction: Transaction };
}

export async function deleteTransaction(id: string) {
  await api.delete(`/transactions/${id}`);
}
