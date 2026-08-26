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

export async function processCampaignAction(
    userId: string,
    campaignActionId: string
) {
    const merchantId = await getMerchantId(userId);

    /*
     * Get campaign action
     */
    const campaignAction =
        await prisma.campaign_actions.findFirst({
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

    if (!campaignAction) {
        throw new Error("Campaign action not found");
    }

    /*
     * Campaign action must be PENDING
     */
    if (campaignAction.status !== "PENDING") {
        throw new Error(
            `Campaign action cannot be processed from status ${campaignAction.status}`
        );
    }

    /*
     * Recovery case is required
     */
    if (!campaignAction.recovery_case_id) {
        throw new Error(
            "Recovery case is required to process campaign action"
        );
    }

    const recoveryCase = campaignAction.recovery_cases;

    if (!recoveryCase) {
        throw new Error("Recovery case not found");
    }

    /*
     * Recovery case must be IN_PROGRESS
     */
    if (recoveryCase.status !== "IN_PROGRESS") {
        throw new Error(
            `Recovery case cannot be processed from status ${recoveryCase.status}`
        );
    }

    /*
     * Payment is required
     */
    if (!recoveryCase.payment_id) {
        throw new Error("Recovery case has no payment");
    }

    /*
     * Get payment belonging to this merchant
     */
    const payment = await prisma.payments.findFirst({
        where: {
            id: recoveryCase.payment_id,
            merchant_id: merchantId,
        },
    });

    if (!payment) {
        throw new Error("Payment not found");
    }

    /*
     * ---------------------------------------------------------
     * STEP 1
     * Mark campaign action as RUNNING
     * ---------------------------------------------------------
     */

    await prisma.campaign_actions.update({
        where: {
            id: campaignAction.id,
        },
        data: {
            status: "RUNNING",
            result: "Campaign action processing started",
        },
    });

    /*
     * ---------------------------------------------------------
     * STEP 2
     * Create Recovery Action
     * ---------------------------------------------------------
     */

    const recoveryAction =
        await prisma.recovery_actions.create({
            data: {
                merchant_id: merchantId,

                recovery_case_id:
                    recoveryCase.id,

                strategy_id:
                    campaignAction.campaigns.strategy_id,

                action_type:
                    campaignAction.action as any,

                status: "SCHEDULED",

                attempt_number: 1,

                scheduled_at: new Date(),

                metadata: {
                    paymentId: payment.id,

                    customerId:
                        recoveryCase.customer_id,

                    campaignActionId:
                        campaignAction.id,

                    campaignId:
                        campaignAction.campaign_id,

                    campaignName:
                        campaignAction.campaigns.name,

                    paymentAmount:
                        Number(payment.amount),
                },
            },
        });

    /*
     * ---------------------------------------------------------
     * STEP 3
     * Update campaign action with Recovery Action ID
     * ---------------------------------------------------------
     */

    const updatedCampaignAction =
        await prisma.campaign_actions.update({
            where: {
                id: campaignAction.id,
            },
            data: {
                status: "RUNNING",

                result: JSON.stringify({
                    message:
                        "Recovery action created successfully",

                    recoveryActionId:
                        recoveryAction.id,
                }),
            },
        });

    /*
     * ---------------------------------------------------------
     * RETURN
     * ---------------------------------------------------------
     */

    return {
        success: true,

        campaignActionId:
            campaignAction.id,

        campaignId:
            campaignAction.campaign_id,

        recoveryCaseId:
            recoveryCase.id,

        recoveryActionId:
            recoveryAction.id,

        status: "RUNNING",

        paymentId:
            payment.id,

        amount:
            Number(payment.amount),

        campaignAction:
            updatedCampaignAction,

        recoveryAction:
            recoveryAction,
    };
}