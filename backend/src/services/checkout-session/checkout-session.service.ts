import { prisma } from "../../config/database.js";

interface CreateCheckoutSessionData {
    customerId?: string;
    orderId?: string;
    amount: number;
    currency?: string;
    status?: string;
    lastActivityAt?: string;
    completedAt?: string;
    abandonedAt?: string;
    expiresAt?: string;
    metadata?: any;
}

interface UpdateCheckoutSessionData {
    amount?: number;
    currency?: string;
    status?: string;
    lastActivityAt?: string;
    completedAt?: string | null;
    abandonedAt?: string | null;
    expiresAt?: string | null;
    metadata?: any;
}

async function getMerchantId(
    userId: string
): Promise<string> {
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
        throw new Error("Only merchants can access checkout sessions");
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

async function verifyOrder(
    merchantId: string,
    orderId: string
) {
    const order = await prisma.orders.findFirst({
        where: {
            id: orderId,
            merchant_id: merchantId,
        },
    });

    if (!order) {
        throw new Error("Order not found");
    }

    return order;
}

function parseDate(
    value: string | undefined
): Date | undefined {
    if (!value) {
        return undefined;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${value}`);
    }

    return date;
}

function parseNullableDate(
    value: string | null | undefined
): Date | null | undefined {
    if (value === null) {
        return null;
    }

    if (value === undefined) {
        return undefined;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${value}`);
    }

    return date;
}

export async function createCheckoutSession(
    userId: string,
    data: CreateCheckoutSessionData
) {
    const merchantId = await getMerchantId(userId);

    if (data.customerId) {
        await verifyCustomer(
            merchantId,
            data.customerId
        );
    }

    if (data.orderId) {
        await verifyOrder(
            merchantId,
            data.orderId
        );
    }

    const checkoutSession =
        await prisma.checkout_sessions.create({
            data: {
                merchant_id: merchantId,
                customer_id: data.customerId,
                order_id: data.orderId,
                amount: data.amount,
                currency: data.currency || "INR",
                status: data.status
                    ? (data.status as any)
                    : "CREATED",
                last_activity_at:
                    parseDate(data.lastActivityAt) ||
                    new Date(),
                completed_at:
                    parseDate(data.completedAt),
                abandoned_at:
                    parseDate(data.abandonedAt),
                expires_at:
                    parseDate(data.expiresAt),
                metadata: data.metadata || {},
            },
            include: {
                customers: true,
                merchants: true,
                orders: true,
                recovery_cases: true,
            },
        });

    return checkoutSession;
}

export async function getCheckoutSessions(
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
                status: {
                    equals: search.toUpperCase(),
                },
            },
            {
                currency: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const [checkoutSessions, total] =
        await Promise.all([
            prisma.checkout_sessions.findMany({
                where,
                orderBy: {
                    created_at: "desc",
                },
                skip,
                take: limit,
                include: {
                    customers: true,
                    orders: true,
                },
            }),

            prisma.checkout_sessions.count({
                where,
            }),
        ]);

    return {
        checkoutSessions,
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

export async function getCheckoutSessionById(
    userId: string,
    checkoutSessionId: string
) {
    const merchantId = await getMerchantId(userId);

    const checkoutSession =
        await prisma.checkout_sessions.findFirst({
            where: {
                id: checkoutSessionId,
                merchant_id: merchantId,
            },
            include: {
                customers: true,
                merchants: true,
                orders: true,
                recovery_cases: true,
            },
        });

    if (!checkoutSession) {
        throw new Error("Checkout session not found");
    }

    return checkoutSession;
}

export async function updateCheckoutSession(
    userId: string,
    checkoutSessionId: string,
    data: UpdateCheckoutSessionData
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.checkout_sessions.findFirst({
            where: {
                id: checkoutSessionId,
                merchant_id: merchantId,
            },
        });

    if (!existing) {
        throw new Error("Checkout session not found");
    }

    const checkoutSession =
        await prisma.checkout_sessions.update({
            where: {
                id: checkoutSessionId,
            },
            data: {
                ...(data.amount !== undefined && {
                    amount: data.amount,
                }),

                ...(data.currency !== undefined && {
                    currency: data.currency,
                }),

                ...(data.status !== undefined && {
                    status: data.status as any,
                }),

                ...(data.lastActivityAt !== undefined && {
                    last_activity_at:
                        parseDate(
                            data.lastActivityAt
                        ),
                }),

                ...(data.completedAt !== undefined && {
                    completed_at:
                        parseNullableDate(
                            data.completedAt
                        ),
                }),

                ...(data.abandonedAt !== undefined && {
                    abandoned_at:
                        parseNullableDate(
                            data.abandonedAt
                        ),
                }),

                ...(data.expiresAt !== undefined && {
                    expires_at:
                        parseNullableDate(
                            data.expiresAt
                        ),
                }),

                ...(data.metadata !== undefined && {
                    metadata: data.metadata,
                }),
            },
            include: {
                customers: true,
                merchants: true,
                orders: true,
                recovery_cases: true,
            },
        });

    return checkoutSession;
}

export async function deleteCheckoutSession(
    userId: string,
    checkoutSessionId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.checkout_sessions.findFirst({
            where: {
                id: checkoutSessionId,
                merchant_id: merchantId,
            },
        });

    if (!existing) {
        throw new Error("Checkout session not found");
    }

    await prisma.checkout_sessions.delete({
        where: {
            id: checkoutSessionId,
        },
    });

    return {
        id: checkoutSessionId,
    };
}