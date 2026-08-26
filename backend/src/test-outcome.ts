import { processRecoveryOutcome } from "./agents/recovery/recoveryOutcome.agent.js";
const userId = "e4e78972-87d7-4943-ad92-6733fa5825cd";

const actionId = "1a80f089-553e-496d-873b-711de7210079";

async function test() {
    try {
        const result = await processRecoveryOutcome(
            userId,
            actionId
        );

        console.log("RECOVERY OUTCOME SUCCESS");
        console.dir(result, { depth: null });
    } catch (error) {
        console.error("RECOVERY OUTCOME ERROR");
        console.error(error);
    }
}

test();