import api from "../api/axios";
import { Notification, Pagination } from "../types/models";
import { NotificationChannel, NotificationStatus } from "../types/enums";

export async function listNotifications(params: { page?: number; limit?: number; search?: string }) {
  const res = await api.get("/notifications", { params });
  return res.data.data as { notifications: Notification[]; pagination: Pagination };
}

export async function getNotification(id: string) {
  const res = await api.get(`/notifications/${id}`);
  return res.data.data as { notification: Notification };
}

export interface NotificationInput {
  customerId?: string;
  recoveryCaseId?: string;
  channel: NotificationChannel;
  template?: string;
  recipient?: string;
  subject?: string;
  content?: string;
  status?: NotificationStatus;
  sentAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  providerId?: string;
  metadata?: Record<string, any>;
}

export async function createNotification(input: NotificationInput) {
  const res = await api.post("/notifications", input);
  return res.data.data as { notification: Notification };
}

export async function updateNotification(id: string, input: Partial<NotificationInput>) {
  const res = await api.put(`/notifications/${id}`, input);
  return res.data.data as { notification: Notification };
}

export async function deleteNotification(id: string) {
  await api.delete(`/notifications/${id}`);
}
