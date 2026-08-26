import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createMerchantSettings,
    getMerchantSettings,
    updateMerchantSettings,
    deleteMerchantSettings,
} from "../services/merchant-settings/merchant-settings.service.js";

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
            recoveryEnabled,
            aiEnabled,
            maxRetryAttempts,
            defaultRetryDelayMinutes,
            notificationEnabled,
            settings,
        } = req.body;

        let numericMaxRetryAttempts:
            | number
            | undefined;

        let numericRetryDelay:
            | number
            | undefined;

        if (maxRetryAttempts !== undefined) {
            numericMaxRetryAttempts =
                Number(maxRetryAttempts);

            if (
                !Number.isInteger(
                    numericMaxRetryAttempts
                ) ||
                numericMaxRetryAttempts < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Max retry attempts must be a valid non-negative integer",
                });
            }
        }

        if (
            defaultRetryDelayMinutes !== undefined
        ) {
            numericRetryDelay =
                Number(
                    defaultRetryDelayMinutes
                );

            if (
                !Number.isInteger(
                    numericRetryDelay
                ) ||
                numericRetryDelay < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Retry delay must be a valid non-negative integer",
                });
            }
        }

        const merchantSettings =
            await createMerchantSettings(
                req.user.id,
                {
                    recoveryEnabled,
                    aiEnabled,
                    maxRetryAttempts:
                        numericMaxRetryAttempts,
                    defaultRetryDelayMinutes:
                        numericRetryDelay,
                    notificationEnabled,
                    settings,
                }
            );

        return res.status(201).json({
            success: true,
            message:
                "Merchant settings created successfully",
            data: {
                merchantSettings,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function get(
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

        const merchantSettings =
            await getMerchantSettings(
                req.user.id
            );

        return res.json({
            success: true,
            data: {
                merchantSettings,
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
            recoveryEnabled,
            aiEnabled,
            maxRetryAttempts,
            defaultRetryDelayMinutes,
            notificationEnabled,
            settings,
        } = req.body;

        let numericMaxRetryAttempts:
            | number
            | undefined;

        let numericRetryDelay:
            | number
            | undefined;

        if (maxRetryAttempts !== undefined) {
            numericMaxRetryAttempts =
                Number(maxRetryAttempts);

            if (
                !Number.isInteger(
                    numericMaxRetryAttempts
                ) ||
                numericMaxRetryAttempts < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Max retry attempts must be a valid non-negative integer",
                });
            }
        }

        if (
            defaultRetryDelayMinutes !== undefined
        ) {
            numericRetryDelay =
                Number(
                    defaultRetryDelayMinutes
                );

            if (
                !Number.isInteger(
                    numericRetryDelay
                ) ||
                numericRetryDelay < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Retry delay must be a valid non-negative integer",
                });
            }
        }

        const merchantSettings =
            await updateMerchantSettings(
                req.user.id,
                {
                    recoveryEnabled,
                    aiEnabled,
                    maxRetryAttempts:
                        numericMaxRetryAttempts,
                    defaultRetryDelayMinutes:
                        numericRetryDelay,
                    notificationEnabled,
                    settings,
                }
            );

        return res.json({
            success: true,
            message:
                "Merchant settings updated successfully",
            data: {
                merchantSettings,
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

        await deleteMerchantSettings(
            req.user.id
        );

        return res.json({
            success: true,
            message:
                "Merchant settings deleted successfully",
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
}