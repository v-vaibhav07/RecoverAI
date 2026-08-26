import { prisma } from "../../config/database.js";

interface CreateCustomerData {
    name: string;
    email?: string;
    phone?: string;
    country?: string;
    externalCustomerId?: string;
    metadata?: any;
}

interface UpdateCustomerData {
    name?: string;
    email?: string;
    phone?: string;
    country?: string;
    externalCustomerId?: string;
    metadata?: any;
}

async function getMerchantId(userId: string) {
    const profile = await prisma.profiles.findUnique({
        where: {
            id: userId,
        },
        select: {
            merchant_id: true,
            role: true,
            status: true,
        },
    });

    if (!profile) {
        throw new Error("Merchant profile not found");
    }

    if (profile.status !== "ACTIVE") {
        throw new Error("Merchant account is not active");
    }

    if (profile.role !== "MERCHANT") {
        throw new Error("Only merchants can access customers");
    }

    return profile.merchant_id;
}

export async function createCustomer(
    userId: string,
    data: CreateCustomerData
) {
    const merchantId = await getMerchantId(userId);

    if (data.externalCustomerId) {
        const existing = await prisma.customers.findFirst({
            where: {
                merchant_id: merchantId,
                external_customer_id: data.externalCustomerId,
            },
        });

        if (existing) {
            throw new Error("Customer with this external ID already exists");
        }
    }

    const customer = await prisma.customers.create({
        data: {
            merchant_id: merchantId,
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            country: data.country || null,
            external_customer_id: data.externalCustomerId || null,
            metadata: data.metadata || {},
        },
    });

    return customer;
}

export async function getCustomers(
    userId: string,
    page = 1,
    limit = 20,
    search?: string
) {
    const merchantId = await getMerchantId(userId);

    const skip = (page - 1) * limit;

    const where: any = {
        merchant_id: merchantId,
    };

    if (search) {
        where.OR = [
            {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                email: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                phone: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                external_customer_id: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const [customers, total] = await Promise.all([
        prisma.customers.findMany({
            where,
            orderBy: {
                created_at: "desc",
            },
            skip,
            take: limit,
        }),

        prisma.customers.count({
            where,
        }),
    ]);

    return {
        customers,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getCustomerById(
    userId: string,
    customerId: string
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

    return customer;
}

export async function updateCustomer(
    userId: string,
    customerId: string,
    data: UpdateCustomerData
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.customers.findFirst({
        where: {
            id: customerId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Customer not found");
    }

    if (
        data.externalCustomerId &&
        data.externalCustomerId !== existing.external_customer_id
    ) {
        const duplicate = await prisma.customers.findFirst({
            where: {
                merchant_id: merchantId,
                external_customer_id: data.externalCustomerId,
                NOT: {
                    id: customerId,
                },
            },
        });

        if (duplicate) {
            throw new Error("Customer with this external ID already exists");
        }
    }

    const customer = await prisma.customers.update({
        where: {
            id: customerId,
        },
        data: {
            ...(data.name !== undefined && {
                name: data.name,
            }),
            ...(data.email !== undefined && {
                email: data.email,
            }),
            ...(data.phone !== undefined && {
                phone: data.phone,
            }),
            ...(data.country !== undefined && {
                country: data.country,
            }),
            ...(data.externalCustomerId !== undefined && {
                external_customer_id: data.externalCustomerId,
            }),
            ...(data.metadata !== undefined && {
                metadata: data.metadata,
            }),
        },
    });

    return customer;
}

export async function deleteCustomer(
    userId: string,
    customerId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.customers.findFirst({
        where: {
            id: customerId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Customer not found");
    }

    await prisma.customers.delete({
        where: {
            id: customerId,
        },
    });

    return {
        id: customerId,
    };
}