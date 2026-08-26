import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createRecoveryStrategy,
    getRecoveryStrategies,
    getRecoveryStrategyById,
    updateRecoveryStrategy,
    deleteRecoveryStrategy,
} from "../services/recovery-strategy/recovery-strategy.service.js";

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
            name,
            type,
            description,
            configuration,
            isActive,
        } = req.body;

        if (!name || !type) {
            return res.status(400).json({
                success: false,
                message: "Strategy name and type are required",
            });
        }

        const strategy = await createRecoveryStrategy(
            req.user.id,
            name,
            type,
            description,
            configuration,
            isActive
        );

        return res.status(201).json({
            success: true,
            message: "Recovery strategy created successfully",
            data: {
                recoveryStrategy: strategy,
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

        const strategies = await getRecoveryStrategies(
            req.user.id
        );

        return res.json({
            success: true,
            data: {
                recoveryStrategies: strategies,
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

        const strategy = await getRecoveryStrategyById(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            data: {
                recoveryStrategy: strategy,
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
            name,
            type,
            description,
            configuration,
            isActive,
        } = req.body;

        const strategy = await updateRecoveryStrategy(
            req.user.id,
            req.params.id as string,
            {
                name,
                type,
                description,
                configuration,
                isActive,
            }
        );

        return res.json({
            success: true,
            message: "Recovery strategy updated successfully",
            data: {
                recoveryStrategy: strategy,
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

        await deleteRecoveryStrategy(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            message: "Recovery strategy deleted successfully",
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}