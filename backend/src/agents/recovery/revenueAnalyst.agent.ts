import { prisma } from "../../config/database.js";
import { callOpenRouter } from "../../config/ai.js";

type RevenueAnalysisResult = {
    merchantId: string;

    analyzedAt: Date;

    totalCases: number;
    activeCases: number;
    recoveredCases: number;
    closedCases: number;

    totalOriginalAmount: number;
    totalRecoverableAmount: number;
    totalRecoveredAmount: number;
    totalLostAmount: number;

    recoveryRate: number;

    totalActions: number;
    successfulActions: number;
    failedActions: number;

    actionSuccessRate: number;

    averageRecoveryAmount: number;

    revenueImpact: "POSITIVE" | "NEUTRAL" | "NEGATIVE";

    insights: string[];
    recommendations: string[];
};

export async function analyzeRevenue(
    userId: string
): Promise<RevenueAnalysisResult> {
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

    const merchantId = profile.merchant_id;

    // --------------------------------------------------
    // 2. Get recovery cases
    // --------------------------------------------------

    const recoveryCases =
        await prisma.recovery_cases.findMany({
            where: {
                merchant_id: merchantId,
            },
            include: {
                recovery_actions: true,
            },
        });

    // --------------------------------------------------
    // 3. Basic case statistics
    // --------------------------------------------------

    const totalCases = recoveryCases.length;

    const activeCases = recoveryCases.filter(
        (recoveryCase) =>
            recoveryCase.status !== "RECOVERED" &&
            recoveryCase.status !== "CLOSED"
    ).length;

    const recoveredCases = recoveryCases.filter(
        (recoveryCase) =>
            recoveryCase.status === "RECOVERED"
    ).length;

    const closedCases = recoveryCases.filter(
        (recoveryCase) =>
            recoveryCase.status === "CLOSED"
    ).length;

    // --------------------------------------------------
    // 4. Revenue calculations
    // --------------------------------------------------

    const totalOriginalAmount =
        recoveryCases.reduce(
            (total, recoveryCase) =>
                total +
                Number(recoveryCase.original_amount || 0),
            0
        );

    const totalRecoverableAmount =
        recoveryCases.reduce(
            (total, recoveryCase) =>
                total +
                Number(recoveryCase.recoverable_amount || 0),
            0
        );

    const totalRecoveredAmount =
        recoveryCases.reduce(
            (total, recoveryCase) =>
                total +
                Number(recoveryCase.recovered_amount || 0),
            0
        );

    const totalLostAmount = Math.max(
        0,
        totalRecoverableAmount -
            totalRecoveredAmount
    );

    const recoveryRate =
        totalRecoverableAmount > 0
            ? (totalRecoveredAmount /
                  totalRecoverableAmount) *
              100
            : 0;

    // --------------------------------------------------
    // 5. Recovery action statistics
    // --------------------------------------------------

    const allActions =
        recoveryCases.flatMap(
            (recoveryCase) =>
                recoveryCase.recovery_actions
        );

    const totalActions = allActions.length;

    const successfulActions =
        allActions.filter(
            (action) =>
                action.status === "SUCCESS"
        ).length;

    const failedActions =
        allActions.filter(
            (action) =>
                action.status === "FAILED"
        ).length;

    const actionSuccessRate =
        totalActions > 0
            ? (successfulActions /
                  totalActions) *
              100
            : 0;

    // --------------------------------------------------
    // 6. Average recovery
    // --------------------------------------------------

    const averageRecoveryAmount =
        recoveredCases > 0
            ? totalRecoveredAmount /
              recoveredCases
            : 0;

    // --------------------------------------------------
    // 7. Revenue impact
    // --------------------------------------------------

    let revenueImpact:
        | "POSITIVE"
        | "NEUTRAL"
        | "NEGATIVE";

    if (totalRecoveredAmount > 0) {
        revenueImpact = "POSITIVE";
    } else if (
        totalRecoverableAmount > 0 &&
        totalRecoveredAmount === 0
    ) {
        revenueImpact = "NEGATIVE";
    } else {
        revenueImpact = "NEUTRAL";
    }

    // --------------------------------------------------
    // 8. Generate insights
    // --------------------------------------------------

    const insights: string[] = [];

    if (totalCases === 0) {
        insights.push(
            "No recovery cases are currently available for analysis."
        );
    }

    if (totalRecoveredAmount > 0) {
        insights.push(
            `Recovery pipeline has recovered ${totalRecoveredAmount.toFixed(
                2
            )} in revenue.`
        );
    }

    if (totalLostAmount > 0) {
        insights.push(
            `${totalLostAmount.toFixed(
                2
            )} of recoverable revenue remains unrecovered.`
        );
    }

    if (recoveryRate >= 70) {
        insights.push(
            "Recovery rate is strong."
        );
    } else if (recoveryRate >= 40) {
        insights.push(
            "Recovery rate is moderate and has room for improvement."
        );
    } else if (totalRecoverableAmount > 0) {
        insights.push(
            "Recovery rate is low and requires attention."
        );
    }

    if (actionSuccessRate >= 70) {
        insights.push(
            "Recovery actions are performing effectively."
        );
    } else if (totalActions > 0) {
        insights.push(
            "Recovery action success rate is below the desired level."
        );
    }

    // --------------------------------------------------
    // 9. Generate recommendations
    // --------------------------------------------------

    const recommendations: string[] = [];

    if (totalLostAmount > 0) {
        recommendations.push(
            "Prioritize active recovery cases with high recoverable amounts."
        );
    }

    if (recoveryRate < 40 && totalRecoverableAmount > 0) {
        recommendations.push(
            "Review recovery strategies and failure patterns to improve recovery performance."
        );
    }

    if (
        actionSuccessRate < 50 &&
        totalActions > 0
    ) {
        recommendations.push(
            "Analyze failed recovery actions and consider alternative recovery strategies."
        );
    }

    if (activeCases > 0) {
        recommendations.push(
            "Continue monitoring active recovery cases to prevent revenue leakage."
        );
    }

    if (recommendations.length === 0) {
        recommendations.push(
            "Continue monitoring recovery performance and revenue trends."
        );
    }

    // --------------------------------------------------
    // 10. Optional AI analysis
    // --------------------------------------------------

    let aiInsights: string[] = [];

    try {
        const aiResponse =
            await callOpenRouter([
                {
                    role: "system",
                    content: `
You are a revenue recovery analyst.

Analyze the provided recovery revenue statistics.

Return ONLY valid JSON in this format:

{
    "insights": ["string"],
    "recommendations": ["string"]
}

Keep each insight and recommendation short,
specific, and useful.
                    `.trim(),
                },
                {
                    role: "user",
                    content: JSON.stringify({
                        totalCases,
                        activeCases,
                        recoveredCases,
                        closedCases,
                        totalOriginalAmount,
                        totalRecoverableAmount,
                        totalRecoveredAmount,
                        totalLostAmount,
                        recoveryRate,
                        totalActions,
                        successfulActions,
                        failedActions,
                        actionSuccessRate,
                        averageRecoveryAmount,
                    }),
                },
            ]);

        const parsed =
            typeof aiResponse === "string"
                ? JSON.parse(aiResponse)
                : aiResponse;

        if (Array.isArray(parsed?.insights)) {
            aiInsights = parsed.insights;
        }

        if (Array.isArray(parsed?.recommendations)) {
            recommendations.push(
                ...parsed.recommendations
            );
        }
    } catch {
        // AI analysis is optional.
        // Deterministic revenue analysis remains valid.
    }

    // Add useful AI insights if available.
    if (aiInsights.length > 0) {
        insights.push(...aiInsights);
    }

    // --------------------------------------------------
    // 11. Return revenue analysis
    // --------------------------------------------------

    return {
        merchantId,

        analyzedAt: new Date(),

        totalCases,
        activeCases,
        recoveredCases,
        closedCases,

        totalOriginalAmount,
        totalRecoverableAmount,
        totalRecoveredAmount,
        totalLostAmount,

        recoveryRate: Number(
            recoveryRate.toFixed(2)
        ),

        totalActions,
        successfulActions,
        failedActions,

        actionSuccessRate: Number(
            actionSuccessRate.toFixed(2)
        ),

        averageRecoveryAmount: Number(
            averageRecoveryAmount.toFixed(2)
        ),

        revenueImpact,

        insights,
        recommendations,
    };
}