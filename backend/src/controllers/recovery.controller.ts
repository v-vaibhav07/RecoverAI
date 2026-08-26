import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createRecoveryCase,
    getRecoveryCases,
    getRecoveryCaseById,
    updateRecoveryCase,
    deleteRecoveryCase,
} from "../services/recovery/recovery.service.js";

export async function create(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const {
            paymentId,
            priority,
        } = req.body;

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: "Payment ID is required",
            });
        }

        const recoveryCase = await createRecoveryCase(
            req.user.id,
            paymentId,
            priority
        );

        return res.status(201).json({
            success: true,
            message: "Recovery case created successfully",
            data: {
                recoveryCase,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function getAll(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const recoveryCases = await getRecoveryCases(
            req.user.id
        );

        return res.json({
            success: true,
            data: {
                recoveryCases,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function getById(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const recoveryCase = await getRecoveryCaseById(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            data: {
                recoveryCase,
            },
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
}

export async function update(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const {
            recoverableAmount,
            recoveredAmount,
            recoveryScore,
            recoveryProbability,
            expectedRecoveryAmount,
            status,
            priority,
            closedAt,
        } = req.body;

        const recoveryCase = await updateRecoveryCase(
            req.user.id,
            req.params.id as string,
            {
                recoverableAmount:
                    recoverableAmount !== undefined
                        ? Number(recoverableAmount)
                        : undefined,

                recoveredAmount:
                    recoveredAmount !== undefined
                        ? Number(recoveredAmount)
                        : undefined,

                recoveryScore:
                    recoveryScore !== undefined
                        ? Number(recoveryScore)
                        : undefined,

                recoveryProbability:
                    recoveryProbability !== undefined
                        ? Number(recoveryProbability)
                        : undefined,

                expectedRecoveryAmount:
                    expectedRecoveryAmount !== undefined
                        ? Number(expectedRecoveryAmount)
                        : undefined,

                status,
                priority,

                closedAt:
                    closedAt !== undefined
                        ? closedAt
                            ? new Date(closedAt)
                            : null
                        : undefined,
            }
        );

        return res.json({
            success: true,
            message: "Recovery case updated successfully",
            data: {
                recoveryCase,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function remove(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        await deleteRecoveryCase(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            message: "Recovery case deleted successfully",
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}