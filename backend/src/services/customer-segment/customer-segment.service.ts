import { prisma } from "../../config/database.js";

interface CreateCustomerSegmentData {
    name: string;
    description?: string;
    criteria?: any;
}

interface UpdateCustomerSegmentData {
    name?: string;
    description?: string;
    criteria?: any;
}

async function getMerchantId(
    userId: string
): Promise<string> {
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
        throw new Error(
            "Merchant account is not active"
        );
    }

    if (profile.role !== "MERCHANT") {
        throw new Error(
            "Only merchants can access customer segments"
        );
    }

    return profile.merchant_id;
}

export async function createCustomerSegment(
    userId: string,
    data: CreateCustomerSegmentData
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.customer_segments.findFirst({
            where: {
                merchant_id: merchantId,
                name: data.name,
            },
        });

    if (existing) {
        throw new Error(
            "Customer segment with this name already exists"
        );
    }

    const segment =
        await prisma.customer_segments.create({
            data: {
                merchant_id: merchantId,
                name: data.name,
                description: data.description,
                criteria:
                    data.criteria !== undefined
                        ? data.criteria
                        : {},
            },
            include: {
                merchants: true,
            },
        });

    return segment;
}

export async function getCustomerSegments(
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
                description: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const [segments, total] =
        await Promise.all([
            prisma.customer_segments.findMany({
                where,
                orderBy: {
                    created_at: "desc",
                },
                skip,
                take: limit,
            }),

            prisma.customer_segments.count({
                where,
            }),
        ]);

    return {
        segments,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };
}

export async function getCustomerSegmentById(
    userId: string,
    segmentId: string
) {
    const merchantId = await getMerchantId(userId);

    const segment =
        await prisma.customer_segments.findFirst({
            where: {
                id: segmentId,
                merchant_id: merchantId,
            },
            include: {
                merchants: true,
            },
        });

    if (!segment) {
        throw new Error(
            "Customer segment not found"
        );
    }

    return segment;
}

export async function updateCustomerSegment(
    userId: string,
    segmentId: string,
    data: UpdateCustomerSegmentData
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.customer_segments.findFirst({
            where: {
                id: segmentId,
                merchant_id: merchantId,
            },
        });

    if (!existing) {
        throw new Error(
            "Customer segment not found"
        );
    }

    if (
        data.name !== undefined &&
        data.name !== existing.name
    ) {
        const duplicate =
            await prisma.customer_segments.findFirst({
                where: {
                    merchant_id: merchantId,
                    name: data.name,
                    NOT: {
                        id: segmentId,
                    },
                },
            });

        if (duplicate) {
            throw new Error(
                "Customer segment with this name already exists"
            );
        }
    }

    const segment =
        await prisma.customer_segments.update({
            where: {
                id: segmentId,
            },
            data: {
                ...(data.name !== undefined && {
                    name: data.name,
                }),

                ...(data.description !== undefined && {
                    description:
                        data.description,
                }),

                ...(data.criteria !== undefined && {
                    criteria: data.criteria,
                }),
            },
            include: {
                merchants: true,
            },
        });

    return segment;
}

export async function deleteCustomerSegment(
    userId: string,
    segmentId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing =
        await prisma.customer_segments.findFirst({
            where: {
                id: segmentId,
                merchant_id: merchantId,
            },
        });

    if (!existing) {
        throw new Error(
            "Customer segment not found"
        );
    }

    await prisma.customer_segments.delete({
        where: {
            id: segmentId,
        },
    });

    return {
        id: segmentId,
    };
}