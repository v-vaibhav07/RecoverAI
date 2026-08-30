import api from "../api/axios";
import { RecoveryAction } from "../types/models";
import { StrategyType, RecoveryActionStatus } from "../types/enums";

export async function listRecoveryActions() {
  const res = await api.get("/recovery-actions");
  return res.data.data as { recoveryActions: RecoveryAction[] };
}

export async function getRecoveryAction(id: string) {
  const res = await api.get(`/recovery-actions/${id}`);
  return res.data.data as { recoveryAction: RecoveryAction };
}

export interface RecoveryActionCreateInput {
  recoveryCaseId: string;
  actionType: StrategyType;
  strategyId?: string;
  status?: RecoveryActionStatus;
  scheduledAt?: string;
  metadata?: Record<string, any>;
}

export interface RecoveryActionUpdateInput {
  actionType?: StrategyType;
  status?: RecoveryActionStatus;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  result?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export async function createRecoveryAction(input: RecoveryActionCreateInput) {
  const res = await api.post("/recovery-actions", input);
  return res.data.data as { recoveryAction: RecoveryAction };
}

export async function updateRecoveryAction(id: string, input: RecoveryActionUpdateInput) {
  const res = await api.put(`/recovery-actions/${id}`, input);
  return res.data.data as { recoveryAction: RecoveryAction };
}

export async function deleteRecoveryAction(id: string) {
  await api.delete(`/recovery-actions/${id}`);
}
