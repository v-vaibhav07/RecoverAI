import { prisma } from "../../config/database.js";

export async function executeRecoveryAction(
    userId: string,
    recoveryCaseId: string
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

    const recoveryCase = await prisma.recovery_cases.findFirst({
        where: {
            id: recoveryCaseId,
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

    if (
        recoveryCase.status === "RECOVERED" ||
        recoveryCase.status === "CLOSED"
    ) {
        throw new Error("Recovery case is already completed");
    }

    const decision = await prisma.ai_decisions.findFirst({
        where: {
            recovery_case_id: recoveryCaseId,
            merchant_id: profile.merchant_id,
        },
        orderBy: {
            created_at: "desc",
        },
    });

    if (!decision) {
        throw new Error("AI recovery decision not found");
    }

    if (!decision.recommended_action) {
        throw new Error("AI decision has no recommended action");
    }

    const structuredDecision = decision.structured_decision as {
        strategyId?: string;
        strategyName?: string;
        strategyType?: string;
        decision?: string;
        reason?: string;
    };

    if (!structuredDecision.strategyId) {
        throw new Error("AI decision has no strategy ID");
    }

    const strategy = await prisma.recovery_strategies.findUnique({
        where: {
            id: structuredDecision.strategyId,
        },
    });

    if (!strategy) {
        throw new Error("Recovery strategy not found");
    }

    if (!strategy.is_active) {
        throw new Error("Selected recovery strategy is inactive");
    }

    const previousActions = await prisma.recovery_actions.count({
        where: {
            recovery_case_id: recoveryCaseId,
            merchant_id: profile.merchant_id,
        },
    });

    const attemptNumber = previousActions + 1;

    const configuration =
        strategy.configuration &&
        typeof strategy.configuration === "object"
            ? (strategy.configuration as Record<string, unknown>)
            : {};

    let delayMinutes = 0;

    if (strategy.type === "DELAYED_RETRY") {
        delayMinutes =
            typeof configuration.delay_minutes === "number"
                ? configuration.delay_minutes
                : 120;
    }

    const scheduledAt = new Date(
        Date.now() + delayMinutes * 60 * 1000
    );

    const action = await prisma.recovery_actions.create({
        data: {
            merchant_id: profile.merchant_id,
            recovery_case_id: recoveryCaseId,
            strategy_id: strategy.id,
            action_type: decision.recommended_action,
            status: "SCHEDULED",
            attempt_number: attemptNumber,
            scheduled_at: scheduledAt,
            metadata: {
                strategyName: strategy.name,
                strategyType: strategy.type,
                decisionId: decision.id,
                decisionReason: decision.reasoning_summary,
                paymentId: recoveryCase.payment_id,
                customerId: recoveryCase.customer_id,
                delayMinutes,
            },
        },
    });

    await prisma.recovery_cases.update({
        where: {
            id: recoveryCaseId,
        },
        data: {
            status: "ACTION_SCHEDULED",
        },
    });

    return action;
}