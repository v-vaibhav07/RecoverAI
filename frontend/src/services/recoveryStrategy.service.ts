import api from "../api/axios";
import { RecoveryStrategy } from "../types/models";
import { StrategyType } from "../types/enums";

export async function listRecoveryStrategies() {
  const res = await api.get("/recovery-strategies");
  return res.data.data as { recoveryStrategies: RecoveryStrategy[] };
}

export async function getRecoveryStrategy(id: string) {
  const res = await api.get(`/recovery-strategies/${id}`);
  return res.data.data as { recoveryStrategy: RecoveryStrategy };
}

export interface RecoveryStrategyInput {
  name: string;
  type: StrategyType;
  description?: string;
  configuration?: Record<string, any>;
  isActive?: boolean;
}

export async function createRecoveryStrategy(input: RecoveryStrategyInput) {
  const res = await api.post("/recovery-strategies", input);
  return res.data.data as { recoveryStrategy: RecoveryStrategy };
}

export async function updateRecoveryStrategy(id: string, input: Partial<RecoveryStrategyInput>) {
  const res = await api.put(`/recovery-strategies/${id}`, input);
  return res.data.data as { recoveryStrategy: RecoveryStrategy };
}

export async function deleteRecoveryStrategy(id: string) {
  await api.delete(`/recovery-strategies/${id}`);
}
