import { prisma } from "../../config/database.js";

interface CreateSubscriptionPaymentData {
    subscriptionId: string;
    paymentId: string;
    billingPeriod: string;
    amount: number;
    currency?: string;
    status?: string;
    dueDate: string | Date;
    paidAt?: string | Date | null;
}

interface UpdateSubscriptionPaymentData {
    billingPeriod?: string;
    amount?: number;
    currency?: string;
    status?: string;
    dueDate?: string | Date;
    paidAt?: string | Date | null;
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
        throw new Error("Only merchants can access subscription payments");
    }

    return profile.merchant_id;
}

async function verifySubscription(
    merchantId: string,
    subscriptionId: string
) {
    const subscription =
        await prisma.subscriptions.findFirst({
            where: {
                id: subscriptionId,
                merchant_id: merchantId,
            },
        });

    if (!subscription) {
        throw new Error("Subscription not found");
    }

    return subscription;
}

async function verifyPayment(
    merchantId: string,
    paymentId: string
) {
    const payment =
        await prisma.payments.findFirst({
            where: {
                id: paymentId,
                merchant_id: merchantId,
            },
        });

    if (!payment) {
        throw new Error("Payment not found");
    }

    return payment;
}

export async function createSubscriptionPayment(
    userId: string,
    data: CreateSubscriptionPaymentData
) {
    const merchantId = await getMerchantId(userId);

    await verifySubscription(
        merchantId,
        data.subscriptionId
    );

    await verifyPayment(
        merchantId,
        data.paymentId
    );

    const dueDate = new Date(data.dueDate);

    if (isNaN(dueDate.getTime())) {
        throw new Error("Invalid due date");
    }

    let paidAt: Date | null = null;

    if (data.paidAt) {
        paidAt = new Date(data.paidAt);

        if (isNaN(paidAt.getTime())) {
            throw new Error("Invalid paid date");
        }
    }

    const subscriptionPayment =
        await prisma.subscription_payments.create({
            data: {
                subscription_id: data.subscriptionId,
                payment_id: data.paymentId,
                billing_period: data.billingPeriod,
                amount: data.amount,
                currency: data.currency || "INR",
                status: data.status
                    ? (data.status as any)
                    : "PENDING",
                due_date: dueDate,
                paid_at: paidAt,
            },
            include: {
                subscriptions: true,
                payments: true,
            },
        });

    return subscriptionPayment;
}

export async function getSubscriptionPayments(
    userId: string
) {
    const merchantId = await getMerchantId(userId);

    return await prisma.subscription_payments.findMany({
        where: {
            subscriptions: {
                merchant_id: merchantId,
            },
        },
        include: {
            subscriptions: true,
            payments: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });
}

export async function getSubscriptionPaymentById(
    userId: string,
    subscriptionPaymentId: string
) {
    const merchantId = await getMerchantId(userId);

    const subscriptionPayment =
        await prisma.subscription_payments.findFirst({
            where: {
                id: subscriptionPaymentId,
                subscriptions: {
                    merchant_id: merchantId,
                },
            },
            include: {
                subscriptions: true,
                payments: true,
            },
        });

    if (!subscriptionPayment) {
        throw new Error(
            "Subscription payment not found"
        );
    }

    return subscriptionPayment;
}

export async function updateSubscriptionPayment(
    userId: string,
    subscriptionPaymentId: string,
    data: UpdateSubscriptionPaymentData
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.subscription_payments.findFirst({
            where: {
                id: subscriptionPaymentId,
                subscriptions: {
                    merchant_id: merchantId,
                },
            },
        });

    if (!existing) {
        throw new Error(
            "Subscription payment not found"
        );
    }

    let dueDate: Date | undefined;

    if (data.dueDate !== undefined) {
        dueDate = new Date(data.dueDate);

        if (isNaN(dueDate.getTime())) {
            throw new Error("Invalid due date");
        }
    }

    let paidAt: Date | null | undefined;

    if (data.paidAt !== undefined) {
        if (data.paidAt === null) {
            paidAt = null;
        } else {
            paidAt = new Date(data.paidAt);

            if (isNaN(paidAt.getTime())) {
                throw new Error("Invalid paid date");
            }
        }
    }

    const subscriptionPayment =
        await prisma.subscription_payments.update({
            where: {
                id: subscriptionPaymentId,
            },
            data: {
                ...(data.billingPeriod !== undefined && {
                    billing_period: data.billingPeriod,
                }),

                ...(data.amount !== undefined && {
                    amount: data.amount,
                }),

                ...(data.currency !== undefined && {
                    currency: data.currency,
                }),

                ...(data.status !== undefined && {
                    status: data.status as any,
                }),

                ...(dueDate !== undefined && {
                    due_date: dueDate,
                }),

                ...(paidAt !== undefined && {
                    paid_at: paidAt,
                }),
            },
            include: {
                subscriptions: true,
                payments: true,
            },
        });

    return subscriptionPayment;
}

export async function deleteSubscriptionPayment(
    userId: string,
    subscriptionPaymentId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.subscription_payments.findFirst({
            where: {
                id: subscriptionPaymentId,
                subscriptions: {
                    merchant_id: merchantId,
                },
            },
        });

    if (!existing) {
        throw new Error(
            "Subscription payment not found"
        );
    }

    await prisma.subscription_payments.delete({
        where: {
            id: subscriptionPaymentId,
        },
    });

    return {
        id: subscriptionPaymentId,
    };
}