import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { monitorRecoveryPipeline } from "../agents/recovery/recoveryMonitoring.agent.js";

export async function monitor(
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

        const result = await monitorRecoveryPipeline(
            req.user.id
        );

        return res.json({
            success: true,
            message: "Recovery pipeline monitored successfully",
            data: {
                monitoring: result,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}