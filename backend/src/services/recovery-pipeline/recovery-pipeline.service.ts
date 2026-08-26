import { prisma } from "../../config/database.js";
import { createAuditLog } from "../audit-log/audit-log.service.js";

import { predictRecovery } from "../../agents/recovery/recoveryPrediction.agent.js";
import { decideRecovery } from "../../agents/recovery/recoveryDecision.agent.js";
// Two different agent files both export a function named
// `executeRecoveryAction` with different signatures:
//   - recoveryAction.agent.ts   : (userId, recoveryCaseId) -> creates the
//                                  SCHEDULED recovery_actions row from the
//                                  latest AI decision.
//   - recoveryExecutor.agent.ts : (userId, actionId) -> actually runs that
//                                  scheduled action (simulated retry) and
//                                  updates payment / recovery_case /
//                                  customer / transaction state.
// They are aliased here to make the pipeline order unambiguous.
import { executeRecoveryAction as scheduleRecoveryAction } from "../../agents/recovery/recoveryAction.agent.js";
import { executeRecoveryAction as runScheduledAction } from "../../agents/recovery/recoveryExecutor.agent.js";

// NOTE: recoveryOutcome.agent.ts is intentionally NOT used here. It
// duplicates work that recoveryExecutor.agent.ts already does, and it
// writes recovery_actions.status = "COMPLETED", which is not a valid
// recovery_action_status enum value (the enum is PENDING | SCHEDULED |
// RUNNING | SUCCESS | FAILED | CANCELLED | SKIPPED) — calling it would
// throw a Prisma validation error. Flagging rather than silently wiring
// around it, per "do not modify backend without being asked" — now that
// you've asked for pipeline wiring, this note explains the omission.

async function getMerchantId(userId: string): Promise<string> {
    const profile = await prisma.profiles.findUnique({
        where: { id: userId },
        select: { merchant_id: true },
    });
    if (!profile) {
        throw new Error("Merchant profile not found");
    }
    return profile.merchant_id;
}

export interface SingleCasePipelineResult {
    recoveryCaseId: string;
    prediction: {
        id: string;
        recoveryScore: number | null;
        recoveryProbability: number | null;
        expectedRecoveryAmount: string;
        confidence: string;
    };
    decision: {
        id: string;
        recommendedAction: string | null;
        reasoningSummary: string | null;
        confidence: string;
    };
    action: {
        id: string;
        actionType: string;
        status: string;
    };
    execution: {
        success: boolean;
        status: string;
        recoveredAmount: number;
        failureCode?: string | null;
        failureMessage?: string | null;
        message: string;
    };
}

// Runs predict -> decide -> schedule action -> execute action for a single
// recovery case, end to end, and records an audit log entry for the run.
export async function runRecoveryPipelineForCase(
    userId: string,
    recoveryCaseId: string,
    ipAddress: string
): Promise<SingleCasePipelineResult> {
    const merchantId = await getMerchantId(userId);

    const existingCase = await prisma.recovery_cases.findFirst({
        where: { id: recoveryCaseId, merchant_id: merchantId },
    });

    if (!existingCase) {
        throw new Error("Recovery case not found");
    }

    if (existingCase.status === "RECOVERED" || existingCase.status === "CLOSED") {
        throw new Error(
            `Recovery case is already ${existingCase.status.toLowerCase()} — nothing to run`
        );
    }

    // 1. Predict
    const prediction = await predictRecovery(userId, recoveryCaseId);

    // 2. Decide (requires at least one active recovery_strategies row)
    const decision = await decideRecovery(userId, recoveryCaseId);

    // 3. Schedule the recommended action
    const scheduledAction = await scheduleRecoveryAction(userId, recoveryCaseId);

    // 4. Execute the scheduled action (simulated retry against the payment)
    const executionResult = await runScheduledAction(userId, scheduledAction.id);

    await createAuditLog(userId, {
        userId,
        action: "RECOVERY_PIPELINE_RUN",
        entityType: "recovery_case",
        entityId: recoveryCaseId,
        newValues: {
            predictionId: prediction.id,
            decisionId: decision.id,
            actionId: scheduledAction.id,
            executionResult,
        },
        ipAddress,
    });

    return {
        recoveryCaseId,
        prediction: {
            id: prediction.id,
            recoveryScore: prediction.recovery_score
                ? Number(prediction.recovery_score)
                : null,
            recoveryProbability: prediction.recovery_probability
                ? Number(prediction.recovery_probability)
                : null,
            expectedRecoveryAmount: String(prediction.expected_recovery_amount),
            confidence: prediction.confidence,
        },
        decision: {
            id: decision.id,
            recommendedAction: decision.recommended_action,
            reasoningSummary: decision.reasoning_summary,
            confidence: decision.confidence,
        },
        action: {
            id: scheduledAction.id,
            actionType: scheduledAction.action_type,
            status: scheduledAction.status,
        },
        execution: executionResult,
    };
}

export interface BatchPipelineResult {
    totalCases: number;
    succeeded: number;
    failed: number;
    totalRecoveredAmount: number;
    results: Array<
        | { recoveryCaseId: string; success: true; result: SingleCasePipelineResult }
        | { recoveryCaseId: string; success: false; error: string }
    >;
}

// Runs the full pipeline across a batch of eligible OPEN recovery cases for
// the merchant, sequentially (so DB writes and OpenRouter calls don't race
// each other), and returns an aggregate summary — this is what satisfies
// "measured money recovered across a batch" rather than one case at a time.
export async function runRecoveryPipelineBatch(
    userId: string,
    ipAddress: string,
    options?: { limit?: number; status?: string }
): Promise<BatchPipelineResult> {
    const merchantId = await getMerchantId(userId);

    const limit = Math.min(Math.max(options?.limit ?? 10, 1), 50);
    const status = options?.status ?? "OPEN";

    const eligibleCases = await prisma.recovery_cases.findMany({
        where: {
            merchant_id: merchantId,
            status: status as any,
        },
        take: limit,
        orderBy: { created_at: "asc" },
    });

    const results: BatchPipelineResult["results"] = [];
    let succeeded = 0;
    let failed = 0;
    let totalRecoveredAmount = 0;

    for (const c of eligibleCases) {
        try {
            const result = await runRecoveryPipelineForCase(userId, c.id, ipAddress);
            results.push({ recoveryCaseId: c.id, success: true, result });
            succeeded += 1;
            totalRecoveredAmount += result.execution.recoveredAmount ?? 0;
        } catch (error: any) {
            results.push({
                recoveryCaseId: c.id,
                success: false,
                error: error?.message ?? "Pipeline run failed",
            });
            failed += 1;
        }
    }

    await createAuditLog(userId, {
        userId,
        action: "RECOVERY_PIPELINE_BATCH_RUN",
        entityType: "merchant",
        entityId: merchantId,
        newValues: {
            totalCases: eligibleCases.length,
            succeeded,
            failed,
            totalRecoveredAmount,
        },
        ipAddress,
    });

    return {
        totalCases: eligibleCases.length,
        succeeded,
        failed,
        totalRecoveredAmount,
        results,
    };
}
