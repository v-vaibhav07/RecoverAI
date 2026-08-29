import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  AUTH_STORAGE_KEY,
  readStoredAuth,
  writeStoredAuth,
  setUnauthorizedHandler,
  StoredAuth,
} from "../api/axios";
import { login as loginRequest, register as registerRequest, logout as logoutRequest } from "../services/auth.service";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  merchant: any | null;
  profile: any | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<{ needsEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => readStoredAuth());
  const [isLoading, setIsLoading] = useState(false);

  const clearAuth = useCallback(() => {
    writeStoredAuth(null);
    setAuth(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => clearAuth());
    return () => setUnauthorizedHandler(null);
  }, [clearAuth]);

  // Keep tabs in sync
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === AUTH_STORAGE_KEY) {
        setAuth(readStoredAuth());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await loginRequest(email, password);
      // NOTE: /auth/login only returns { user, session } — no merchant/profile
      // (see API map Finding #2). We preserve any previously cached merchant/profile
      // for this browser (e.g. from a prior registration) rather than wiping it.
      const previous = readStoredAuth();
      const next: StoredAuth = {
        accessToken: data.session?.access_token ?? "",
        user: data.user,
        merchant: previous?.merchant,
        profile: previous?.profile,
      };
      writeStoredAuth(next);
      setAuth(next);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const data = await registerRequest(email, password, fullName);
      if (!data.session) {
        // Email confirmation required by Supabase project settings.
        return { needsEmailConfirmation: true };
      }
      const next: StoredAuth = {
        accessToken: data.session.access_token,
        user: data.user,
        merchant: data.merchant,
        profile: data.profile,
      };
      writeStoredAuth(next);
      setAuth(next);
      return { needsEmailConfirmation: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(auth?.accessToken),
      isLoading,
      user: auth?.user ?? null,
      merchant: auth?.merchant ?? null,
      profile: auth?.profile ?? null,
      login,
      register,
      logout,
    }),
    [auth, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
