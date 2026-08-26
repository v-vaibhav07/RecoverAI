import {
    createRecoveryStrategy,
    getRecoveryStrategies,
    getRecoveryStrategyById,
    updateRecoveryStrategy,
    deleteRecoveryStrategy,
} from "./services/recovery-strategy/recovery-strategy.service.js";

async function test() {
    try {
        const userId =
            "e4e78972-87d7-4943-ad92-6733fa5825cd";

        console.log("\n1. CREATE RECOVERY STRATEGY");

        const created = await createRecoveryStrategy(
            userId,
            "Test Automatic Retry Strategy",
            "AUTOMATIC_RETRY",
            "Automatically retry failed payments",
            {
                maxAttempts: 3,
                retryDelayMinutes: 60,
            },
            true
        );

        console.log("CREATE SUCCESS");
        console.log(created);

        const strategyId = created.id;

        console.log("\n2. GET ALL RECOVERY STRATEGIES");

        const all = await getRecoveryStrategies(userId);

        console.log("GET ALL SUCCESS");
        console.log(all);

        console.log("\n3. GET RECOVERY STRATEGY BY ID");

        const byId = await getRecoveryStrategyById(
            userId,
            strategyId
        );

        console.log("GET BY ID SUCCESS");
        console.log(byId);

        console.log("\n4. UPDATE RECOVERY STRATEGY");

        const updated = await updateRecoveryStrategy(
            userId,
            strategyId,
            {
                description:
                    "Updated automatic retry strategy",
                configuration: {
                    maxAttempts: 5,
                    retryDelayMinutes: 120,
                },
                isActive: true,
            }
        );

        console.log("UPDATE SUCCESS");
        console.log(updated);

        console.log("\n5. DELETE RECOVERY STRATEGY");

        const deleted = await deleteRecoveryStrategy(
            userId,
            strategyId
        );

        console.log("DELETE SUCCESS");
        console.log(deleted);

        console.log(
            "\nRECOVERY STRATEGY CRUD TEST SUCCESS"
        );
    } catch (error) {
        console.error(
            "\nRECOVERY STRATEGY CRUD TEST ERROR"
        );
        console.error(error);
    }
}

test();