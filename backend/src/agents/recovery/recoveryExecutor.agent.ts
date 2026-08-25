import { prisma } from "../../config/database.js";

export async function executeRecoveryAction(
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
    });

    if (!action) {
        throw new Error("Recovery action not found");
    }

    if (action.status !== "SCHEDULED") {
        throw new Error(
            `Recovery action cannot be executed from status ${action.status}`
        );
    }

    const recoveryCase = await prisma.recovery_cases.findFirst({
        where: {
            id: action.recovery_case_id,
            merchant_id: profile.merchant_id,
        },
        include: {
            payments: true,
            customers: true,
        },
    });

    if (!recoveryCase) {
        throw new Error("Recovery case not found");
    }

    if (!recoveryCase.payment_id || !recoveryCase.payments) {
        throw new Error("Recovery case has no payment");
    }

    const payment = recoveryCase.payments;

    const startedAt = new Date();

    await prisma.$transaction([
        prisma.recovery_actions.update({
            where: {
                id: action.id,
            },
            data: {
                status: "RUNNING",
                started_at: startedAt,
            },
        }),

        prisma.recovery_cases.update({
            where: {
                id: recoveryCase.id,
            },
            data: {
                status: "IN_PROGRESS",
            },
        }),

        prisma.payments.update({
            where: {
                id: payment.id,
            },
            data: {
                status: "PROCESSING",
            },
        }),
    ]);

    const attemptNumber = action.attempt_number;

    let success = true;
    let failureCode: string | null = null;
    let failureMessage: string | null = null;

    if (payment.failure_code === "INSUFFICIENT_FUNDS") {
        success = false;
        failureCode = "INSUFFICIENT_FUNDS";
        failureMessage = "Insufficient funds";
    } else if (
        payment.failure_code === "EXPIRED_CARD" ||
        payment.failure_code === "INVALID_PAYMENT_METHOD" ||
        payment.failure_code === "FRAUD_SUSPECTED"
    ) {
        success = false;
        failureCode = payment.failure_code;
        failureMessage = payment.failure_message;
    }

    const completedAt = new Date();

    const paymentAttempt = await prisma.payment_attempts.create({
        data: {
            payment_id: payment.id,
            attempt_number: attemptNumber,
            amount: payment.amount,
            payment_method_id: payment.payment_method_id,
            provider: payment.provider,
            status: success ? "SUCCESS" : "FAILED",
            failure_code: failureCode,
            provider_response: {
                simulated: true,
                recoveryActionId: action.id,
                actionType: action.action_type,
                attemptNumber,
                success,
                failureMessage,
            },
            started_at: startedAt,
            completed_at: completedAt,
        },
    });

    if (success) {
        const recoveredAmount = Number(recoveryCase.recoverable_amount);

        await prisma.$transaction([
            prisma.payments.update({
                where: {
                    id: payment.id,
                },
                data: {
                    status: "SUCCESS",
                    failure_code: null,
                    failure_message: null,
                    updated_at: completedAt,
                },
            }),

            prisma.recovery_actions.update({
                where: {
                    id: action.id,
                },
                data: {
                    status: "SUCCESS",
                    completed_at: completedAt,
                    result: `Payment recovered successfully. Amount recovered: ${recoveredAmount}`,
                    error: null,
                    metadata: {
                        ...(action.metadata as object),
                        paymentAttemptId: paymentAttempt.id,
                        recoveredAmount,
                        simulated: true,
                    },
                },
            }),

            prisma.recovery_cases.update({
                where: {
                    id: recoveryCase.id,
                },
                data: {
                    status: "RECOVERED",
                    recovered_amount: recoveredAmount,
                    expected_recovery_amount: recoveredAmount,
                    closed_at: completedAt,
                    updated_at: completedAt,
                },
            }),

            ...(recoveryCase.customer_id
                ? [
                      prisma.customers.update({
                          where: {
                              id: recoveryCase.customer_id,
                          },
                          data: {
                              recovered_payments: {
                                  increment: 1,
                              },
                              total_recovered_amount: {
                                  increment: recoveredAmount,
                              },
                              updated_at: completedAt,
                          },
                      }),
                  ]
                : []),

            ...(payment.transaction_id
                ? [
                      prisma.transactions.update({
                          where: {
                              id: payment.transaction_id,
                          },
                          data: {
                              status: "SUCCESS",
                              updated_at: completedAt,
                          },
                      }),
                  ]
                : []),
        ]);

        return {
            success: true,
            actionId: action.id,
            paymentAttemptId: paymentAttempt.id,
            status: "SUCCESS",
            recoveredAmount,
            message: "Payment recovered successfully",
        };
    }

    await prisma.$transaction([
        prisma.payments.update({
            where: {
                id: payment.id,
            },
            data: {
                status: "FAILED",
                failure_code: failureCode,
                failure_message: failureMessage,
                updated_at: completedAt,
            },
        }),

        prisma.recovery_actions.update({
            where: {
                id: action.id,
            },
            data: {
                status: "FAILED",
                completed_at: completedAt,
                result: "Payment retry failed",
                error: failureMessage,
                metadata: {
                    ...(action.metadata as object),
                    paymentAttemptId: paymentAttempt.id,
                    simulated: true,
                },
            },
        }),

        prisma.recovery_cases.update({
            where: {
                id: recoveryCase.id,
            },
            data: {
                status: "IN_PROGRESS",
                updated_at: completedAt,
            },
        }),
    ]);

    return {
        success: false,
        actionId: action.id,
        paymentAttemptId: paymentAttempt.id,
        status: "FAILED",
        recoveredAmount: 0,
        failureCode,
        failureMessage,
        message: "Payment retry failed",
    };
}