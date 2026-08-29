import { AxiosError } from "axios";

export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err && typeof err === "object" && "isAxiosError" in err) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    const backendMessage = axiosErr.response?.data?.message;
    if (backendMessage) return backendMessage;
    if (axiosErr.message === "Network Error") {
      return "Can't reach the server. Check your connection or try again shortly.";
    }
    if (axiosErr.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
