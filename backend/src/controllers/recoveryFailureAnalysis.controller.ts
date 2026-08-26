import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    analyzePaymentFailure,
} from "../agents/recovery/recoveryFailureAnalysis.agent.js";

export async function analyze(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { recoveryCaseId } =
            req.params;

        if (!recoveryCaseId) {
            return res.status(400).json({
                success: false,
                message:
                    "Recovery case ID is required",
            });
        }

        const analysis =
            await analyzePaymentFailure(
                req.user.id,
                recoveryCaseId
            );

        return res.json({
            success: true,
            message:
                "Payment failure analyzed successfully",
            data: {
                analysis,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "Failed to analyze payment failure",
        });
    }
}