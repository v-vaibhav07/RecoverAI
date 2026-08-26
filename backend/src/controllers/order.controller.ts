import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
} from "../services/order/order.service.js";

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
            orderNumber,
            totalAmount,
            currency,
            status,
            metadata,
        } = req.body;

        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: "Customer ID is required",
            });
        }

        if (!orderNumber) {
            return res.status(400).json({
                success: false,
                message: "Order number is required",
            });
        }

        if (
            totalAmount === undefined ||
            totalAmount === null
        ) {
            return res.status(400).json({
                success: false,
                message: "Total amount is required",
            });
        }

        const order = await createOrder(
            req.user.id,
            {
                customerId,
                orderNumber,
                totalAmount: Number(totalAmount),
                currency,
                status,
                metadata,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: {
                order,
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

        const result = await getOrders(
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

        const orderId = String(req.params.id);

        const order = await getOrderById(
            req.user.id,
            orderId
        );

        return res.json({
            success: true,
            data: {
                order,
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

        const orderId = String(req.params.id);

        const order = await updateOrder(
            req.user.id,
            orderId,
            req.body
        );

        return res.json({
            success: true,
            message: "Order updated successfully",
            data: {
                order,
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

        const orderId = String(req.params.id);

        await deleteOrder(
            req.user.id,
            orderId
        );

        return res.json({
            success: true,
            message: "Order deleted successfully",
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
}