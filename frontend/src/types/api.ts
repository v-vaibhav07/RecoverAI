// Generic response envelope shapes used consistently across the backend.

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}

export interface Paginated<TKey extends string, TItem> {
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export type ListQuery = {
  page?: number;
  limit?: number;
  search?: string;
};
