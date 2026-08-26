import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    generateAIExplainability,
} from "../agents/recovery/aiExplainability.agent.ts";

export async function generateExplainability(
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

        const recoveryCaseId = Array.isArray(
            req.params.recoveryCaseId
        )
            ? req.params.recoveryCaseId[0]
            : req.params.recoveryCaseId;

        if (!recoveryCaseId) {
            return res.status(400).json({
                success: false,
                message:
                    "Recovery case ID is required",
            });
        }

        const result =
            await generateAIExplainability(
                req.user.id,
                recoveryCaseId
            );

        return res.json({
            success: true,
            message:
                "AI explainability generated successfully",
            data: {
                explainability: result,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}