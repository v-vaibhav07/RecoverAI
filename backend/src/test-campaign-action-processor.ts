import { processCampaignAction } from "./services/campaign/campaign-action-processor.service.js";

async function test() {
    try {
        const userId =
            "e4e78972-87d7-4943-ad92-6733fa5825cd";

        /*
         * IMPORTANT:
         * Put the ID of a PENDING campaign action here.
         *
         * Create a fresh campaign action first using
         * test-campaign-action.ts if necessary.
         */
        const campaignActionId =
            "e784ceff-a6d2-4d54-b9c0-9aa89c56e18b";

        console.log("\nPROCESS CAMPAIGN ACTION");

        const result =
            await processCampaignAction(
                userId,
                campaignActionId
            );

        console.log("PROCESS SUCCESS");
        console.dir(result, {
            depth: null,
        });

    } catch (error) {
        console.error(
            "\nCAMPAIGN ACTION PROCESS ERROR"
        );
        console.error(error);
    }
}

test();