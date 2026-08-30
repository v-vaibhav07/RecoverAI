import api from "../api/axios";

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data.data as { user: any; session: { access_token: string } | null };
}

export async function register(email: string, password: string, fullName: string) {
  const res = await api.post("/auth/register", { email, password, fullName });
  return res.data.data as {
    user: any;
    session: { access_token: string } | null;
    merchant: any;
    profile: any;
  };
}

export async function logout() {
  await api.post("/auth/logout");
}
