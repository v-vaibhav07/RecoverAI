import api from "../api/axios";
import { Product } from "../types/models";

export async function listProducts() {
  const res = await api.get("/products");
  return res.data.data as { products: Product[] };
}

export async function getProduct(id: string) {
  const res = await api.get(`/products/${id}`);
  return res.data.data as { product: Product };
}

export interface ProductInput {
  name: string;
  price: number | string;
  description?: string;
  currency?: string;
  metadata?: Record<string, any>;
}

export async function createProduct(input: ProductInput) {
  const res = await api.post("/products", input);
  return res.data.data as { product: Product };
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const res = await api.put(`/products/${id}`, input);
  return res.data.data as { product: Product };
}

export async function deleteProduct(id: string) {
  await api.delete(`/products/${id}`);
}
