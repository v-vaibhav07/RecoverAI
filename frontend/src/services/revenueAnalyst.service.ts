import api from "../api/axios";
import { RevenueAnalysisResult } from "../types/models";

export async function getRevenueAnalysis() {
  const res = await api.get("/revenue-analyst");
  return res.data.data as { revenueAnalysis: RevenueAnalysisResult };
}
