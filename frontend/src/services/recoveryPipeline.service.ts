import api from "../api/axios";
import { RecoveryPipelineRunResult, RecoveryPipelineBatchResult } from "../types/models";

// Runs predict -> decide -> schedule -> execute for a single recovery case.
export async function runRecoveryPipelineForCase(recoveryCaseId: string) {
  const res = await api.post(`/recovery-pipeline/${recoveryCaseId}/run`);
  return res.data.data as { pipelineRun: RecoveryPipelineRunResult };
}

// Runs the same pipeline across a batch of eligible cases (default: OPEN, limit 10).
export async function runRecoveryPipelineBatch(options?: { limit?: number; status?: string }) {
  const res = await api.post("/recovery-pipeline/batch", options ?? {});
  return res.data.data as { batchRun: RecoveryPipelineBatchResult };
}
