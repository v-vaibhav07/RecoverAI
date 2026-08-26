import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createRecoveryAction,
    getRecoveryActions,
    getRecoveryActionById,
    updateRecoveryAction,
    deleteRecoveryAction,
} from "../services/recovery-action/recovery-action.service.js";

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
            recoveryCaseId,
            actionType,
            strategyId,
            status,
            scheduledAt,
            metadata,
        } = req.body;

        if (!recoveryCaseId || !actionType) {
            return res.status(400).json({
                success: false,
                message: "Recovery case and action type are required",
            });
        }

        const action = await createRecoveryAction(
            req.user.id,
            recoveryCaseId,
            actionType,
            strategyId,
            status,
            scheduledAt
                ? new Date(scheduledAt)
                : undefined,
            metadata
        );

        return res.status(201).json({
            success: true,
            message: "Recovery action created successfully",
            data: {
                recoveryAction: action,
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

        const actions = await getRecoveryActions(
            req.user.id
        );

        return res.json({
            success: true,
            data: {
                recoveryActions: actions,
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

        const action = await getRecoveryActionById(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            data: {
                recoveryAction: action,
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
            actionType,
            status,
            scheduledAt,
            startedAt,
            completedAt,
            result,
            error,
            metadata,
        } = req.body;

        const action = await updateRecoveryAction(
            req.user.id,
            req.params.id as string,
            {
                actionType,
                status,

                scheduledAt:
                    scheduledAt !== undefined
                        ? new Date(scheduledAt)
                        : undefined,

                startedAt:
                    startedAt !== undefined
                        ? new Date(startedAt)
                        : undefined,

                completedAt:
                    completedAt !== undefined
                        ? new Date(completedAt)
                        : undefined,

                result,
                error,
                metadata,
            }
        );

        return res.json({
            success: true,
            message: "Recovery action updated successfully",
            data: {
                recoveryAction: action,
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

        await deleteRecoveryAction(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            message: "Recovery action deleted successfully",
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}