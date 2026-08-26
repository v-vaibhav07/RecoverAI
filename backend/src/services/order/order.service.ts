import { prisma } from "../../config/database.js";

interface CreateOrderData {
    customerId: string;
    orderNumber: string;
    totalAmount: number;
    currency?: string;
    status?: string;
    metadata?: any;
}

interface UpdateOrderData {
    orderNumber?: string;
    totalAmount?: number;
    currency?: string;
    status?: string;
    metadata?: any;
}

async function getMerchantId(userId: string) {
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
        throw new Error("Only merchants can access orders");
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

export async function createOrder(
    userId: string,
    data: CreateOrderData
) {
    const merchantId = await getMerchantId(userId);

    await verifyCustomer(
        merchantId,
        data.customerId
    );

    const existing = await prisma.orders.findFirst({
        where: {
            merchant_id: merchantId,
            order_number: data.orderNumber,
        },
    });

    if (existing) {
        throw new Error(
            "Order with this order number already exists"
        );
    }

    const order = await prisma.orders.create({
        data: {
            merchant_id: merchantId,
            customer_id: data.customerId,
            order_number: data.orderNumber,
            total_amount: data.totalAmount,
            currency: data.currency || "INR",
            status: data.status || "PENDING",
            metadata: data.metadata || {},
        },
        include: {
            customers: true,
            merchants: true,
            transactions: true,
            checkout_sessions: true,
        },
    });

    return order;
}

export async function getOrders(
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
                order_number: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                status: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const [orders, total] = await Promise.all([
        prisma.orders.findMany({
            where,
            orderBy: {
                created_at: "desc",
            },
            skip,
            take: limit,
            include: {
                customers: true,
            },
        }),

        prisma.orders.count({
            where,
        }),
    ]);

    return {
        orders,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getOrderById(
    userId: string,
    orderId: string
) {
    const merchantId = await getMerchantId(userId);

    const order = await prisma.orders.findFirst({
        where: {
            id: orderId,
            merchant_id: merchantId,
        },
        include: {
            customers: true,
            transactions: true,
            checkout_sessions: true,
        },
    });

    if (!order) {
        throw new Error("Order not found");
    }

    return order;
}

export async function updateOrder(
    userId: string,
    orderId: string,
    data: UpdateOrderData
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.orders.findFirst({
        where: {
            id: orderId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Order not found");
    }

    if (
        data.orderNumber !== undefined &&
        data.orderNumber !== existing.order_number
    ) {
        const duplicate = await prisma.orders.findFirst({
            where: {
                merchant_id: merchantId,
                order_number: data.orderNumber,
                NOT: {
                    id: orderId,
                },
            },
        });

        if (duplicate) {
            throw new Error(
                "Order with this order number already exists"
            );
        }
    }

    const order = await prisma.orders.update({
        where: {
            id: orderId,
        },
        data: {
            ...(data.orderNumber !== undefined && {
                order_number: data.orderNumber,
            }),
            ...(data.totalAmount !== undefined && {
                total_amount: data.totalAmount,
            }),
            ...(data.currency !== undefined && {
                currency: data.currency,
            }),
            ...(data.status !== undefined && {
                status: data.status,
            }),
            ...(data.metadata !== undefined && {
                metadata: data.metadata,
            }),
        },
        include: {
            customers: true,
            transactions: true,
            checkout_sessions: true,
        },
    });

    return order;
}

export async function deleteOrder(
    userId: string,
    orderId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.orders.findFirst({
        where: {
            id: orderId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Order not found");
    }

    await prisma.orders.delete({
        where: {
            id: orderId,
        },
    });

    return {
        id: orderId,
    };
}