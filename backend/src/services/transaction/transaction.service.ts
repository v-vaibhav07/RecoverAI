import { prisma } from "../../config/database.js";

interface CreateTransactionData {
    customerId?: string;
    orderId?: string;
    externalTransactionId?: string;
    amount: number;
    currency?: string;
    type?: string;
    status?: string;
    metadata?: any;
}

interface UpdateTransactionData {
    externalTransactionId?: string;
    amount?: number;
    currency?: string;
    type?: string;
    status?: string;
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
        throw new Error("Only merchants can access transactions");
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

export async function createTransaction(
    userId: string,
    data: CreateTransactionData
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

    if (data.externalTransactionId) {
        const existing =
            await prisma.transactions.findFirst({
                where: {
                    merchant_id: merchantId,
                    external_transaction_id:
                        data.externalTransactionId,
                },
            });

        if (existing) {
            throw new Error(
                "Transaction with this external transaction ID already exists"
            );
        }
    }

    const transaction =
        await prisma.transactions.create({
            data: {
                merchant_id: merchantId,
                customer_id: data.customerId,
                order_id: data.orderId,
                external_transaction_id:
                    data.externalTransactionId,
                amount: data.amount,
                currency: data.currency || "INR",
                type: data.type
                    ? (data.type as any)
                    : "PAYMENT",
                status: data.status
                    ? (data.status as any)
                    : "PENDING",
                metadata: data.metadata || {},
            },
            include: {
                customers: true,
                merchants: true,
                orders: true,
                payments: true,
            },
        });

    return transaction;
}

export async function getTransactions(
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
                external_transaction_id: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const [transactions, total] =
        await Promise.all([
            prisma.transactions.findMany({
                where,
                orderBy: {
                    created_at: "desc",
                },
                skip,
                take: limit,
                include: {
                    customers: true,
                    orders: true,
                    payments: true,
                },
            }),

            prisma.transactions.count({
                where,
            }),
        ]);

    return {
        transactions,
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

export async function getTransactionById(
    userId: string,
    transactionId: string
) {
    const merchantId = await getMerchantId(userId);

    const transaction =
        await prisma.transactions.findFirst({
            where: {
                id: transactionId,
                merchant_id: merchantId,
            },
            include: {
                customers: true,
                merchants: true,
                orders: true,
                payments: true,
            },
        });

    if (!transaction) {
        throw new Error("Transaction not found");
    }

    return transaction;
}

export async function updateTransaction(
    userId: string,
    transactionId: string,
    data: UpdateTransactionData
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.transactions.findFirst({
            where: {
                id: transactionId,
                merchant_id: merchantId,
            },
        });

    if (!existing) {
        throw new Error("Transaction not found");
    }

    if (
        data.externalTransactionId !== undefined &&
        data.externalTransactionId !==
            existing.external_transaction_id
    ) {
        const duplicate =
            await prisma.transactions.findFirst({
                where: {
                    merchant_id: merchantId,
                    external_transaction_id:
                        data.externalTransactionId,
                    NOT: {
                        id: transactionId,
                    },
                },
            });

        if (duplicate) {
            throw new Error(
                "Transaction with this external transaction ID already exists"
            );
        }
    }

    const transaction =
        await prisma.transactions.update({
            where: {
                id: transactionId,
            },
            data: {
                ...(data.externalTransactionId !==
                    undefined && {
                    external_transaction_id:
                        data.externalTransactionId,
                }),

                ...(data.amount !== undefined && {
                    amount: data.amount,
                }),

                ...(data.currency !== undefined && {
                    currency: data.currency,
                }),

                ...(data.type !== undefined && {
                    type: data.type as any,
                }),

                ...(data.status !== undefined && {
                    status: data.status as any,
                }),

                ...(data.metadata !== undefined && {
                    metadata: data.metadata,
                }),
            },
            include: {
                customers: true,
                merchants: true,
                orders: true,
                payments: true,
            },
        });

    return transaction;
}

export async function deleteTransaction(
    userId: string,
    transactionId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.transactions.findFirst({
            where: {
                id: transactionId,
                merchant_id: merchantId,
            },
        });

    if (!existing) {
        throw new Error("Transaction not found");
    }

    await prisma.transactions.delete({
        where: {
            id: transactionId,
        },
    });

    return {
        id: transactionId,
    };
}