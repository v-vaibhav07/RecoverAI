import {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
} from "./services/campaign/campaign.service.js";

const USER_ID = "e4e78972-87d7-4943-ad92-6733fa5825cd";
async function test() {
    try {
        console.log("\n1. CREATE CAMPAIGN");

        const campaign = await createCampaign(
            USER_ID,
            "Test Automatic Retry Campaign",
            "Campaign for testing automatic payment retries",
            "DRAFT",
            {
                priority: "HIGH",
                paymentStatus: "FAILED",
            },
            "7ab39ac5-55b2-4718-9b8d-65aeeb91065e"
        );

        console.log("CREATE SUCCESS");
        console.log(campaign);

        const campaignId = campaign.id;

        console.log("\n2. GET ALL CAMPAIGNS");

        const campaigns = await getCampaigns(USER_ID);

        console.log("GET ALL SUCCESS");
        console.log(campaigns);

        console.log("\n3. GET CAMPAIGN BY ID");

        const campaignById = await getCampaignById(
            USER_ID,
            campaignId
        );

        console.log("GET BY ID SUCCESS");
        console.log(campaignById);

        console.log("\n4. UPDATE CAMPAIGN");

        const updatedCampaign = await updateCampaign(
            USER_ID,
            campaignId,
            {
                description: "Updated campaign description",
                status: "ACTIVE",
            }
        );

        console.log("UPDATE SUCCESS");
        console.log(updatedCampaign);

        console.log("\n5. DELETE CAMPAIGN");

        const deletedCampaign = await deleteCampaign(
            USER_ID,
            campaignId
        );

        console.log("DELETE SUCCESS");
        console.log(deletedCampaign);

        console.log("\nCAMPAIGN CRUD TEST SUCCESS");
    } catch (error) {
        console.error("CAMPAIGN CRUD TEST ERROR");
        console.error(error);
    }
}

test();