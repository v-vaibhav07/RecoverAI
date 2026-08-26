import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
    createSubscription,
    getSubscriptions,
    getSubscriptionById,
    updateSubscription,
    cancelSubscription,
    deleteSubscription,
} from "../services/subscription/subscription.service.js";

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
            customerId,
            productId,
            planName,
            amount,
            billingInterval,
        } = req.body;

        if (
            !customerId ||
            amount === undefined ||
            !billingInterval
        ) {
            return res.status(400).json({
                success: false,
                message: "Customer, amount and billing interval are required",
            });
        }

        const subscription = await createSubscription(
            req.user.id,
            customerId,
            productId,
            planName,
            Number(amount),
            billingInterval
        );

        return res.status(201).json({
            success: true,
            message: "Subscription created successfully",
            data: {
                subscription,
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

        const subscriptions = await getSubscriptions(
            req.user.id
        );

        return res.json({
            success: true,
            data: {
                subscriptions,
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

        const subscription = await getSubscriptionById(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            data: {
                subscription,
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
            planName,
            amount,
            billingInterval,
            status,
        } = req.body;

        const subscription = await updateSubscription(
            req.user.id,
            req.params.id as string,
            {
                planName,
                amount: amount !== undefined
                    ? Number(amount)
                    : undefined,
                billingInterval,
                status,
            }
        );

        return res.json({
            success: true,
            message: "Subscription updated successfully",
            data: {
                subscription,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function cancel(
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

        const subscription = await cancelSubscription(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            message: "Subscription cancelled successfully",
            data: {
                subscription,
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

        await deleteSubscription(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            message: "Subscription deleted successfully",
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}
