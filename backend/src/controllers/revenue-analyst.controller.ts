import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    analyzeRevenue,
} from "../agents/recovery/revenueAnalyst.agent.js";

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

        const result = await analyzeRevenue(
            req.user.id
        );

        return res.json({
            success: true,
            message:
                "Revenue analysis completed successfully",
            data: {
                revenueAnalysis: result,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}