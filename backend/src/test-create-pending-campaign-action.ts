import { createCampaignAction } from "./services/campaign/campaign-action.service.js";

async function test() {
    try {
        const userId =
            "e4e78972-87d7-4943-ad92-6733fa5825cd";

        const campaignId =
            "5193919f-e683-4866-bf6d-54165628c264";

        const recoveryCaseId =
            "135155b0-c3f4-4936-bbf3-741f7594807f";

        const result =
            await createCampaignAction(
                userId,
                campaignId,
                "AUTOMATIC_RETRY",
                recoveryCaseId
            );

        console.log(
            "PENDING CAMPAIGN ACTION CREATED"
        );

        console.log(result);

    } catch (error) {
        console.error(error);
    }
}

test();