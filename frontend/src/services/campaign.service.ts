import api from "../api/axios";
import { Campaign } from "../types/models";
import { CampaignStatus } from "../types/enums";

export async function listCampaigns() {
  const res = await api.get("/campaigns");
  return res.data.data as { campaigns: Campaign[] };
}

export async function getCampaign(id: string) {
  const res = await api.get(`/campaigns/${id}`);
  return res.data.data as { campaign: Campaign };
}

export interface CampaignInput {
  name: string;
  description?: string;
  status?: CampaignStatus;
  targetCriteria?: Record<string, any>;
  strategyId?: string;
  startDate?: string;
  endDate?: string;
}

export async function createCampaign(input: CampaignInput) {
  const res = await api.post("/campaigns", input);
  return res.data.data as { campaign: Campaign };
}

export async function updateCampaign(id: string, input: Partial<CampaignInput>) {
  const res = await api.put(`/campaigns/${id}`, input);
  return res.data.data as { campaign: Campaign };
}

export async function deleteCampaign(id: string) {
  await api.delete(`/campaigns/${id}`);
}
