import { prisma } from "../../config/database.js";

export async function processRecoveryOutcome(
    userId: string,
    actionId: string
) {
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

    const action = await prisma.recovery_actions.findFirst({
        where: {
            id: actionId,
            merchant_id: profile.merchant_id,
        },
        include: {
            recovery_cases: true,
        },
    });

    if (!action) {
        throw new Error("Recovery action not found");
    }

    const paymentId = (action.metadata as any)?.paymentId;

    if (!paymentId) {
        throw new Error("Payment ID not found in recovery action");
    }

    const payment = await prisma.payments.findFirst({
        where: {
            id: paymentId,
            merchant_id: profile.merchant_id,
        },
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    const paymentAttempt = await prisma.payment_attempts.findFirst({
        where: {
            payment_id: paymentId,
        },
        orderBy: {
            created_at: "desc",
        },
    });

    if (!paymentAttempt) {
        throw new Error("Payment attempt not found");
    }

    const success = paymentAttempt.status === "SUCCESS";

    const recoveredAmount = success
        ? Number(payment.amount)
        : 0;

    const recoveryCase = action.recovery_cases;

    const newRecoveredAmount =
        Number(recoveryCase.recovered_amount) + recoveredAmount;

    const newStatus = success
        ? "RECOVERED"
        : recoveryCase.status;

    const updatedCase = await prisma.recovery_cases.update({
        where: {
            id: recoveryCase.id,
        },
        data: {
            recovered_amount: newRecoveredAmount,
            status: newStatus as any,
            closed_at: success ? new Date() : undefined,
        },
    });

    const resultData = success
        ? {
            success: true,
            recoveredAmount,
            paymentAttemptId: paymentAttempt.id,
        }
        : {
            success: false,
            recoveredAmount: 0,
            paymentAttemptId: paymentAttempt.id,
            failureCode: paymentAttempt.failure_code,
            failureMessage: payment.failure_message,
        };

    const updatedAction = await prisma.recovery_actions.update({
        where: {
            id: action.id,
        },
        data: {
            status: success ? "COMPLETED" : "FAILED",
            completed_at: new Date(),
            result: JSON.stringify(resultData),
            error: success
                ? null
                : payment.failure_message ?? "Payment retry failed",
        },
    });

    return {
        success,
        actionId: action.id,
        recoveryCaseId: recoveryCase.id,
        paymentAttemptId: paymentAttempt.id,
        status: success ? "RECOVERED" : "FAILED",
        recoveredAmount,
        failureCode: success
            ? null
            : paymentAttempt.failure_code,
        failureMessage: success
            ? null
            : payment.failure_message,
        recoveryCase: updatedCase,
        action: updatedAction,
    };
}