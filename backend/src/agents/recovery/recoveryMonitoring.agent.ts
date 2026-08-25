import { prisma } from "../../config/database.js";

type MonitoringIssue = {
    type:
        | "STUCK_ACTION"
        | "REPEATED_FAILURE"
        | "NO_ACTION"
        | "PENDING_AFTER_RECOVERY"
        | "CASE_STUCK"
        | "HEALTHY";

    severity: "LOW" | "MEDIUM" | "HIGH";

    recoveryCaseId?: string;

    actionId?: string;

    message: string;

    recommendation: string;
};

type RecoveryMonitoringResult = {
    merchantId: string;

    monitoredAt: Date;

    totalCases: number;

    activeCases: number;

    recoveredCases: number;

    closedCases: number;

    scheduledActions: number;

    runningActions: number;

    successfulActions: number;

    failedActions: number;

    issues: MonitoringIssue[];

    health:
        | "HEALTHY"
        | "WARNING"
        | "CRITICAL";
};

export async function monitorRecoveryPipeline(
    userId: string
): Promise<RecoveryMonitoringResult> {
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
    // 2. Load recovery cases
    // --------------------------------------------------

    const recoveryCases =
        await prisma.recovery_cases.findMany({
            where: {
                merchant_id: merchantId,
            },
            include: {
                recovery_actions: {
                    orderBy: {
                        created_at: "desc",
                    },
                },
            },
            orderBy: {
                created_at: "desc",
            },
        });

    // --------------------------------------------------
    // 3. Basic statistics
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

    const allActions = recoveryCases.flatMap(
        (recoveryCase) =>
            recoveryCase.recovery_actions
    );

    const scheduledActions = allActions.filter(
        (action) =>
            action.status === "SCHEDULED"
    ).length;

    const runningActions = allActions.filter(
        (action) =>
            action.status === "RUNNING"
    ).length;

    const successfulActions = allActions.filter(
        (action) =>
            action.status === "SUCCESS" 
           
    ).length;

    const failedActions = allActions.filter(
        (action) =>
            action.status === "FAILED"
    ).length;

    // --------------------------------------------------
    // 4. Detect pipeline issues
    // --------------------------------------------------

    const issues: MonitoringIssue[] = [];

    const now = Date.now();

    for (const recoveryCase of recoveryCases) {
        const actions =
            recoveryCase.recovery_actions;

        const latestAction = actions[0];

        // ----------------------------------------------
        // Case 1: No action for active recovery case
        // ----------------------------------------------

        if (
            recoveryCase.status !== "RECOVERED" &&
            recoveryCase.status !== "CLOSED" &&
            !latestAction
        ) {
            issues.push({
                type: "NO_ACTION",
                severity: "MEDIUM",
                recoveryCaseId: recoveryCase.id,
                message:
                    "Active recovery case has no recovery action.",
                recommendation:
                    "Run recovery prediction and decision agents, then schedule a recovery action.",
            });
        }

        // ----------------------------------------------
        // Case 2: Scheduled action is stuck
        // ----------------------------------------------

        if (
            latestAction &&
            latestAction.status === "SCHEDULED" &&
            latestAction.scheduled_at
        ) {
            const scheduledTime =
                new Date(
                    latestAction.scheduled_at
                ).getTime();

            const hoursWaiting =
                (now - scheduledTime) /
                (1000 * 60 * 60);

            if (hoursWaiting > 24) {
                issues.push({
                    type: "STUCK_ACTION",
                    severity: "HIGH",
                    recoveryCaseId:
                        recoveryCase.id,
                    actionId:
                        latestAction.id,
                    message:
                        "Recovery action has remained scheduled for more than 24 hours.",
                    recommendation:
                        "Check the recovery executor or manually execute/reschedule the action.",
                });
            }
        }

        // ----------------------------------------------
        // Case 3: Running action is stuck
        // ----------------------------------------------

        if (
            latestAction &&
            latestAction.status === "RUNNING" &&
            latestAction.started_at
        ) {
            const startedTime =
                new Date(
                    latestAction.started_at
                ).getTime();

            const hoursRunning =
                (now - startedTime) /
                (1000 * 60 * 60);

            if (hoursRunning > 1) {
                issues.push({
                    type: "STUCK_ACTION",
                    severity: "HIGH",
                    recoveryCaseId:
                        recoveryCase.id,
                    actionId:
                        latestAction.id,
                    message:
                        "Recovery action has been running for more than 1 hour.",
                    recommendation:
                        "Check executor processing and payment attempt status.",
                });
            }
        }

        // ----------------------------------------------
        // Case 4: Repeated failures
        // ----------------------------------------------

        const failedActionsForCase =
            actions.filter(
                (action) =>
                    action.status === "FAILED"
            );

        if (
            failedActionsForCase.length >= 3
        ) {
            issues.push({
                type: "REPEATED_FAILURE",
                severity: "HIGH",
                recoveryCaseId:
                    recoveryCase.id,
                message:
                    "Recovery case has failed three or more recovery actions.",
                recommendation:
                    "Run failure analysis and select an alternative recovery strategy.",
            });
        }

        // ----------------------------------------------
        // Case 5: Recovered case still has pending action
        // ----------------------------------------------

        if (
            recoveryCase.status === "RECOVERED" ||
            recoveryCase.status === "CLOSED"
        ) {
            const pendingActions =
                actions.filter(
                    (action) =>
                        action.status ===
                            "SCHEDULED" ||
                        action.status === "RUNNING"
                );

            if (pendingActions.length > 0) {
                issues.push({
                    type: "PENDING_AFTER_RECOVERY",
                    severity: "MEDIUM",
                    recoveryCaseId:
                        recoveryCase.id,
                    message:
                        "Completed recovery case still has pending recovery actions.",
                    recommendation:
                        "Cancel or close unnecessary pending actions.",
                });
            }
        }

        // ----------------------------------------------
        // Case 6: Case marked action scheduled but
        // has no scheduled action
        // ----------------------------------------------

        if (
            recoveryCase.status ===
                "ACTION_SCHEDULED" &&
            (!latestAction ||
                latestAction.status !==
                    "SCHEDULED")
        ) {
            issues.push({
                type: "CASE_STUCK",
                severity: "HIGH",
                recoveryCaseId:
                    recoveryCase.id,
                message:
                    "Recovery case is marked ACTION_SCHEDULED but has no scheduled action.",
                recommendation:
                    "Reconcile the recovery case with its recovery actions.",
            });
        }
    }

    // --------------------------------------------------
    // 5. Determine pipeline health
    // --------------------------------------------------

    let health:
        | "HEALTHY"
        | "WARNING"
        | "CRITICAL";

    const criticalIssues =
        issues.filter(
            (issue) =>
                issue.severity === "HIGH"
        ).length;

    const warningIssues =
        issues.filter(
            (issue) =>
                issue.severity === "MEDIUM"
        ).length;

    if (criticalIssues > 0) {
        health = "CRITICAL";
    } else if (warningIssues > 0) {
        health = "WARNING";
    } else {
        health = "HEALTHY";
    }

    // --------------------------------------------------
    // 6. If nothing is wrong
    // --------------------------------------------------

    if (issues.length === 0) {
        issues.push({
            type: "HEALTHY",
            severity: "LOW",
            message:
                "Recovery pipeline is operating normally.",
            recommendation:
                "Continue monitoring recovery cases and actions.",
        });
    }

    // --------------------------------------------------
    // 7. Return monitoring result
    // --------------------------------------------------

    return {
        merchantId,

        monitoredAt: new Date(),

        totalCases,

        activeCases,

        recoveredCases,

        closedCases,

        scheduledActions,

        runningActions,

        successfulActions,

        failedActions,

        issues,

        health,
    };
}