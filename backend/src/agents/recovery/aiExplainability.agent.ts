import { prisma } from "../../config/database.js";
import { callOpenRouter } from "../../config/ai.js";

type ExplainabilityResult = {
    summary: string;
    decisionExplanation: string;
    predictionExplanation: string;
    factors: string[];
    risks: string[];
    recommendation: string;
    confidence: "LOW" | "MEDIUM" | "HIGH";
};

export async function generateAIExplainability(
    userId: string,
    recoveryCaseId: string
) {
    // 1. Get merchant
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

    // 2. Get recovery case
    const recoveryCase =
        await prisma.recovery_cases.findFirst({
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

    // 3. Get latest AI prediction
    const prediction =
        await prisma.ai_predictions.findFirst({
            where: {
                recovery_case_id: recoveryCaseId,
                merchant_id: profile.merchant_id,
            },
            orderBy: {
                created_at: "desc",
            },
        });

    if (!prediction) {
        throw new Error(
            "AI recovery prediction not found"
        );
    }

    // 4. Get latest AI decision
    const decision =
        await prisma.ai_decisions.findFirst({
            where: {
                recovery_case_id: recoveryCaseId,
                merchant_id: profile.merchant_id,
            },
            orderBy: {
                created_at: "desc",
            },
        });

    if (!decision) {
        throw new Error(
            "AI recovery decision not found"
        );
    }

    // 5. Prepare data for AI
    const input = {
        recoveryCase: {
            id: recoveryCase.id,
            status: recoveryCase.status,
            priority: recoveryCase.priority,
            originalAmount:
                Number(recoveryCase.original_amount),
            recoverableAmount:
                Number(recoveryCase.recoverable_amount),
            recoveredAmount:
                Number(recoveryCase.recovered_amount),
        },

        customer: {
            name: recoveryCase.customers?.name,
            email: recoveryCase.customers?.email,
            country: recoveryCase.customers?.country,
            successfulPayments:
                recoveryCase.customers
                    ?.successful_payments,
            failedPayments:
                recoveryCase.customers?.failed_payments,
        },

        payment: {
            amount: Number(
                recoveryCase.payments?.amount ?? 0
            ),
            status:
                recoveryCase.payments?.status,
            failureCode:
                recoveryCase.payments?.failure_code,
            failureMessage:
                recoveryCase.payments?.failure_message,
        },

        prediction: {
            recoveryScore:
                prediction.recovery_score,
            recoveryProbability:
                prediction.recovery_probability,
            expectedRecoveryAmount:
                prediction.expected_recovery_amount,
            confidence:
                prediction.confidence,
            reasons:
                prediction.prediction_reasons,
        },

        decision: {
            decisionType:
                decision.decision_type,
            recommendedAction:
                decision.recommended_action,
            reasoning:
                decision.reasoning_summary,
            confidence:
                decision.confidence,
            structuredDecision:
                decision.structured_decision,
        },

        actions: recoveryCase.recovery_actions.map(
            (action) => ({
                id: action.id,
                type: action.action_type,
                status: action.status,
                attemptNumber:
                    action.attempt_number,
                scheduledAt:
                    action.scheduled_at,
                completedAt:
                    action.completed_at,
                result: action.result,
                error: action.error,
            })
        ),
    };

    // 6. Ask AI for explanation
    const aiResponse = await callOpenRouter([
        {
            role: "system",
            content: `
You are an AI explainability agent for a payment
recovery system.

Your job is to explain WHY the AI predicted a recovery
outcome and WHY the AI selected a particular recovery
decision.

Do not invent facts.

Use only the information provided.

Return ONLY valid JSON in exactly this format:

{
    "summary": "string",
    "decisionExplanation": "string",
    "predictionExplanation": "string",
    "factors": ["string"],
    "risks": ["string"],
    "recommendation": "string",
    "confidence": "LOW | MEDIUM | HIGH"
}

Rules:

- summary must briefly explain the overall situation.
- decisionExplanation must explain why the selected action
  makes sense.
- predictionExplanation must explain the recovery score,
  probability and expected recovery amount.
- factors must contain important positive or negative factors.
- risks must contain important risks or uncertainties.
- recommendation must describe the logical next step.
- confidence must be LOW, MEDIUM or HIGH.
- Do not create information that is not present in the input.
            `.trim(),
        },
        {
            role: "user",
            content: JSON.stringify(input),
        },
    ]);

    // 7. Parse AI response
    let explanation: ExplainabilityResult;

    try {
        explanation =
            typeof aiResponse === "string"
                ? JSON.parse(aiResponse)
                : aiResponse;
    } catch {
        throw new Error(
            "AI returned invalid explainability JSON"
        );
    }

    // 8. Validate response
    if (
        typeof explanation.summary !== "string" ||
        typeof explanation.decisionExplanation !==
            "string" ||
        typeof explanation.predictionExplanation !==
            "string" ||
        !Array.isArray(explanation.factors) ||
        !Array.isArray(explanation.risks) ||
        typeof explanation.recommendation !==
            "string" ||
        !["LOW", "MEDIUM", "HIGH"].includes(
            explanation.confidence
        )
    ) {
        throw new Error(
            "AI returned an invalid explainability structure"
        );
    }

    // 9. Return complete explainability result
    return {
        recoveryCaseId,
        predictionId: prediction.id,
        decisionId: decision.id,

        summary: explanation.summary,

        predictionExplanation:
            explanation.predictionExplanation,

        decisionExplanation:
            explanation.decisionExplanation,

        factors: explanation.factors,

        risks: explanation.risks,

        recommendation:
            explanation.recommendation,

        confidence:
            explanation.confidence,

        generatedAt: new Date(),
    };
}