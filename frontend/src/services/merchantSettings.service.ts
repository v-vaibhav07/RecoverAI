import api from "../api/axios";
import { MerchantSettings } from "../types/models";

export interface MerchantSettingsInput {
  recoveryEnabled?: boolean;
  aiEnabled?: boolean;
  maxRetryAttempts?: number;
  defaultRetryDelayMinutes?: number;
  notificationEnabled?: boolean;
  settings?: Record<string, any>;
}

// GET throws 404 if no settings row exists yet for this merchant — caller must
// catch that and fall back to createMerchantSettings.
export async function getMerchantSettings() {
  const res = await api.get("/merchant-settings");
  return res.data.data as { merchantSettings: MerchantSettings };
}

export async function createMerchantSettings(input: MerchantSettingsInput) {
  const res = await api.post("/merchant-settings", input);
  return res.data.data as { merchantSettings: MerchantSettings };
}

export async function updateMerchantSettings(input: MerchantSettingsInput) {
  const res = await api.put("/merchant-settings", input);
  return res.data.data as { merchantSettings: MerchantSettings };
}

export async function deleteMerchantSettings() {
  await api.delete("/merchant-settings");
}
