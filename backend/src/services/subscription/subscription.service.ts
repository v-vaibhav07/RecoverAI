// import { prisma } from "../../config/database.js";

// export async function createSubscription(
//     merchantId: string,
//     customerId: string,
//     productId: string | undefined,
//     planName: string | undefined,
//     amount: number,
//     billingInterval: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY"
// ) {
//     const customer = await prisma.customers.findFirst({
//         where: {
//             id: customerId,
//             merchant_id: merchantId,
//         },
//     });

//     if (!customer) {
//         throw new Error("Customer not found");
//     }

//     if (productId) {
//         const product = await prisma.products.findFirst({
//             where: {
//                 id: productId,
//                 merchant_id: merchantId,
//             },
//         });

//         if (!product) {
//             throw new Error("Product not found");
//         }
//     }

//     const subscription = await prisma.subscriptions.create({
//         data: {
//             merchant_id: merchantId,
//             customer_id: customerId,
//             product_id: productId,
//             plan_name: planName,
//             amount,
//             billing_interval: billingInterval,
//             status: "ACTIVE",
//         },
//     });

//     return subscription;
// }

// export async function getSubscriptions(
//     merchantId: string
// ) {
//     return await prisma.subscriptions.findMany({
//         where: {
//             merchant_id: merchantId,
//         },
//         include: {
//             customers: true,
//             products: true,
//         },
//         orderBy: {
//             created_at: "desc",
//         },
//     });
// }

// export async function getSubscriptionById(
//     merchantId: string,
//     subscriptionId: string
// ) {
//     const subscription = await prisma.subscriptions.findFirst({
//         where: {
//             id: subscriptionId,
//             merchant_id: merchantId,
//         },
//         include: {
//             customers: true,
//             products: true,
//         },
//     });

//     if (!subscription) {
//         throw new Error("Subscription not found");
//     }

//     return subscription;
// }

// export async function updateSubscription(
//     merchantId: string,
//     subscriptionId: string,
//     data: {
//         planName?: string;
//         amount?: number;
//         billingInterval?: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
//         status?: "ACTIVE" | "PAST_DUE" | "PAUSED" | "CANCELLED" | "EXPIRED";
//     }
// ) {
//     const existing = await prisma.subscriptions.findFirst({
//         where: {
//             id: subscriptionId,
//             merchant_id: merchantId,
//         },
//     });

//     if (!existing) {
//         throw new Error("Subscription not found");
//     }

//     const subscription = await prisma.subscriptions.update({
//         where: {
//             id: subscriptionId,
//         },
//         data: {
//             plan_name: data.planName,
//             amount: data.amount,
//             billing_interval: data.billingInterval,
//             status: data.status,
//         },
//     });

//     return subscription;
// }

// export async function cancelSubscription(
//     merchantId: string,
//     subscriptionId: string
// ) {
//     const existing = await prisma.subscriptions.findFirst({
//         where: {
//             id: subscriptionId,
//             merchant_id: merchantId,
//         },
//     });

//     if (!existing) {
//         throw new Error("Subscription not found");
//     }

//     return await prisma.subscriptions.update({
//         where: {
//             id: subscriptionId,
//         },
//         data: {
//             status: "CANCELLED",
//             cancelled_at: new Date(),
//         },
//     });
// }

// export async function deleteSubscription(
//     merchantId: string,
//     subscriptionId: string
// ) {
//     const existing = await prisma.subscriptions.findFirst({
//         where: {
//             id: subscriptionId,
//             merchant_id: merchantId,
//         },
//     });

//     if (!existing) {
//         throw new Error("Subscription not found");
//     }

//     await prisma.subscriptions.delete({
//         where: {
//             id: subscriptionId,
//         },
//     });
// }








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

export async function createSubscription(
    userId: string,
    customerId: string,
    productId: string | undefined,
    planName: string | undefined,
    amount: number,
    billingInterval: string
) {
    const merchantId = await getMerchantId(userId);

    const customer = await prisma.customers.findFirst({
        where: {
            id: customerId,
            merchant_id: merchantId,
        },
    });

    if (!customer) {
        throw new Error("Customer not found");
    }

    if (productId) {
        const product = await prisma.products.findFirst({
            where: {
                id: productId,
                merchant_id: merchantId,
            },
        });

        if (!product) {
            throw new Error("Product not found");
        }
    }

    const subscription = await prisma.subscriptions.create({
        data: {
            merchant_id: merchantId,
            customer_id: customerId,
            product_id: productId,
            plan_name: planName,
            amount,
            billing_interval: billingInterval as any,
            status: "ACTIVE",
            start_date: new Date(),
        },
    });

    return subscription;
}

export async function getSubscriptions(userId: string) {
    const merchantId = await getMerchantId(userId);

    return await prisma.subscriptions.findMany({
        where: {
            merchant_id: merchantId,
        },
        include: {
            customers: true,
            products: true,
        },
        orderBy: {
            created_at: "desc",
        },
    });
}

export async function getSubscriptionById(
    userId: string,
    subscriptionId: string
) {
    const merchantId = await getMerchantId(userId);

    const subscription = await prisma.subscriptions.findFirst({
        where: {
            id: subscriptionId,
            merchant_id: merchantId,
        },
        include: {
            customers: true,
            products: true,
        },
    });

    if (!subscription) {
        throw new Error("Subscription not found");
    }

    return subscription;
}

export async function updateSubscription(
    userId: string,
    subscriptionId: string,
    data: {
        planName?: string;
        amount?: number;
        billingInterval?: string;
        status?: string;
    }
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.subscriptions.findFirst({
        where: {
            id: subscriptionId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Subscription not found");
    }

    return await prisma.subscriptions.update({
        where: {
            id: subscriptionId,
        },
        data: {
            ...(data.planName !== undefined && {
                plan_name: data.planName,
            }),
            ...(data.amount !== undefined && {
                amount: data.amount,
            }),
            ...(data.billingInterval !== undefined && {
                billing_interval: data.billingInterval as any,
            }),
            ...(data.status !== undefined && {
                status: data.status as any,
            }),
        },
    });
}

export async function cancelSubscription(
    userId: string,
    subscriptionId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.subscriptions.findFirst({
        where: {
            id: subscriptionId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Subscription not found");
    }

    return await prisma.subscriptions.update({
        where: {
            id: subscriptionId,
        },
        data: {
            status: "CANCELLED",
            cancelled_at: new Date(),
        },
    });
}

export async function deleteSubscription(
    userId: string,
    subscriptionId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.subscriptions.findFirst({
        where: {
            id: subscriptionId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Subscription not found");
    }

    await prisma.subscriptions.delete({
        where: {
            id: subscriptionId,
        },
    });
}