import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createAuditLog,
    getAuditLogs,
    getAuditLogById,
    updateAuditLog,
    deleteAuditLog,
} from "../services/audit-log/audit-log.service.js";

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
            userId,
            action,
            entityType,
            entityId,
            oldValues,
            newValues,
            ipAddress,
            userAgent,
        } = req.body;

        if (!action) {
            return res.status(400).json({
                success: false,
                message: "Action is required",
            });
        }

        if (!ipAddress) {
            return res.status(400).json({
                success: false,
                message: "IP address is required",
            });
        }

        const auditLog = await createAuditLog(
            req.user.id,
            {
                userId,
                action,
                entityType,
                entityId,
                oldValues,
                newValues,
                ipAddress,
                userAgent,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Audit log created successfully",
            data: {
                auditLog,
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

        const auditLogs = await getAuditLogs(
            req.user.id
        );

        return res.json({
            success: true,
            data: {
                auditLogs,
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

        const auditLogId = String(req.params.id);

        const auditLog = await getAuditLogById(
            req.user.id,
            auditLogId
        );

        return res.json({
            success: true,
            data: {
                auditLog,
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
            action,
            entityType,
            entityId,
            oldValues,
            newValues,
            ipAddress,
            userAgent,
        } = req.body;

        const auditLogId = String(req.params.id);

        const auditLog = await updateAuditLog(
            req.user.id,
            auditLogId,
            {
                action,
                entityType,
                entityId,
                oldValues,
                newValues,
                ipAddress,
                userAgent,
            }
        );

        return res.json({
            success: true,
            message: "Audit log updated successfully",
            data: {
                auditLog,
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

        const auditLogId = String(req.params.id);

        await deleteAuditLog(
            req.user.id,
            auditLogId
        );

        return res.json({
            success: true,
            message: "Audit log deleted successfully",
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
}