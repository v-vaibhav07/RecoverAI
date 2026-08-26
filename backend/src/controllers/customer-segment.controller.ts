import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createCustomerSegment,
    getCustomerSegments,
    getCustomerSegmentById,
    updateCustomerSegment,
    deleteCustomerSegment,
} from "../services/customer-segment/customer-segment.service.js";

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
            name,
            description,
            criteria,
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message:
                    "Customer segment name is required",
            });
        }

        const segment =
            await createCustomerSegment(
                req.user.id,
                {
                    name,
                    description,
                    criteria,
                }
            );

        return res.status(201).json({
            success: true,
            message:
                "Customer segment created successfully",
            data: {
                segment,
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

        const result =
            await getCustomerSegments(
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

        const segment =
            await getCustomerSegmentById(
                req.user.id,
                req.params.id as string
            );

        return res.json({
            success: true,
            data: {
                segment,
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
            name,
            description,
            criteria,
        } = req.body;

        const segment =
            await updateCustomerSegment(
                req.user.id,
                req.params.id as string,
                {
                    name,
                    description,
                    criteria,
                }
            );

        return res.json({
            success: true,
            message:
                "Customer segment updated successfully",
            data: {
                segment,
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

        await deleteCustomerSegment(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            message:
                "Customer segment deleted successfully",
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
}