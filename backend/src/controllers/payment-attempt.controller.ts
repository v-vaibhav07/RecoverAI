import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createPaymentAttempt,
    getPaymentAttempts,
    getPaymentAttemptById,
    updatePaymentAttempt,
    deletePaymentAttempt,
} from "../services/payment-attempt/payment-attempt.service.js";

export async function create(
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

        const {
            paymentId,
            attemptNumber,
            amount,
            paymentMethodId,
            provider,
            status,
            failureCode,
            failureCategory,
            providerResponse,
            startedAt,
            completedAt,
        } = req.body;

        if (
            !paymentId ||
            attemptNumber === undefined ||
            amount === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Payment ID, attempt number and amount are required",
            });
        }

        const attempt = await createPaymentAttempt(
            req.user.id,
            paymentId,
            Number(attemptNumber),
            Number(amount),
            paymentMethodId,
            provider,
            status,
            failureCode,
            failureCategory,
            providerResponse,
            startedAt
                ? new Date(startedAt)
                : undefined,
            completedAt
                ? new Date(completedAt)
                : undefined
        );

        return res.status(201).json({
            success: true,
            message: "Payment attempt created successfully",
            data: {
                paymentAttempt: attempt,
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
                message: "Authentication required",
            });
        }

        const attempts = await getPaymentAttempts(
            req.user.id
        );

        return res.json({
            success: true,
            data: {
                paymentAttempts: attempts,
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
                message: "Authentication required",
            });
        }

        const attempt = await getPaymentAttemptById(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            data: {
                paymentAttempt: attempt,
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
                message: "Authentication required",
            });
        }

        const {
            status,
            failureCode,
            failureCategory,
            providerResponse,
            startedAt,
            completedAt,
        } = req.body;

        const attempt = await updatePaymentAttempt(
            req.user.id,
            req.params.id as string,
            {
                status,
                failureCode,
                failureCategory,
                providerResponse,

                startedAt:
                    startedAt !== undefined
                        ? new Date(startedAt)
                        : undefined,

                completedAt:
                    completedAt !== undefined
                        ? new Date(completedAt)
                        : undefined,
            }
        );

        return res.json({
            success: true,
            message: "Payment attempt updated successfully",
            data: {
                paymentAttempt: attempt,
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
                message: "Authentication required",
            });
        }

        await deletePaymentAttempt(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            message: "Payment attempt deleted successfully",
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
}