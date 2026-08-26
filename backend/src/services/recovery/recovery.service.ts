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

export async function createRecoveryCase(
    userId: string,
    paymentId: string,
    priority?: string
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

    if (payment.status !== "FAILED") {
        throw new Error("Recovery case can only be created for a failed payment");
    }

    const existing = await prisma.recovery_cases.findFirst({
        where: {
            payment_id: paymentId,
            merchant_id: merchantId,
        },
    });

    if (existing) {
        throw new Error("Recovery case already exists for this payment");
    }

    const recoveryCase = await prisma.recovery_cases.create({
        data: {
            merchant_id: merchantId,
            customer_id: payment.customer_id,
            payment_id: payment.id,
            original_amount: payment.amount,
            recoverable_amount: payment.amount,
            recovered_amount: 0,
            recovery_score: null,
            recovery_probability: null,
            expected_recovery_amount: 0,
            status: "OPEN",
            priority: priority
                ? priority as any
                : "MEDIUM",
        },
        include: {
            customers: true,
            payments: true,
        },
    });

    return recoveryCase;
}

export async function getRecoveryCases(
    userId: string
) {
    const merchantId = await getMerchantId(userId);

    const recoveryCases = await prisma.recovery_cases.findMany({
        where: {
            merchant_id: merchantId,
        },
        orderBy: {
            created_at: "desc",
        },
        include: {
            customers: true,
            payments: true,
        },
    });

    return recoveryCases;
}

export async function getRecoveryCaseById(
    userId: string,
    recoveryCaseId: string
) {
    const merchantId = await getMerchantId(userId);

    const recoveryCase = await prisma.recovery_cases.findFirst({
        where: {
            id: recoveryCaseId,
            merchant_id: merchantId,
        },
        include: {
            customers: true,
            payments: true,
            recovery_actions: true,
            ai_decisions: true,
            ai_predictions: true,
        },
    });

    if (!recoveryCase) {
        throw new Error("Recovery case not found");
    }

    return recoveryCase;
}

export async function updateRecoveryCase(
    userId: string,
    recoveryCaseId: string,
    data: {
        recoverableAmount?: number;
        recoveredAmount?: number;
        recoveryScore?: number;
        recoveryProbability?: number;
        expectedRecoveryAmount?: number;
        status?: string;
        priority?: string;
        closedAt?: Date | null;
    }
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.recovery_cases.findFirst({
        where: {
            id: recoveryCaseId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Recovery case not found");
    }

    const recoveryCase = await prisma.recovery_cases.update({
        where: {
            id: recoveryCaseId,
        },
        data: {
            recoverable_amount:
                data.recoverableAmount !== undefined
                    ? data.recoverableAmount
                    : undefined,

            recovered_amount:
                data.recoveredAmount !== undefined
                    ? data.recoveredAmount
                    : undefined,

            recovery_score:
                data.recoveryScore !== undefined
                    ? data.recoveryScore
                    : undefined,

            recovery_probability:
                data.recoveryProbability !== undefined
                    ? data.recoveryProbability
                    : undefined,

            expected_recovery_amount:
                data.expectedRecoveryAmount !== undefined
                    ? data.expectedRecoveryAmount
                    : undefined,

            status:
                data.status !== undefined
                    ? data.status as any
                    : undefined,

            priority:
                data.priority !== undefined
                    ? data.priority as any
                    : undefined,

            closed_at:
                data.closedAt !== undefined
                    ? data.closedAt
                    : undefined,
        },
        include: {
            customers: true,
            payments: true,
        },
    });

    return recoveryCase;
}

export async function deleteRecoveryCase(
    userId: string,
    recoveryCaseId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.recovery_cases.findFirst({
        where: {
            id: recoveryCaseId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Recovery case not found");
    }

    await prisma.recovery_cases.delete({
        where: {
            id: recoveryCaseId,
        },
    });
}