import api from "../api/axios";
import { RecoveryMonitoringResult } from "../types/models";

export async function getRecoveryMonitoring() {
  const res = await api.get("/recovery-monitoring");
  return res.data.data as { monitoring: RecoveryMonitoringResult };
}
