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

export async function createPaymentFailure(
    userId: string,
    paymentId: string,
    paymentAttemptId: string | undefined,
    failureCode: string | undefined,
    failureCategory: string,
    failureReason: string | undefined,
    retryable: boolean | undefined,
    severity: string | undefined,
    provider: string | undefined,
    metadata: any
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

    if (paymentAttemptId) {
        const paymentAttempt =
            await prisma.payment_attempts.findFirst({
                where: {
                    id: paymentAttemptId,
                    merchant_id: merchantId,
                },
            });

        if (!paymentAttempt) {
            throw new Error("Payment attempt not found");
        }
    }

    const paymentFailure =
        await prisma.payment_failures.create({
            data: {
                payment_id: paymentId,
                payment_attempt_id: paymentAttemptId,
                merchant_id: merchantId,
                failure_code: failureCode,
                failure_category: failureCategory as any,
                failure_reason: failureReason,
                retryable:
                    retryable !== undefined
                        ? retryable
                        : true,
                severity:
                    severity !== undefined
                        ? severity as any
                        : "MEDIUM",
                provider,
                metadata:
                    metadata !== undefined
                        ? metadata
                        : {},
            },
        });

    return paymentFailure;
}

export async function getPaymentFailures(
    userId: string
) {
    const merchantId = await getMerchantId(userId);

    const paymentFailures =
        await prisma.payment_failures.findMany({
            where: {
                merchant_id: merchantId,
            },
            orderBy: {
                created_at: "desc",
            },
            include: {
                payments: true,
                payment_attempts: true,
            },
        });

    return paymentFailures;
}

export async function getPaymentFailureById(
    userId: string,
    paymentFailureId: string
) {
    const merchantId = await getMerchantId(userId);

    const paymentFailure =
        await prisma.payment_failures.findFirst({
            where: {
                id: paymentFailureId,
                merchant_id: merchantId,
            },
            include: {
                payments: true,
                payment_attempts: true,
            },
        });

    if (!paymentFailure) {
        throw new Error("Payment failure not found");
    }

    return paymentFailure;
}

export async function updatePaymentFailure(
    userId: string,
    paymentFailureId: string,
    data: {
        failureCode?: string;
        failureCategory?: string;
        failureReason?: string;
        retryable?: boolean;
        severity?: string;
        provider?: string;
        metadata?: any;
    }
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.payment_failures.findFirst({
            where: {
                id: paymentFailureId,
                merchant_id: merchantId,
            },
        });

    if (!existing) {
        throw new Error("Payment failure not found");
    }

    const paymentFailure =
        await prisma.payment_failures.update({
            where: {
                id: paymentFailureId,
            },
            data: {
                failure_code:
                    data.failureCode !== undefined
                        ? data.failureCode
                        : undefined,

                failure_category:
                    data.failureCategory !== undefined
                        ? data.failureCategory as any
                        : undefined,

                failure_reason:
                    data.failureReason !== undefined
                        ? data.failureReason
                        : undefined,

                retryable:
                    data.retryable !== undefined
                        ? data.retryable
                        : undefined,

                severity:
                    data.severity !== undefined
                        ? data.severity as any
                        : undefined,

                provider:
                    data.provider !== undefined
                        ? data.provider
                        : undefined,

                metadata:
                    data.metadata !== undefined
                        ? data.metadata
                        : undefined,
            },
        });

    return paymentFailure;
}

export async function deletePaymentFailure(
    userId: string,
    paymentFailureId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.payment_failures.findFirst({
            where: {
                id: paymentFailureId,
                merchant_id: merchantId,
            },
        });

    if (!existing) {
        throw new Error("Payment failure not found");
    }

    await prisma.payment_failures.delete({
        where: {
            id: paymentFailureId,
        },
    });
}