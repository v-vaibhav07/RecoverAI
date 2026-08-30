import api from "../api/axios";
import { RecoveryCase } from "../types/models";
import { RecoveryPriority, RecoveryStatus } from "../types/enums";

export async function listRecoveryCases() {
  const res = await api.get("/recovery-cases");
  return res.data.data as { recoveryCases: RecoveryCase[] };
}

export async function getRecoveryCase(id: string) {
  const res = await api.get(`/recovery-cases/${id}`);
  return res.data.data as { recoveryCase: RecoveryCase };
}

export interface RecoveryCaseCreateInput {
  paymentId: string;
  priority?: RecoveryPriority;
}

export interface RecoveryCaseUpdateInput {
  recoverableAmount?: number | string;
  recoveredAmount?: number | string;
  recoveryScore?: number | string;
  recoveryProbability?: number | string;
  expectedRecoveryAmount?: number | string;
  status?: RecoveryStatus;
  priority?: RecoveryPriority;
  closedAt?: string;
}

export async function createRecoveryCase(input: RecoveryCaseCreateInput) {
  const res = await api.post("/recovery-cases", input);
  return res.data.data as { recoveryCase: RecoveryCase };
}

export async function updateRecoveryCase(id: string, input: RecoveryCaseUpdateInput) {
  const res = await api.put(`/recovery-cases/${id}`, input);
  return res.data.data as { recoveryCase: RecoveryCase };
}

export async function deleteRecoveryCase(id: string) {
  await api.delete(`/recovery-cases/${id}`);
}
