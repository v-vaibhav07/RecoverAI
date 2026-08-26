import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createNotification,
    getNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
} from "../services/notification/notification.service.js";

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
            recoveryCaseId,
            channel,
            template,
            recipient,
            subject,
            content,
            status,
            sentAt,
            deliveredAt,
            failedAt,
            providerId,
            metadata,
        } = req.body;

        if (!channel) {
            return res.status(400).json({
                success: false,
                message: "Notification channel is required",
            });
        }

        const notification =
            await createNotification(
                req.user.id,
                {
                    customerId,
                    recoveryCaseId,
                    channel,
                    template,
                    recipient,
                    subject,
                    content,
                    status,
                    sentAt,
                    deliveredAt,
                    failedAt,
                    providerId,
                    metadata,
                }
            );

        return res.status(201).json({
            success: true,
            message:
                "Notification created successfully",
            data: {
                notification,
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
            await getNotifications(
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

        const notification =
            await getNotificationById(
                req.user.id,
                req.params.id as string
            );

        return res.json({
            success: true,
            data: {
                notification,
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
            customerId,
            recoveryCaseId,
            channel,
            template,
            recipient,
            subject,
            content,
            status,
            sentAt,
            deliveredAt,
            failedAt,
            providerId,
            metadata,
        } = req.body;

        const notification =
            await updateNotification(
                req.user.id,
                req.params.id as string,
                {
                    customerId,
                    recoveryCaseId,
                    channel,
                    template,
                    recipient,
                    subject,
                    content,
                    status,
                    sentAt,
                    deliveredAt,
                    failedAt,
                    providerId,
                    metadata,
                }
            );

        return res.json({
            success: true,
            message:
                "Notification updated successfully",
            data: {
                notification,
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

        await deleteNotification(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            message:
                "Notification deleted successfully",
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
}