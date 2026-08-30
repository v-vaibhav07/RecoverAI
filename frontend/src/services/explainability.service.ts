import api from "../api/axios";
import { ExplainabilityResult } from "../types/models";

// NOTE: this route exists in the backend source but is not currently mounted
// in routes/index.ts (see API map Finding #1). This call will 404 until the
// backend team wires it up — callers should handle that gracefully.
export async function generateExplainability(recoveryCaseId: string) {
  const res = await api.post(`/explainability/${recoveryCaseId}`);
  return res.data.data as { explainability: ExplainabilityResult };
}
