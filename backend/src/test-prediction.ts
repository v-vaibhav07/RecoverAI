import { predictRecovery } from "./agents/recovery/recoveryPrediction.agent.js";

const userId = "e4e78972-87d7-4943-ad92-6733fa5825cd";
const recoveryCaseId = "135155b0-c3f4-4936-bbf3-741f7594807f";

async function test() {
    try {
        const result = await predictRecovery(
            userId,
            recoveryCaseId
        );

        console.log("AI PREDICTION SUCCESS");
        console.log(result);
    } catch (error) {
        console.error("AI PREDICTION ERROR");
        console.error(error);
    }
}

test();