import {
    createCampaignAction,
    getCampaignActions,
    getCampaignActionById,
    updateCampaignAction,
    deleteCampaignAction,
} from "./services/campaign/campaign-action.service.js";

async function test() {
    try {
       const userId = "e4e78972-87d7-4943-ad92-6733fa5825cd";

        // Use an existing campaign ID
        const campaignId = "5193919f-e683-4866-bf6d-54165628c264";

        // Existing recovery case from your previous tests
        const recoveryCaseId =
            "135155b0-c3f4-4936-bbf3-741f7594807f";

        console.log("\n1. CREATE CAMPAIGN ACTION");

        const created = await createCampaignAction(
            userId,
            campaignId,
            "AUTOMATIC_RETRY",
            recoveryCaseId
        );

        console.log("CREATE SUCCESS");
        console.log(created);

        const actionId = created.id;

        console.log("\n2. GET ALL CAMPAIGN ACTIONS");

        const all = await getCampaignActions(
            userId,
            campaignId
        );

        console.log("GET ALL SUCCESS");
        console.log(all);

        console.log("\n3. GET CAMPAIGN ACTION BY ID");

        const byId = await getCampaignActionById(
            userId,
            actionId
        );

        console.log("GET BY ID SUCCESS");
        console.log(byId);

        console.log("\n4. UPDATE CAMPAIGN ACTION");

        const updated = await updateCampaignAction(
            userId,
            actionId,
            {
                action: "UPDATED_AUTOMATIC_RETRY",
                status: "SUCCESS",
                result: "Retry action completed successfully",
                recoveryCaseId,
            }
        );

        console.log("UPDATE SUCCESS");
        console.log(updated);

        console.log("\n5. DELETE CAMPAIGN ACTION");

        const deleted = await deleteCampaignAction(
            userId,
            actionId
        );

        console.log("DELETE SUCCESS");
        console.log(deleted);

        console.log("\nCAMPAIGN ACTION CRUD TEST SUCCESS");
    } catch (error) {
        console.error("\nCAMPAIGN ACTION CRUD TEST ERROR");
        console.error(error);
    }
}

test();