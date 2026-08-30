import api from "../api/axios";
import { AuditLog } from "../types/models";

export async function listAuditLogs() {
  const res = await api.get("/audit-logs");
  return res.data.data as { auditLogs: AuditLog[] };
}

export async function getAuditLog(id: string) {
  const res = await api.get(`/audit-logs/${id}`);
  return res.data.data as { auditLog: AuditLog };
}
