import { prisma } from "../../config/database.js";

async function getMerchantId(userId: string): Promise<string> {
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
        throw new Error("Only merchants can access events");
    }

    return profile.merchant_id;
}

interface CreateEventData {
    eventType: string;
    aggregateType: string;
    aggregateId?: string;
    payload?: any;
    status?: string;
    processed?: boolean;
    processedAt?: string | Date;
    error?: string;
}

interface UpdateEventData {
    eventType?: string;
    aggregateType?: string;
    aggregateId?: string;
    payload?: any;
    status?: string;
    processed?: boolean;
    processedAt?: string | Date | null;
    error?: string | null;
}

export async function createEvent(
    userId: string,
    data: CreateEventData
) {
    const merchantId = await getMerchantId(userId);

    const event = await prisma.events.create({
        data: {
            merchant_id: merchantId,
            event_type: data.eventType,
            aggregate_type: data.aggregateType,
            aggregate_id: data.aggregateId,
            payload:
                data.payload !== undefined
                    ? data.payload
                    : {},
            status:
                data.status !== undefined
                    ? (data.status as any)
                    : "PENDING",
            processed:
                data.processed !== undefined
                    ? data.processed
                    : false,
            processed_at:
                data.processedAt !== undefined
                    ? new Date(data.processedAt)
                    : undefined,
            error: data.error,
        },
    });

    return event;
}

export async function getEvents(
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
                event_type: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                aggregate_type: {
                    contains: search,
                    mode: "insensitive",
                },
            },
            {
                status: {
                    contains: search,
                    mode: "insensitive",
                },
            },
        ];
    }

    const [events, total] = await Promise.all([
        prisma.events.findMany({
            where,
            orderBy: {
                created_at: "desc",
            },
            skip,
            take: limit,
            include: {
                merchants: true,
            },
        }),

        prisma.events.count({
            where,
        }),
    ]);

    return {
        events,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getEventById(
    userId: string,
    eventId: string
) {
    const merchantId = await getMerchantId(userId);

    const event = await prisma.events.findFirst({
        where: {
            id: eventId,
            merchant_id: merchantId,
        },
        include: {
            merchants: true,
        },
    });

    if (!event) {
        throw new Error("Event not found");
    }

    return event;
}

export async function updateEvent(
    userId: string,
    eventId: string,
    data: UpdateEventData
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.events.findFirst({
        where: {
            id: eventId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Event not found");
    }

    const event = await prisma.events.update({
        where: {
            id: eventId,
        },
        data: {
            ...(data.eventType !== undefined && {
                event_type: data.eventType,
            }),

            ...(data.aggregateType !== undefined && {
                aggregate_type: data.aggregateType,
            }),

            ...(data.aggregateId !== undefined && {
                aggregate_id: data.aggregateId,
            }),

            ...(data.payload !== undefined && {
                payload: data.payload,
            }),

            ...(data.status !== undefined && {
                status: data.status as any,
            }),

            ...(data.processed !== undefined && {
                processed: data.processed,
            }),

            ...(data.processedAt !== undefined && {
                processed_at:
                    data.processedAt === null
                        ? null
                        : new Date(data.processedAt),
            }),

            ...(data.error !== undefined && {
                error: data.error,
            }),
        },
    });

    return event;
}

export async function deleteEvent(
    userId: string,
    eventId: string
) {
    const merchantId = await getMerchantId(userId);

    const existing = await prisma.events.findFirst({
        where: {
            id: eventId,
            merchant_id: merchantId,
        },
    });

    if (!existing) {
        throw new Error("Event not found");
    }

    await prisma.events.delete({
        where: {
            id: eventId,
        },
    });

    return {
        id: eventId,
    };
}