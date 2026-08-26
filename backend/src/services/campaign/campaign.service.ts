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

export async function createCampaign(
    userId: string,
    name: string,
    description?: string,
    status?: any,
    targetCriteria?: any,
    strategyId?: string,
    startDate?: Date,
    endDate?: Date
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.campaigns.findFirst({
        where: {
            merchant_id: merchantId,
            name,
        },
    });

    if (existing) {
        throw new Error("Campaign with this name already exists");
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

    return prisma.campaigns.create({
        data: {
            merchant_id: merchantId,
            name,
            description,
            status: status ?? "DRAFT",
            target_criteria: targetCriteria ?? {},
            strategy_id: strategyId,
            start_date: startDate,
            end_date: endDate,
        },
    });
}

export async function getCampaigns(
    userId: string
) {
    const merchantId = await getMerchantId(userId);

    return prisma.campaigns.findMany({
        where: {
            merchant_id: merchantId,
        },
        orderBy: {
            created_at: "desc",
        },
    });
}

export async function getCampaignById(
    userId: string,
    campaignId: string
) {
    const merchantId = await getMerchantId(userId);

    const campaign = await prisma.campaigns.findFirst({
        where: {
            id: campaignId,
            merchant_id: merchantId,
        },
        include: {
            campaign_actions: true,
            recovery_strategies: true,
        },
    });

    if (!campaign) {
        throw new Error("Campaign not found");
    }

    return campaign;
}

export async function updateCampaign(
    userId: string,
    campaignId: string,
    data: {
        name?: string;
        description?: string;
        status?: any;
        targetCriteria?: any;
        strategyId?: string;
        startDate?: Date;
        endDate?: Date;
    }
) {
    const merchantId = await getMerchantId(userId);

    const campaign = await prisma.campaigns.findFirst({
        where: {
            id: campaignId,
            merchant_id: merchantId,
        },
    });

    if (!campaign) {
        throw new Error("Campaign not found");
    }

    if (data.strategyId) {
        const strategy = await prisma.recovery_strategies.findFirst({
            where: {
                id: data.strategyId,
                merchant_id: merchantId,
            },
        });

        if (!strategy) {
            throw new Error("Recovery strategy not found");
        }
    }

    return prisma.campaigns.update({
        where: {
            id: campaignId,
        },
        data: {
            name: data.name,
            description: data.description,
            status: data.status,
            target_criteria: data.targetCriteria,
            strategy_id: data.strategyId,
            start_date: data.startDate,
            end_date: data.endDate,
        },
    });
}

export async function deleteCampaign(
    userId: string,
    campaignId: string
) {
    const merchantId = await getMerchantId(userId);

    const campaign = await prisma.campaigns.findFirst({
        where: {
            id: campaignId,
            merchant_id: merchantId,
        },
    });

    if (!campaign) {
        throw new Error("Campaign not found");
    }

    return prisma.campaigns.delete({
        where: {
            id: campaignId,
        },
    });
}