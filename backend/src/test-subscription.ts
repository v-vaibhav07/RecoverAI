import {
    createSubscription,
    getSubscriptions,
    getSubscriptionById,
    updateSubscription,
    cancelSubscription,
    deleteSubscription,
} from "./services/subscription/subscription.service.js";

async function test() {

    // Use the same userId you used in your previous tests
    const userId = "e4e78972-87d7-4943-ad92-6733fa5825cd";

    // Use an existing customer belonging to this merchant
    const customerId = "c5da3144-9b69-4f3a-8b69-cec587dd3381";

    // We can test without a product
    const productId = undefined;

    console.log("\n1. CREATE SUBSCRIPTION");

    const subscription = await createSubscription(
        userId,
        customerId,
        productId,
        "Test Monthly Plan",
        1499,
        "MONTHLY"
    );

    console.log("CREATE SUCCESS");
    console.log(subscription);

    const subscriptionId = subscription.id;

    console.log("\n2. GET ALL SUBSCRIPTIONS");

    const subscriptions = await getSubscriptions(userId);

    console.log("GET ALL SUCCESS");
    console.log(subscriptions);

    console.log("\n3. GET SUBSCRIPTION BY ID");

    const subscriptionById = await getSubscriptionById(
        userId,
        subscriptionId
    );

    console.log("GET BY ID SUCCESS");
    console.log(subscriptionById);

    console.log("\n4. UPDATE SUBSCRIPTION");

    const updatedSubscription = await updateSubscription(
        userId,
        subscriptionId,
        {
            planName: "Updated Monthly Plan",
            amount: 1999,
        }
    );

    console.log("UPDATE SUCCESS");
    console.log(updatedSubscription);

    console.log("\n5. CANCEL SUBSCRIPTION");

    const cancelledSubscription = await cancelSubscription(
        userId,
        subscriptionId
    );

    console.log("CANCEL SUCCESS");
    console.log(cancelledSubscription);

    console.log("\n6. DELETE SUBSCRIPTION");

    await deleteSubscription(
        userId,
        subscriptionId
    );

    console.log("DELETE SUCCESS");

    console.log("\nSUBSCRIPTION CRUD TEST SUCCESS");
}

test().catch((error) => {
    console.error("\nSUBSCRIPTION CRUD TEST ERROR");
    console.error(error);
});