import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createPaymentFailure,
    getPaymentFailures,
    getPaymentFailureById,
    updatePaymentFailure,
    deletePaymentFailure,
} from "../services/paymentFailure/paymentFailure.service.js";

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
            paymentAttemptId,
            failureCode,
            failureCategory,
            failureReason,
            retryable,
            severity,
            provider,
            metadata,
        } = req.body;

        if (!paymentId || !failureCategory) {
            return res.status(400).json({
                success: false,
                message: "Payment and failure category are required",
            });
        }

        const paymentFailure =
            await createPaymentFailure(
                req.user.id,
                paymentId,
                paymentAttemptId,
                failureCode,
                failureCategory,
                failureReason,
                retryable,
                severity,
                provider,
                metadata
            );

        return res.status(201).json({
            success: true,
            message: "Payment failure created successfully",
            data: {
                paymentFailure,
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

        const paymentFailures =
            await getPaymentFailures(req.user.id);

        return res.json({
            success: true,
            data: {
                paymentFailures,
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

        const paymentFailure =
            await getPaymentFailureById(
                req.user.id,
                req.params.id as string
            );

        return res.json({
            success: true,
            data: {
                paymentFailure,
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
            failureCode,
            failureCategory,
            failureReason,
            retryable,
            severity,
            provider,
            metadata,
        } = req.body;

        const paymentFailure =
            await updatePaymentFailure(
                req.user.id,
                req.params.id as string,
                {
                    failureCode,
                    failureCategory,
                    failureReason,
                    retryable,
                    severity,
                    provider,
                    metadata,
                }
            );

        return res.json({
            success: true,
            message: "Payment failure updated successfully",
            data: {
                paymentFailure,
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

        await deletePaymentFailure(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            message: "Payment failure deleted successfully",
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}