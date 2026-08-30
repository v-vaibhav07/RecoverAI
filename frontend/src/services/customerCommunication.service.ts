import api from "../api/axios";
import { CustomerCommunicationResult, AIDecision } from "../types/models";

// Generates a personalized, channel-appropriate outreach message for the
// customer on a recovery case, using the case, customer, payment, latest AI
// prediction/decision, and prior recovery actions as context. Persists the
// result as an ai_decisions row (decision_type: CUSTOMER_COMMUNICATION).
export async function generateCustomerCommunication(recoveryCaseId: string) {
  const res = await api.post(`/customer-communication/${recoveryCaseId}`);
  return res.data.data as { communication: CustomerCommunicationResult; aiDecision: AIDecision };
}
