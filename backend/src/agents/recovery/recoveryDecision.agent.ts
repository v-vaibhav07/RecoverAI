import { prisma } from "../../config/database.js";
import { callOpenRouter } from "../../config/ai.js";

export async function decideRecovery(
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
            customers: true,
            payments: true,
            recovery_actions: true,
        },
    });

    if (!recoveryCase) {
        throw new Error("Recovery case not found");
    }

    const prediction = await prisma.ai_predictions.findFirst({
        where: {
            recovery_case_id: recoveryCaseId,
            merchant_id: profile.merchant_id,
        },
        orderBy: {
            created_at: "desc",
        },
    });

    if (!prediction) {
        throw new Error("AI recovery prediction not found");
    }

    const strategies = await prisma.recovery_strategies.findMany({
        where: {
            merchant_id: profile.merchant_id,
            is_active: true,
        },
    });

    if (strategies.length === 0) {
        throw new Error("No active recovery strategies found");
    }

    const prompt = `
Based on the recovery case, AI prediction, customer information,
payment information, and available recovery strategies,
select the best recovery strategy.

Recovery case:
${JSON.stringify({
    recoveryCaseId: recoveryCase.id,
    priority: recoveryCase.priority,
    originalAmount: Number(recoveryCase.original_amount),
    recoverableAmount: Number(recoveryCase.recoverable_amount),
    recoveredAmount: Number(recoveryCase.recovered_amount),
    status: recoveryCase.status,
})}

Customer:
${JSON.stringify({
    name: recoveryCase.customers?.name,
    email: recoveryCase.customers?.email,
    country: recoveryCase.customers?.country,
    successfulPayments: recoveryCase.customers?.successful_payments,
    failedPayments: recoveryCase.customers?.failed_payments,
})}

Payment:
${JSON.stringify({
    amount: Number(recoveryCase.payments?.amount),
    status: recoveryCase.payments?.status,
    failureCode: recoveryCase.payments?.failure_code,
    failureMessage: recoveryCase.payments?.failure_message,
})}

AI prediction:
${JSON.stringify({
    recoveryScore: prediction.recovery_score,
    recoveryProbability: prediction.recovery_probability,
    expectedRecoveryAmount: prediction.expected_recovery_amount,
    confidence: prediction.confidence,
    reasons: prediction.prediction_reasons,
})}

Available strategies:
${JSON.stringify(
    strategies.map((strategy) => ({
        id: strategy.id,
        name: strategy.name,
        type: strategy.type,
        description: strategy.description,
        configuration: strategy.configuration,
    }))
)}

Return ONLY valid JSON in exactly this format:

{
    "strategyId": "string",
    "decision": "string",
    "reason": "string",
    "confidence": "HIGH | MEDIUM | LOW"
}
`;

    const aiResponse = await callOpenRouter([
        {
            role: "system",
            content:
                "You are a payment recovery decision agent. Return only valid JSON.",
        },
        {
            role: "user",
            content: prompt,
        },
    ]);

    let decision;

    try {
        decision =
            typeof aiResponse === "string"
                ? JSON.parse(aiResponse)
                : aiResponse;
    } catch {
        throw new Error("Invalid AI decision response");
    }

    const selectedStrategy = strategies.find(
        (strategy) => strategy.id === decision.strategyId
    );

    if (!selectedStrategy) {
        throw new Error("AI selected an invalid recovery strategy");
    }

    const aiDecision = await prisma.ai_decisions.create({
        data: {
            merchant_id: profile.merchant_id,
            recovery_case_id: recoveryCaseId,
            prediction_id: prediction.id,
            agent_name: "recovery_decision_agent",
            decision_type: "STRATEGY_SELECTION",
            recommended_action: selectedStrategy.type,
            reasoning_summary: decision.reason,
            confidence: decision.confidence,
            structured_decision: {
                strategyId: selectedStrategy.id,
                strategyName: selectedStrategy.name,
                strategyType: selectedStrategy.type,
                decision: decision.decision,
                reason: decision.reason,
            },
        },
    });

    return aiDecision;
}