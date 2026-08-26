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

export async function createRecoveryAction(
    userId: string,
    recoveryCaseId: string,
    actionType: string,
    strategyId?: string,
    status?: string,
    scheduledAt?: Date,
    metadata?: any
) {
    const merchantId = await getMerchantId(userId);

    const recoveryCase = await prisma.recovery_cases.findFirst({
        where: {
            id: recoveryCaseId,
            merchant_id: merchantId,
        },
    });

    if (!recoveryCase) {
        throw new Error("Recovery case not found");
    }

    if (strategyId) {
        const strategy = await prisma.recovery_strategies.findFirst({
            where: {
                id: strategyId,
                merchant_id: merchantId,
            },
        });

        if (!strategy) {
            throw new Error("Recovery strategy not found");
        }
    }

    const action = await prisma.recovery_actions.create({
        data: {
            merchant_id: merchantId,
            recovery_case_id: recoveryCaseId,
            strategy_id: strategyId,
            action_type: actionType as any,
            status: status
                ? status as any
                : "PENDING",
            scheduled_at: scheduledAt,
            metadata: metadata ?? {},
        },
        include: {
            recovery_cases: true,
            recovery_strategies: true,
        },
    });

    return action;
}

export async function getRecoveryActions(
    userId: string
) {
    const merchantId = await getMerchantId(userId);

    const actions = await prisma.recovery_actions.findMany({
        where: {
            merchant_id: merchantId,
        },
        orderBy: {
            created_at: "desc",
        },
        include: {
            recovery_cases: true,
            recovery_strategies: true,
        },
    });

    return actions;
}

export async function getRecoveryActionById(
    userId: string,
    actionId: string
) {
    const merchantId = await getMerchantId(userId);

    const action = await prisma.recovery_actions.findFirst({
        where: {
            id: actionId,
            merchant_id: merchantId,
        },
        include: {
            recovery_cases: true,
            recovery_strategies: true,
        },
    });

    if (!action) {
        throw new Error("Recovery action not found");
    }

    return action;
}

export async function updateRecoveryAction(
    userId: string,
    actionId: string,
    data: {
        actionType?: string;
        status?: string;
        scheduledAt?: Date;
        startedAt?: Date;
        completedAt?: Date;
        result?: string;
        error?: string;
        metadata?: any;
    }
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.recovery_actions.findFirst({
        where: {
            id: actionId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Recovery action not found");
    }

    const action = await prisma.recovery_actions.update({
        where: {
            id: actionId,
        },
        data: {
            action_type:
                data.actionType !== undefined
                    ? data.actionType as any
                    : undefined,

            status:
                data.status !== undefined
                    ? data.status as any
                    : undefined,

            scheduled_at:
                data.scheduledAt !== undefined
                    ? data.scheduledAt
                    : undefined,

            started_at:
                data.startedAt !== undefined
                    ? data.startedAt
                    : undefined,

            completed_at:
                data.completedAt !== undefined
                    ? data.completedAt
                    : undefined,

            result:
                data.result !== undefined
                    ? data.result
                    : undefined,

            error:
                data.error !== undefined
                    ? data.error
                    : undefined,

            metadata:
                data.metadata !== undefined
                    ? data.metadata
                    : undefined,
        },
        include: {
            recovery_cases: true,
            recovery_strategies: true,
        },
    });

    return action;
}

export async function deleteRecoveryAction(
    userId: string,
    actionId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.recovery_actions.findFirst({
        where: {
            id: actionId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Recovery action not found");
    }

    await prisma.recovery_actions.delete({
        where: {
            id: actionId,
        },
    });
}