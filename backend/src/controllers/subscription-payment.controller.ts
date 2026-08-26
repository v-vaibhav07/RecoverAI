import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createSubscriptionPayment,
    getSubscriptionPayments,
    getSubscriptionPaymentById,
    updateSubscriptionPayment,
    deleteSubscriptionPayment,
} from "../services/subscription-payment/subscription-payment.service.js";

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
            subscriptionId,
            paymentId,
            billingPeriod,
            amount,
            currency,
            status,
            dueDate,
            paidAt,
        } = req.body;

        if (!subscriptionId) {
            return res.status(400).json({
                success: false,
                message: "Subscription ID is required",
            });
        }

        if (!paymentId) {
            return res.status(400).json({
                success: false,
                message: "Payment ID is required",
            });
        }

        if (!billingPeriod) {
            return res.status(400).json({
                success: false,
                message: "Billing period is required",
            });
        }

        if (amount === undefined || amount === null) {
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

        if (!dueDate) {
            return res.status(400).json({
                success: false,
                message: "Due date is required",
            });
        }

        const subscriptionPayment =
            await createSubscriptionPayment(
                req.user.id,
                {
                    subscriptionId,
                    paymentId,
                    billingPeriod,
                    amount: numericAmount,
                    currency,
                    status,
                    dueDate,
                    paidAt,
                }
            );

        return res.status(201).json({
            success: true,
            message:
                "Subscription payment created successfully",
            data: {
                subscriptionPayment,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to create subscription payment",
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

        const subscriptionPayments =
            await getSubscriptionPayments(
                req.user.id
            );

        return res.json({
            success: true,
            data: {
                subscriptionPayments,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch subscription payments",
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

        const subscriptionPaymentId =
            String(req.params.id);

        const subscriptionPayment =
            await getSubscriptionPaymentById(
                req.user.id,
                subscriptionPaymentId
            );

        return res.json({
            success: true,
            data: {
                subscriptionPayment,
            },
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Subscription payment not found",
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

        const subscriptionPaymentId =
            String(req.params.id);

        const {
            billingPeriod,
            amount,
            currency,
            status,
            dueDate,
            paidAt,
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

        const subscriptionPayment =
            await updateSubscriptionPayment(
                req.user.id,
                subscriptionPaymentId,
                {
                    billingPeriod,
                    amount: numericAmount,
                    currency,
                    status,
                    dueDate,
                    paidAt,
                }
            );

        return res.json({
            success: true,
            message:
                "Subscription payment updated successfully",
            data: {
                subscriptionPayment,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update subscription payment",
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

        const subscriptionPaymentId =
            String(req.params.id);

        await deleteSubscriptionPayment(
            req.user.id,
            subscriptionPaymentId
        );

        return res.json({
            success: true,
            message:
                "Subscription payment deleted successfully",
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Subscription payment not found",
        });
    }
}