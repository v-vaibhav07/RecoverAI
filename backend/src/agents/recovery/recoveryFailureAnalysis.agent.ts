import { prisma } from "../../config/database.js";
import { callOpenRouter } from "../../config/ai.js";

type FailureAnalysisResult = {
    failureCategory: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    recoverability: number;
    reason: string;
    recommendedApproach: string;
};

export async function analyzePaymentFailure(
    userId: string,
    recoveryCaseId: string
) {
    // --------------------------------------------------
    // 1. Get merchant
    // --------------------------------------------------

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

    // --------------------------------------------------
    // 2. Get recovery case
    // --------------------------------------------------

    const recoveryCase =
        await prisma.recovery_cases.findFirst({
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

    if (!recoveryCase.payments) {
        throw new Error(
            "Recovery case has no associated payment"
        );
    }

    const payment = recoveryCase.payments;
    const customer = recoveryCase.customers;

    // --------------------------------------------------
    // 3. Prepare payment information
    // --------------------------------------------------

    const paymentData = {
        paymentId: payment.id,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status,
        failureCode: payment.failure_code,
        failureMessage: payment.failure_message,
        provider: payment.provider,
        providerPaymentId:
            payment.provider_payment_id,
    };

    // --------------------------------------------------
    // 4. Prepare customer information
    // --------------------------------------------------

    const customerData = customer
        ? {
              customerId: customer.id,
              name: customer.name,
              country: customer.country,
              lifetimeValue:
                  Number(customer.lifetime_value),
              totalTransactions:
                  customer.total_transactions,
              successfulPayments:
                  customer.successful_payments,
              failedPayments:
                  customer.failed_payments,
              recoveredPayments:
                  customer.recovered_payments,
              totalRecoveredAmount:
                  Number(
                      customer.total_recovered_amount
                  ),
          }
        : null;

    // --------------------------------------------------
    // 5. Create AI input
    // --------------------------------------------------

    const inputSnapshot = {
        recoveryCaseId: recoveryCase.id,

        recoveryCase: {
            originalAmount:
                Number(
                    recoveryCase.original_amount
                ),

            recoverableAmount:
                Number(
                    recoveryCase.recoverable_amount
                ),

            recoveredAmount:
                Number(
                    recoveryCase.recovered_amount
                ),

            priority: recoveryCase.priority,
            status: recoveryCase.status,
        },

        payment: paymentData,

        customer: customerData,
    };

    // --------------------------------------------------
    // 6. Check OpenRouter configuration
    // --------------------------------------------------

    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error(
            "OPENROUTER_API_KEY is not configured"
        );
    }

    // --------------------------------------------------
    // 7. Ask AI to analyze failure
    // --------------------------------------------------

    const prompt = `
Analyze this failed payment recovery case.

Your job is to identify:

1. Why the payment failed
2. Failure category
3. Severity
4. How recoverable the payment is
5. The best general recovery approach

Return ONLY valid JSON.

Required format:

{
    "failureCategory": "string",
    "severity": "LOW | MEDIUM | HIGH",
    "recoverability": number,
    "reason": "string",
    "recommendedApproach": "string"
}

Rules:

- recoverability must be between 0 and 1.
- severity must be LOW, MEDIUM, or HIGH.
- failureCategory should describe the actual payment failure.
- reason should explain the analysis.
- recommendedApproach should be a short actionable recommendation.

Payment and customer data:

${JSON.stringify(inputSnapshot)}
`;

    const aiResponse = await callOpenRouter([
        {
            role: "system",
            content:
                "You are a payment failure analysis agent. Return only valid JSON.",
        },
        {
            role: "user",
            content: prompt,
        },
    ]);

    // --------------------------------------------------
    // 8. Parse AI response
    // --------------------------------------------------

    let analysis: FailureAnalysisResult;

    try {
        analysis =
            typeof aiResponse === "string"
                ? JSON.parse(aiResponse)
                : aiResponse;
    } catch {
        throw new Error(
            "AI returned invalid failure analysis JSON"
        );
    }

    // --------------------------------------------------
    // 9. Validate AI response
    // --------------------------------------------------

    if (
        typeof analysis.failureCategory !==
            "string" ||
        !["LOW", "MEDIUM", "HIGH"].includes(
            analysis.severity
        ) ||
        typeof analysis.recoverability !==
            "number" ||
        typeof analysis.reason !== "string" ||
        typeof analysis.recommendedApproach !==
            "string"
    ) {
        throw new Error(
            "AI returned an invalid failure analysis structure"
        );
    }

    // --------------------------------------------------
    // 10. Normalize recoverability
    // --------------------------------------------------

    analysis.recoverability = Math.max(
        0,
        Math.min(
            1,
            analysis.recoverability
        )
    );

    // --------------------------------------------------
    // 11. Save analysis
    // --------------------------------------------------
    //
    // We store the analyst result inside the recovery
    // case because the current ai_predictions table is
    // designed for prediction results, not failure
    // classification.
    //
    // This avoids changing the database schema right now.
    //

    const existingMetadata =
        recoveryCase.payments?.metadata &&
        typeof recoveryCase.payments.metadata ===
            "object"
            ? recoveryCase.payments.metadata
            : {};

    const updatedPayment =
        await prisma.payments.update({
            where: {
                id: payment.id,
            },
            data: {
                metadata: {
                    ...(existingMetadata as object),

                    failureAnalysis: {
                        failureCategory:
                            analysis.failureCategory,

                        severity:
                            analysis.severity,

                        recoverability:
                            analysis.recoverability,

                        reason:
                            analysis.reason,

                        recommendedApproach:
                            analysis.recommendedApproach,

                        analyzedAt:
                            new Date().toISOString(),
                    },
                },
            },
        });

    // --------------------------------------------------
    // 12. Return result
    // --------------------------------------------------

    return {
        recoveryCaseId:
            recoveryCase.id,

        paymentId:
            payment.id,

        analysis,

        inputSnapshot,

        payment:
            updatedPayment,
    };
}