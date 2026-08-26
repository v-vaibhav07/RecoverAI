import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
    runRecoveryPipelineForCase,
    runRecoveryPipelineBatch,
} from "../services/recovery-pipeline/recovery-pipeline.service.js";

export async function runForCase(req: AuthRequest, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const recoveryCaseId = Array.isArray(req.params.recoveryCaseId)
            ? req.params.recoveryCaseId[0]
            : req.params.recoveryCaseId;

        if (!recoveryCaseId) {
            return res.status(400).json({
                success: false,
                message: "Recovery case ID is required",
            });
        }

        const ipAddress = req.ip ?? req.socket.remoteAddress ?? "unknown";

        const result = await runRecoveryPipelineForCase(
            req.user.id,
            recoveryCaseId,
            ipAddress
        );

        return res.json({
            success: true,
            message: "Recovery pipeline executed successfully",
            data: {
                pipelineRun: result,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to run recovery pipeline",
        });
    }
}

export async function runBatch(req: AuthRequest, res: Response) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { limit, status } = req.body ?? {};
        const ipAddress = req.ip ?? req.socket.remoteAddress ?? "unknown";

        const result = await runRecoveryPipelineBatch(req.user.id, ipAddress, {
            limit: typeof limit === "number" ? limit : undefined,
            status: typeof status === "string" ? status : undefined,
        });

        return res.json({
            success: true,
            message: "Recovery pipeline batch executed successfully",
            data: {
                batchRun: result,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to run recovery pipeline batch",
        });
    }
}
