import api from "../api/axios";
import { EventRecord, Pagination } from "../types/models";
import { EventStatus } from "../types/enums";

export async function listEvents(params: { page?: number; limit?: number; search?: string }) {
  const res = await api.get("/events", { params });
  return res.data.data as { events: EventRecord[]; pagination: Pagination };
}

export async function getEvent(id: string) {
  const res = await api.get(`/events/${id}`);
  return res.data.data as { event: EventRecord };
}

export interface EventInput {
  eventType: string;
  aggregateType: string;
  aggregateId?: string;
  payload?: Record<string, any>;
  status?: EventStatus;
  processed?: boolean;
  processedAt?: string;
  error?: string;
}

export async function createEvent(input: EventInput) {
  const res = await api.post("/events", input);
  return res.data.data as { event: EventRecord };
}

export async function updateEvent(id: string, input: Partial<EventInput>) {
  const res = await api.put(`/events/${id}`, input);
  return res.data.data as { event: EventRecord };
}

export async function deleteEvent(id: string) {
  await api.delete(`/events/${id}`);
}
