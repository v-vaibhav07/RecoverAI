import { prisma } from "../../config/database.js";

async function getMerchantId(userId: string): Promise<string> {
    const profile = await prisma.profiles.findUnique({
        where: {
            id: userId,
        },
        select: {
            merchant_id: true,
        },
    });

    if (!profile) {
        throw new Error("Merchant profile not found");
    }

    return profile.merchant_id;
}

export async function createAuditLog(
    userId: string,
    data: {
        userId?: string;
        action: string;
        entityType?: string;
        entityId?: string;
        oldValues?: any;
        newValues?: any;
        ipAddress: string;
        userAgent?: string;
    }
) {
    const merchantId = await getMerchantId(userId);

    if (!data.action) {
        throw new Error("Action is required");
    }

    if (!data.ipAddress) {
        throw new Error("IP address is required");
    }

    if (data.userId) {
        const user = await prisma.users.findFirst({
            where: {
                id: data.userId,
            },
        });

        if (!user) {
            throw new Error("User not found");
        }
    }

    const auditLog = await prisma.audit_logs.create({
        data: {
            merchant_id: merchantId,
            user_id: data.userId,
            action: data.action,
            entity_type: data.entityType,
            entity_id: data.entityId,
            old_values: data.oldValues,
            new_values: data.newValues,
            ip_address: data.ipAddress,
            user_agent: data.userAgent,
        },
        include: {
            merchants: true,
            users: true,
        },
    });

    return auditLog;
}

export async function getAuditLogs(
    userId: string
) {
    const merchantId = await getMerchantId(userId);

    const auditLogs = await prisma.audit_logs.findMany({
        where: {
            merchant_id: merchantId,
        },
        include: {
            merchants: true,
            users: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });

    return auditLogs;
}

export async function getAuditLogById(
    userId: string,
    auditLogId: string
) {
    const merchantId = await getMerchantId(userId);

    const auditLog = await prisma.audit_logs.findFirst({
        where: {
            id: auditLogId,
            merchant_id: merchantId,
        },
        include: {
            merchants: true,
            users: true,
        },
    });

    if (!auditLog) {
        throw new Error("Audit log not found");
    }

    return auditLog;
}

export async function updateAuditLog(
    userId: string,
    auditLogId: string,
    data: {
        action?: string;
        entityType?: string;
        entityId?: string;
        oldValues?: any;
        newValues?: any;
        ipAddress?: string;
        userAgent?: string;
    }
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.audit_logs.findFirst({
        where: {
            id: auditLogId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Audit log not found");
    }

    const auditLog = await prisma.audit_logs.update({
        where: {
            id: auditLogId,
        },
        data: {
            ...(data.action !== undefined && {
                action: data.action,
            }),

            ...(data.entityType !== undefined && {
                entity_type: data.entityType,
            }),

            ...(data.entityId !== undefined && {
                entity_id: data.entityId,
            }),

            ...(data.oldValues !== undefined && {
                old_values: data.oldValues,
            }),

            ...(data.newValues !== undefined && {
                new_values: data.newValues,
            }),

            ...(data.ipAddress !== undefined && {
                ip_address: data.ipAddress,
            }),

            ...(data.userAgent !== undefined && {
                user_agent: data.userAgent,
            }),
        },
        include: {
            merchants: true,
            users: true,
        },
    });

    return auditLog;
}

export async function deleteAuditLog(
    userId: string,
    auditLogId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.audit_logs.findFirst({
        where: {
            id: auditLogId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Audit log not found");
    }

    await prisma.audit_logs.delete({
        where: {
            id: auditLogId,
        },
    });
}