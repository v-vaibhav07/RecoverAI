import axios from "axios";

export const AUTH_STORAGE_KEY = "recoverai.auth";

export interface StoredAuth {
  accessToken: string;
  user: any;
  merchant?: any;
  profile?: any;
}

export function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function writeStoredAuth(auth: StoredAuth | null) {
  if (!auth) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const stored = readStoredAuth();
  if (stored?.accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${stored.accessToken}`;
  }
  return config;
});

// Simple pub-sub so AuthContext can react to a 401 without a circular import.
type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  unauthorizedHandler = handler;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      writeStoredAuth(null);
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

export default api;
