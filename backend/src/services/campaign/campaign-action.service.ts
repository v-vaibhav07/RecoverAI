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

export async function createCampaignAction(
    userId: string,
    campaignId: string,
    action: string,
    recoveryCaseId?: string
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

    if (recoveryCaseId) {
        const recoveryCase = await prisma.recovery_cases.findFirst({
            where: {
                id: recoveryCaseId,
                merchant_id: merchantId,
            },
        });

        if (!recoveryCase) {
            throw new Error("Recovery case not found");
        }
    }

    return prisma.campaign_actions.create({
        data: {
            campaign_id: campaignId,
            recovery_case_id: recoveryCaseId,
            action,
            status: "PENDING",
        },
    });
}

export async function getCampaignActions(
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

    return prisma.campaign_actions.findMany({
        where: {
            campaign_id: campaignId,
        },
        include: {
            recovery_cases: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });
}

export async function getCampaignActionById(
    userId: string,
    campaignActionId: string
) {
    const merchantId = await getMerchantId(userId);

    const action = await prisma.campaign_actions.findFirst({
        where: {
            id: campaignActionId,
            campaigns: {
                merchant_id: merchantId,
            },
        },
        include: {
            campaigns: true,
            recovery_cases: true,
        },
    });

    if (!action) {
        throw new Error("Campaign action not found");
    }

    return action;
}

export async function updateCampaignAction(
    userId: string,
    campaignActionId: string,
    data: {
        action?: string;
        status?: any;
        result?: string;
        recoveryCaseId?: string;
    }
) {
    const merchantId = await getMerchantId(userId);

    const existingAction = await prisma.campaign_actions.findFirst({
        where: {
            id: campaignActionId,
            campaigns: {
                merchant_id: merchantId,
            },
        },
    });

    if (!existingAction) {
        throw new Error("Campaign action not found");
    }

    if (data.recoveryCaseId) {
        const recoveryCase = await prisma.recovery_cases.findFirst({
            where: {
                id: data.recoveryCaseId,
                merchant_id: merchantId,
            },
        });

        if (!recoveryCase) {
            throw new Error("Recovery case not found");
        }
    }

    return prisma.campaign_actions.update({
        where: {
            id: campaignActionId,
        },
        data: {
            action: data.action,
            status: data.status,
            result: data.result,
            recovery_case_id: data.recoveryCaseId,
        },
    });
}

export async function deleteCampaignAction(
    userId: string,
    campaignActionId: string
) {
    const merchantId = await getMerchantId(userId);

    const existingAction = await prisma.campaign_actions.findFirst({
        where: {
            id: campaignActionId,
            campaigns: {
                merchant_id: merchantId,
            },
        },
    });

    if (!existingAction) {
        throw new Error("Campaign action not found");
    }

    return prisma.campaign_actions.delete({
        where: {
            id: campaignActionId,
        },
    });
}