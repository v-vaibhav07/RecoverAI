import api from "../api/axios";
import { CampaignAction } from "../types/models";
import { RecoveryActionStatus } from "../types/enums";

// NOTE: list is scoped by campaign — there is no flat GET /campaign-actions endpoint.
export async function listCampaignActionsByCampaign(campaignId: string) {
  const res = await api.get(`/campaign-actions/campaign/${campaignId}`);
  return res.data.data as { campaignActions: CampaignAction[] };
}

export async function getCampaignAction(id: string) {
  const res = await api.get(`/campaign-actions/${id}`);
  return res.data.data as { campaignAction: CampaignAction };
}

export interface CampaignActionCreateInput {
  campaignId: string;
  action: string;
  recoveryCaseId?: string;
}

export interface CampaignActionUpdateInput {
  action?: string;
  status?: RecoveryActionStatus;
  result?: string;
  recoveryCaseId?: string;
}

export async function createCampaignAction(input: CampaignActionCreateInput) {
  const res = await api.post("/campaign-actions", input);
  return res.data.data as { campaignAction: CampaignAction };
}

export async function updateCampaignAction(id: string, input: CampaignActionUpdateInput) {
  const res = await api.put(`/campaign-actions/${id}`, input);
  return res.data.data as { campaignAction: CampaignAction };
}

export async function deleteCampaignAction(id: string) {
  await api.delete(`/campaign-actions/${id}`);
}

export interface CampaignActionProcessResult {
  success: boolean;
  campaignActionId: string;
  campaignId: string;
  recoveryCaseId: string;
  recoveryActionId: string;
  status: string;
  paymentId: string;
  amount: number;
  campaignAction: CampaignAction;
  recoveryAction: unknown;
}

// Turns a PENDING campaign action into a SCHEDULED recovery_action against
// its linked (IN_PROGRESS) recovery case. Requires the campaign action to
// have a recovery_case_id and be PENDING, and the case to be IN_PROGRESS.
export async function processCampaignAction(id: string) {
  const res = await api.post(`/campaign-actions/${id}/process`);
  return res.data.data as { processResult: CampaignActionProcessResult };
}
