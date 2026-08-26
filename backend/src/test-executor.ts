// import { executeRecoveryAction } from "./agents/recovery/recoveryExecutor.agent.js";

// const userId = "e4e78972-87d7-4943-ad92-6733fa5825cd";

// const actionId = "1a80f089-553e-496d-873b-711de7210079";

// async function test() {
//     try {
//         const result = await executeRecoveryAction(
//             userId,
//             actionId
//         );

//         console.log("RECOVERY EXECUTION SUCCESS");
//         console.log(result);
//     } catch (error) {
//         console.error("RECOVERY EXECUTION ERROR");
//         console.error(error);
//     }
// }

// test();

import { executeRecoveryAction } from "./agents/recovery/recoveryExecutor.agent.js";

const userId =
    "e4e78972-87d7-4943-ad92-6733fa5825cd";

const actionId =
    "e8e8c629-a97c-4e8a-8e1f-075ada55201a";

async function test() {
    try {
        const result = await executeRecoveryAction(
            userId,
            actionId
        );

        console.log("RECOVERY EXECUTION SUCCESS");
        console.log(result);
    } catch (error) {
        console.error("RECOVERY EXECUTION ERROR");
        console.error(error);
    }
}

test();