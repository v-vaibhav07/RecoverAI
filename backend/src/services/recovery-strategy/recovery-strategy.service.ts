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

export async function createRecoveryStrategy(
    userId: string,
    name: string,
    type: any,
    description?: string,
    configuration?: any,
    isActive?: boolean
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.recovery_strategies.findFirst({
        where: {
            merchant_id: merchantId,
            name,
        },
    });

    if (existing) {
        throw new Error("Recovery strategy with this name already exists");
    }

    return prisma.recovery_strategies.create({
        data: {
            merchant_id: merchantId,
            name,
            type,
            description,
            configuration: configuration ?? {},
            is_active: isActive ?? true,
        },
    });
}

export async function getRecoveryStrategies(
    userId: string
) {
    const merchantId = await getMerchantId(userId);

    return prisma.recovery_strategies.findMany({
        where: {
            merchant_id: merchantId,
        },
        orderBy: {
            created_at: "desc",
        },
    });
}

export async function getRecoveryStrategyById(
    userId: string,
    strategyId: string
) {
    const merchantId = await getMerchantId(userId);

    const strategy = await prisma.recovery_strategies.findFirst({
        where: {
            id: strategyId,
            merchant_id: merchantId,
        },
        include: {
            recovery_actions: true,
        },
    });

    if (!strategy) {
        throw new Error("Recovery strategy not found");
    }

    return strategy;
}

export async function updateRecoveryStrategy(
    userId: string,
    strategyId: string,
    data: {
        name?: string;
        type?: any;
        description?: string;
        configuration?: any;
        isActive?: boolean;
    }
) {
    const merchantId = await getMerchantId(userId);

    const strategy = await prisma.recovery_strategies.findFirst({
        where: {
            id: strategyId,
            merchant_id: merchantId,
        },
    });

    if (!strategy) {
        throw new Error("Recovery strategy not found");
    }

    return prisma.recovery_strategies.update({
        where: {
            id: strategyId,
        },
        data: {
            name: data.name,
            type: data.type,
            description: data.description,
            configuration: data.configuration,
            is_active: data.isActive,
        },
    });
}

export async function deleteRecoveryStrategy(
    userId: string,
    strategyId: string
) {
    const merchantId = await getMerchantId(userId);

    const strategy = await prisma.recovery_strategies.findFirst({
        where: {
            id: strategyId,
            merchant_id: merchantId,
        },
    });

    if (!strategy) {
        throw new Error("Recovery strategy not found");
    }

    return prisma.recovery_strategies.delete({
        where: {
            id: strategyId,
        },
    });
}