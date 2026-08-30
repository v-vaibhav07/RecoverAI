import api from "../api/axios";
import { FailureAnalysisResult } from "../types/models";

export async function analyzeFailure(recoveryCaseId: string) {
  const res = await api.post(`/recovery-failure-analysis/${recoveryCaseId}/analyze`);
  return res.data.data as { analysis: FailureAnalysisResult };
}
