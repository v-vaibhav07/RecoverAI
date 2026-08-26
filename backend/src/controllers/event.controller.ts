import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createEvent,
    getEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} from "../services/event/event.service.js";

export async function create(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const {
            eventType,
            aggregateType,
            aggregateId,
            payload,
            status,
            processed,
            processedAt,
            error,
        } = req.body;

        if (!eventType) {
            return res.status(400).json({
                success: false,
                message: "Event type is required",
            });
        }

        if (!aggregateType) {
            return res.status(400).json({
                success: false,
                message: "Aggregate type is required",
            });
        }

        if (
            processedAt !== undefined &&
            processedAt !== null &&
            Number.isNaN(new Date(processedAt).getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid processed date",
            });
        }

        const event = await createEvent(
            req.user.id,
            {
                eventType,
                aggregateType,
                aggregateId,
                payload,
                status,
                processed,
                processedAt,
                error,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: {
                event,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function list(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const page = Math.max(
            Number(req.query.page) || 1,
            1
        );

        const limit = Math.min(
            Math.max(
                Number(req.query.limit) || 20,
                1
            ),
            100
        );

        const search =
            typeof req.query.search === "string"
                ? req.query.search
                : undefined;

        const result = await getEvents(
            req.user.id,
            page,
            limit,
            search
        );

        return res.json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function getById(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const eventId = String(req.params.id);

        const event = await getEventById(
            req.user.id,
            eventId
        );

        return res.json({
            success: true,
            data: {
                event,
            },
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
}

export async function update(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const {
            eventType,
            aggregateType,
            aggregateId,
            payload,
            status,
            processed,
            processedAt,
            error,
        } = req.body;

        if (
            processedAt !== undefined &&
            processedAt !== null &&
            Number.isNaN(new Date(processedAt).getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid processed date",
            });
        }

        const eventId = String(req.params.id);

        const event = await updateEvent(
            req.user.id,
            eventId,
            {
                eventType,
                aggregateType,
                aggregateId,
                payload,
                status,
                processed,
                processedAt,
                error,
            }
        );

        return res.json({
            success: true,
            message: "Event updated successfully",
            data: {
                event,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function remove(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const eventId = String(req.params.id);

        await deleteEvent(
            req.user.id,
            eventId
        );

        return res.json({
            success: true,
            message: "Event deleted successfully",
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
}