import { prisma } from "../../config/database.js";

async function getMerchantId(userId: string): Promise<string> {
    const profile = await prisma.profiles.findUnique({
        where: {
            id: userId,
        },
        select: {
            merchant_id: true,
            role: true,
            status: true,
        },
    });

    if (!profile) {
        throw new Error("Merchant profile not found");
    }

    if (profile.status !== "ACTIVE") {
        throw new Error("Merchant account is not active");
    }

    if (profile.role !== "MERCHANT") {
        throw new Error("Only merchants can access merchant settings");
    }

    return profile.merchant_id;
}

export async function createMerchantSettings(
    userId: string,
    data: {
        recoveryEnabled?: boolean;
        aiEnabled?: boolean;
        maxRetryAttempts?: number;
        defaultRetryDelayMinutes?: number;
        notificationEnabled?: boolean;
        settings?: any;
    }
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.merchant_settings.findUnique({
            where: {
                merchant_id: merchantId,
            },
        });

    if (existing) {
        throw new Error(
            "Merchant settings already exist"
        );
    }

    const merchantSettings =
        await prisma.merchant_settings.create({
            data: {
                merchant_id: merchantId,

                recovery_enabled:
                    data.recoveryEnabled !== undefined
                        ? data.recoveryEnabled
                        : true,

                ai_enabled:
                    data.aiEnabled !== undefined
                        ? data.aiEnabled
                        : true,

                max_retry_attempts:
                    data.maxRetryAttempts !== undefined
                        ? data.maxRetryAttempts
                        : 3,

                default_retry_delay_minutes:
                    data.defaultRetryDelayMinutes !== undefined
                        ? data.defaultRetryDelayMinutes
                        : 120,

                notification_enabled:
                    data.notificationEnabled !== undefined
                        ? data.notificationEnabled
                        : true,

                settings:
                    data.settings !== undefined
                        ? data.settings
                        : {},
            },
        });

    return merchantSettings;
}

export async function getMerchantSettings(
    userId: string
) {
    const merchantId = await getMerchantId(userId);

    const merchantSettings =
        await prisma.merchant_settings.findUnique({
            where: {
                merchant_id: merchantId,
            },
        });

    if (!merchantSettings) {
        throw new Error(
            "Merchant settings not found"
        );
    }

    return merchantSettings;
}

export async function updateMerchantSettings(
    userId: string,
    data: {
        recoveryEnabled?: boolean;
        aiEnabled?: boolean;
        maxRetryAttempts?: number;
        defaultRetryDelayMinutes?: number;
        notificationEnabled?: boolean;
        settings?: any;
    }
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.merchant_settings.findUnique({
            where: {
                merchant_id: merchantId,
            },
        });

    if (!existing) {
        throw new Error(
            "Merchant settings not found"
        );
    }

    if (
        data.maxRetryAttempts !== undefined &&
        data.maxRetryAttempts < 0
    ) {
        throw new Error(
            "Max retry attempts cannot be negative"
        );
    }

    if (
        data.defaultRetryDelayMinutes !== undefined &&
        data.defaultRetryDelayMinutes < 0
    ) {
        throw new Error(
            "Retry delay cannot be negative"
        );
    }

    const merchantSettings =
        await prisma.merchant_settings.update({
            where: {
                merchant_id: merchantId,
            },
            data: {
                ...(data.recoveryEnabled !== undefined && {
                    recovery_enabled:
                        data.recoveryEnabled,
                }),

                ...(data.aiEnabled !== undefined && {
                    ai_enabled:
                        data.aiEnabled,
                }),

                ...(data.maxRetryAttempts !== undefined && {
                    max_retry_attempts:
                        data.maxRetryAttempts,
                }),

                ...(data.defaultRetryDelayMinutes !== undefined && {
                    default_retry_delay_minutes:
                        data.defaultRetryDelayMinutes,
                }),

                ...(data.notificationEnabled !== undefined && {
                    notification_enabled:
                        data.notificationEnabled,
                }),

                ...(data.settings !== undefined && {
                    settings:
                        data.settings,
                }),
            },
        });

    return merchantSettings;
}

export async function deleteMerchantSettings(
    userId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.merchant_settings.findUnique({
            where: {
                merchant_id: merchantId,
            },
        });

    if (!existing) {
        throw new Error(
            "Merchant settings not found"
        );
    }

    await prisma.merchant_settings.delete({
        where: {
            merchant_id: merchantId,
        },
    });

    return {
        id: existing.id,
    };
}