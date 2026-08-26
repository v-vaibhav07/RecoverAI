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
        throw new Error("Only merchants can access payment attempts");
    }

    return profile.merchant_id;
}

export async function createPaymentAttempt(
    userId: string,
    paymentId: string,
    attemptNumber: number,
    amount: number,
    paymentMethodId?: string,
    provider?: string,
    status?: string,
    failureCode?: string,
    failureCategory?: string,
    providerResponse?: any,
    startedAt?: Date,
    completedAt?: Date
) {
    const merchantId = await getMerchantId(userId);

    const payment = await prisma.payments.findFirst({
        where: {
            id: paymentId,
            merchant_id: merchantId,
        },
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    if (paymentMethodId) {
        const paymentMethod =
            await prisma.customer_payment_methods.findFirst({
                where: {
                    id: paymentMethodId,
                },
            });

        if (!paymentMethod) {
            throw new Error("Payment method not found");
        }
    }

    const existing = await prisma.payment_attempts.findFirst({
        where: {
            payment_id: paymentId,
            attempt_number: attemptNumber,
        },
    });

    if (existing) {
        throw new Error(
            "Payment attempt with this attempt number already exists"
        );
    }

    return prisma.payment_attempts.create({
        data: {
            payment_id: paymentId,
            attempt_number: attemptNumber,
            amount,
            payment_method_id: paymentMethodId,
            provider,
            status: status
                ? status as any
                : "PENDING",
            failure_code: failureCode,
            failure_category: failureCategory
                ? failureCategory as any
                : undefined,
            provider_response:
                providerResponse ?? undefined,
            started_at:
                startedAt ?? new Date(),
            completed_at: completedAt,
        },
        include: {
            payments: true,
            customer_payment_methods: true,
            payment_failures: true,
        },
    });
}

export async function getPaymentAttempts(
    userId: string
) {
    const merchantId = await getMerchantId(userId);

    return prisma.payment_attempts.findMany({
        where: {
            payments: {
                merchant_id: merchantId,
            },
        },
        orderBy: {
            created_at: "desc",
        },
        include: {
            payments: true,
            customer_payment_methods: true,
            payment_failures: true,
        },
    });
}

export async function getPaymentAttemptById(
    userId: string,
    attemptId: string
) {
    const merchantId = await getMerchantId(userId);

    const attempt = await prisma.payment_attempts.findFirst({
        where: {
            id: attemptId,
            payments: {
                merchant_id: merchantId,
            },
        },
        include: {
            payments: true,
            customer_payment_methods: true,
            payment_failures: true,
        },
    });

    if (!attempt) {
        throw new Error("Payment attempt not found");
    }

    return attempt;
}

export async function updatePaymentAttempt(
    userId: string,
    attemptId: string,
    data: {
        status?: string;
        failureCode?: string;
        failureCategory?: string;
        providerResponse?: any;
        startedAt?: Date;
        completedAt?: Date;
    }
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.payment_attempts.findFirst({
        where: {
            id: attemptId,
            payments: {
                merchant_id: merchantId,
            },
        },
    });

    if (!existing) {
        throw new Error("Payment attempt not found");
    }

    return prisma.payment_attempts.update({
        where: {
            id: attemptId,
        },
        data: {
            status:
                data.status !== undefined
                    ? data.status as any
                    : undefined,

            failure_code:
                data.failureCode !== undefined
                    ? data.failureCode
                    : undefined,

            failure_category:
                data.failureCategory !== undefined
                    ? data.failureCategory as any
                    : undefined,

            provider_response:
                data.providerResponse !== undefined
                    ? data.providerResponse
                    : undefined,

            started_at:
                data.startedAt !== undefined
                    ? data.startedAt
                    : undefined,

            completed_at:
                data.completedAt !== undefined
                    ? data.completedAt
                    : undefined,
        },
        include: {
            payments: true,
            customer_payment_methods: true,
            payment_failures: true,
        },
    });
}

export async function deletePaymentAttempt(
    userId: string,
    attemptId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.payment_attempts.findFirst({
        where: {
            id: attemptId,
            payments: {
                merchant_id: merchantId,
            },
        },
    });

    if (!existing) {
        throw new Error("Payment attempt not found");
    }

    await prisma.payment_attempts.delete({
        where: {
            id: attemptId,
        },
    });

    return {
        id: attemptId,
    };
}