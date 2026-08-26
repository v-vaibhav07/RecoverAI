import { prisma } from "../../config/database.js";

interface CreateNotificationData {
    customerId?: string;
    recoveryCaseId?: string;
    channel: string;
    template?: string;
    recipient?: string;
    subject?: string;
    content?: string;
    status?: string;
    sentAt?: string | Date;
    deliveredAt?: string | Date;
    failedAt?: string | Date;
    providerId?: string;
    metadata?: any;
}

interface UpdateNotificationData {
    customerId?: string;
    recoveryCaseId?: string;
    channel?: string;
    template?: string;
    recipient?: string;
    subject?: string;
    content?: string;
    status?: string;
    sentAt?: string | Date;
    deliveredAt?: string | Date;
    failedAt?: string | Date;
    providerId?: string;
    metadata?: any;
}

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
        throw new Error("Only merchants can access notifications");
    }

    return profile.merchant_id;
}

async function verifyCustomer(
    merchantId: string,
    customerId: string
) {
    const customer = await prisma.customers.findFirst({
        where: {
            id: customerId,
            merchant_id: merchantId,
        },
    });

    if (!customer) {
        throw new Error("Customer not found");
    }

    return customer;
}

async function verifyRecoveryCase(
    merchantId: string,
    recoveryCaseId: string
) {
    const recoveryCase = await prisma.recovery_cases.findFirst({
        where: {
            id: recoveryCaseId,
            merchant_id: merchantId,
        },
    });

    if (!recoveryCase) {
        throw new Error("Recovery case not found");
    }

    return recoveryCase;
}

export async function createNotification(
    userId: string,
    data: CreateNotificationData
) {
    const merchantId = await getMerchantId(userId);

    if (data.customerId) {
        await verifyCustomer(
            merchantId,
            data.customerId
        );
    }

    if (data.recoveryCaseId) {
        await verifyRecoveryCase(
            merchantId,
            data.recoveryCaseId
        );
    }

    const notification =
        await prisma.notifications.create({
            data: {
                merchant_id: merchantId,
                customer_id: data.customerId,
                recovery_case_id: data.recoveryCaseId,
                channel: data.channel as any,
                template: data.template,
                recipient: data.recipient,
                subject: data.subject,
                content: data.content,
                status: data.status
                    ? (data.status as any)
                    : "PENDING",
                sent_at: data.sentAt
                    ? new Date(data.sentAt)
                    : undefined,
                delivered_at: data.deliveredAt
                    ? new Date(data.deliveredAt)
                    : undefined,
                failed_at: data.failedAt
                    ? new Date(data.failedAt)
                    : undefined,
                provider_id: data.providerId,
                metadata:
                    data.metadata !== undefined
                        ? data.metadata
                        : {},
            },
            include: {
                customers: true,
                merchants: true,
                recovery_cases: true,
            },
        });

    return notification;
}

export async function getNotifications(
    userId: string,
    page = 1,
    limit = 20,
    search?: string
) {
    const merchantId = await getMerchantId(userId);

    const skip = (page - 1) * limit;

    const where: any = {
        merchant_id: merchantId,
    };

    if (search) {
        where.OR = [
            {
                recipient: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                subject: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                content: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const [notifications, total] =
        await Promise.all([
            prisma.notifications.findMany({
                where,
                orderBy: {
                    created_at: "desc",
                },
                skip,
                take: limit,
                include: {
                    customers: true,
                    recovery_cases: true,
                },
            }),

            prisma.notifications.count({
                where,
            }),
        ]);

    return {
        notifications,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };
}

export async function getNotificationById(
    userId: string,
    notificationId: string
) {
    const merchantId = await getMerchantId(userId);

    const notification =
        await prisma.notifications.findFirst({
            where: {
                id: notificationId,
                merchant_id: merchantId,
            },
            include: {
                customers: true,
                merchants: true,
                recovery_cases: true,
            },
        });

    if (!notification) {
        throw new Error("Notification not found");
    }

    return notification;
}

export async function updateNotification(
    userId: string,
    notificationId: string,
    data: UpdateNotificationData
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.notifications.findFirst({
            where: {
                id: notificationId,
                merchant_id: merchantId,
            },
        });

    if (!existing) {
        throw new Error("Notification not found");
    }

    if (data.customerId !== undefined) {
        await verifyCustomer(
            merchantId,
            data.customerId
        );
    }

    if (data.recoveryCaseId !== undefined) {
        await verifyRecoveryCase(
            merchantId,
            data.recoveryCaseId
        );
    }

    const notification =
        await prisma.notifications.update({
            where: {
                id: notificationId,
            },
            data: {
                ...(data.customerId !== undefined && {
                    customer_id: data.customerId,
                }),

                ...(data.recoveryCaseId !== undefined && {
                    recovery_case_id:
                        data.recoveryCaseId,
                }),

                ...(data.channel !== undefined && {
                    channel: data.channel as any,
                }),

                ...(data.template !== undefined && {
                    template: data.template,
                }),

                ...(data.recipient !== undefined && {
                    recipient: data.recipient,
                }),

                ...(data.subject !== undefined && {
                    subject: data.subject,
                }),

                ...(data.content !== undefined && {
                    content: data.content,
                }),

                ...(data.status !== undefined && {
                    status: data.status as any,
                }),

                ...(data.sentAt !== undefined && {
                    sent_at: data.sentAt
                        ? new Date(data.sentAt)
                        : null,
                }),

                ...(data.deliveredAt !== undefined && {
                    delivered_at: data.deliveredAt
                        ? new Date(data.deliveredAt)
                        : null,
                }),

                ...(data.failedAt !== undefined && {
                    failed_at: data.failedAt
                        ? new Date(data.failedAt)
                        : null,
                }),

                ...(data.providerId !== undefined && {
                    provider_id: data.providerId,
                }),

                ...(data.metadata !== undefined && {
                    metadata: data.metadata,
                }),
            },
            include: {
                customers: true,
                recovery_cases: true,
            },
        });

    return notification;
}

export async function deleteNotification(
    userId: string,
    notificationId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.notifications.findFirst({
            where: {
                id: notificationId,
                merchant_id: merchantId,
            },
        });

    if (!existing) {
        throw new Error("Notification not found");
    }

    await prisma.notifications.delete({
        where: {
            id: notificationId,
        },
    });

    return {
        id: notificationId,
    };
}