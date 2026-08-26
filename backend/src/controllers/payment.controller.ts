import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createPayment,
    getPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
} from "../services/payment/payment.service.js";

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
            transactionId,
            paymentMethodId,
            amount,
            provider,
            providerPaymentId,
            status,
            failureCode,
            failureMessage,
            metadata,
        } = req.body;

        if (amount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Payment amount is required",
            });
        }

        const payment = await createPayment(
            req.user.id,
            customerId,
            transactionId,
            paymentMethodId,
            Number(amount),
            provider,
            providerPaymentId,
            status,
            failureCode,
            failureMessage,
            metadata
        );

        return res.status(201).json({
            success: true,
            message: "Payment created successfully",
            data: {
                payment,
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

        const payments = await getPayments(
            req.user.id
        );

        return res.json({
            success: true,
            data: {
                payments,
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

        const payment = await getPaymentById(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            data: {
                payment,
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
            provider,
            providerPaymentId,
            status,
            failureCode,
            failureMessage,
            metadata,
        } = req.body;

        const payment = await updatePayment(
            req.user.id,
            req.params.id as string,
            {
                provider,
                providerPaymentId,
                status,
                failureCode,
                failureMessage,
                metadata,
            }
        );

        return res.json({
            success: true,
            message: "Payment updated successfully",
            data: {
                payment,
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

        await deletePayment(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            message: "Payment deleted successfully",
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}