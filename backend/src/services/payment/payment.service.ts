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

export async function createPayment(
    userId: string,
    customerId: string | undefined,
    transactionId: string | undefined,
    paymentMethodId: string | undefined,
    amount: number,
    provider: string | undefined,
    providerPaymentId: string | undefined,
    status: string | undefined,
    failureCode: string | undefined,
    failureMessage: string | undefined,
    metadata: any
) {
    const merchantId = await getMerchantId(userId);

    if (customerId) {
        const customer = await prisma.customers.findFirst({
            where: {
                id: customerId,
                merchant_id: merchantId,
            },
        });

        if (!customer) {
            throw new Error("Customer not found");
        }
    }

    if (transactionId) {
        const transaction = await prisma.transactions.findFirst({
            where: {
                id: transactionId,
                merchant_id: merchantId,
            },
        });

        if (!transaction) {
            throw new Error("Transaction not found");
        }
    }

    if (paymentMethodId) {
        const paymentMethod =
            await prisma.customer_payment_methods.findFirst({
                where: {
                    id: paymentMethodId,
                    merchant_id: merchantId,
                },
            });

        if (!paymentMethod) {
            throw new Error("Payment method not found");
        }
    }

    const payment = await prisma.payments.create({
        data: {
            merchant_id: merchantId,
            customer_id: customerId,
            transaction_id: transactionId,
            payment_method_id: paymentMethodId,
            amount,
            currency: "INR",
            provider,
            provider_payment_id: providerPaymentId,
            status: status
                ? (status as any)
                : "PENDING",
            failure_code: failureCode,
            failure_message: failureMessage,
            metadata: metadata || {},
        },
    });

    return payment;
}

export async function getPayments(
    userId: string
) {
    const merchantId = await getMerchantId(userId);

    const payments = await prisma.payments.findMany({
        where: {
            merchant_id: merchantId,
        },
        orderBy: {
            created_at: "desc",
        },
        include: {
            customers: true,
            merchants: true,
            transactions: true,
            customer_payment_methods: true,
        },
    });

    return payments;
}

export async function getPaymentById(
    userId: string,
    paymentId: string
) {
    const merchantId = await getMerchantId(userId);

    const payment = await prisma.payments.findFirst({
        where: {
            id: paymentId,
            merchant_id: merchantId,
        },
        include: {
            customers: true,
            merchants: true,
            transactions: true,
            customer_payment_methods: true,
        },
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    return payment;
}

export async function updatePayment(
    userId: string,
    paymentId: string,
    data: {
        provider?: string;
        providerPaymentId?: string;
        status?: string;
        failureCode?: string;
        failureMessage?: string;
        metadata?: any;
    }
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.payments.findFirst({
        where: {
            id: paymentId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Payment not found");
    }

    const payment =
        await prisma.payments.update({
            where: {
                id: paymentId,
            },
            data: {
                provider: data.provider,
                provider_payment_id:
                    data.providerPaymentId,
                status:
                    data.status !== undefined
                        ? (data.status as any)
                        : undefined,
                failure_code:
                    data.failureCode,
                failure_message:
                    data.failureMessage,
                metadata:
                    data.metadata,
            },
        });

    return payment;
}

export async function deletePayment(
    userId: string,
    paymentId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.payments.findFirst({
        where: {
            id: paymentId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Payment not found");
    }

    await prisma.payments.delete({
        where: {
            id: paymentId,
        },
    });
}