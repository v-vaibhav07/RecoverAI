import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createCheckoutSession,
    getCheckoutSessions,
    getCheckoutSessionById,
    updateCheckoutSession,
    deleteCheckoutSession,
} from "../services/checkout-session/checkout-session.service.js";

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
            customerId,
            orderId,
            amount,
            currency,
            status,
            lastActivityAt,
            completedAt,
            abandonedAt,
            expiresAt,
            metadata,
        } = req.body;

        if (
            amount === undefined ||
            amount === null
        ) {
            return res.status(400).json({
                success: false,
                message: "Amount is required",
            });
        }

        const numericAmount = Number(amount);

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount < 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Amount must be a valid non-negative number",
            });
        }

        const checkoutSession =
            await createCheckoutSession(
                req.user.id,
                {
                    customerId,
                    orderId,
                    amount: numericAmount,
                    currency,
                    status,
                    lastActivityAt,
                    completedAt,
                    abandonedAt,
                    expiresAt,
                    metadata,
                }
            );

        return res.status(201).json({
            success: true,
            message:
                "Checkout session created successfully",
            data: {
                checkoutSession,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function list(
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

        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                Number(req.query.limit) || 20,
                1
            ),
            100
        );

        const search =
            typeof req.query.search === "string"
                ? req.query.search
                : undefined;

        const result =
            await getCheckoutSessions(
                req.user.id,
                page,
                limit,
                search
            );

        return res.json({
            success: true,
            data: result,
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

        const checkoutSession =
            await getCheckoutSessionById(
                req.user.id,
                req.params.id as string
            );

        return res.json({
            success: true,
            data: {
                checkoutSession,
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
            amount,
            currency,
            status,
            lastActivityAt,
            completedAt,
            abandonedAt,
            expiresAt,
            metadata,
        } = req.body;

        let numericAmount:
            | number
            | undefined;

        if (amount !== undefined) {
            numericAmount = Number(amount);

            if (
                !Number.isFinite(numericAmount) ||
                numericAmount < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Amount must be a valid non-negative number",
                });
            }
        }

        const checkoutSession =
            await updateCheckoutSession(
                req.user.id,
                req.params.id as string,
                {
                    amount: numericAmount,
                    currency,
                    status,
                    lastActivityAt,
                    completedAt,
                    abandonedAt,
                    expiresAt,
                    metadata,
                }
            );

        return res.json({
            success: true,
            message:
                "Checkout session updated successfully",
            data: {
                checkoutSession,
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

        await deleteCheckoutSession(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            message:
                "Checkout session deleted successfully",
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
}