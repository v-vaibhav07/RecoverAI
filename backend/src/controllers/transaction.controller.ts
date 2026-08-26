import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createTransaction,
    getTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
} from "../services/transaction/transaction.service.js";

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
            externalTransactionId,
            amount,
            currency,
            type,
            status,
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

        const transaction = await createTransaction(
            req.user.id,
            {
                customerId,
                orderId,
                externalTransactionId,
                amount: numericAmount,
                currency,
                type,
                status,
                metadata,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Transaction created successfully",
            data: {
                transaction,
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

        const result = await getTransactions(
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

        const transactionId = String(req.params.id);

        const transaction = await getTransactionById(
            req.user.id,
            transactionId
        );

        return res.json({
            success: true,
            data: {
                transaction,
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
            externalTransactionId,
            amount,
            currency,
            type,
            status,
            metadata,
        } = req.body;

        let numericAmount: number | undefined;

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

        const transactionId = String(req.params.id);

        const transaction = await updateTransaction(
            req.user.id,
            transactionId,
            {
                externalTransactionId,
                amount: numericAmount,
                currency,
                type,
                status,
                metadata,
            }
        );

        return res.json({
            success: true,
            message: "Transaction updated successfully",
            data: {
                transaction,
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

        const transactionId = String(req.params.id);

        await deleteTransaction(
            req.user.id,
            transactionId
        );

        return res.json({
            success: true,
            message: "Transaction deleted successfully",
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
}