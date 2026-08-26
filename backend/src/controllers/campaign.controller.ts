import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
} from "../services/campaign/campaign.service.js";

export async function create(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const {
            name,
            description,
            status,
            targetCriteria,
            strategyId,
            startDate,
            endDate,
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Campaign name is required",
            });
        }

        const campaign = await createCampaign(
            req.user.id,
            name,
            description,
            status,
            targetCriteria,
            strategyId,
            startDate
                ? new Date(startDate)
                : undefined,
            endDate
                ? new Date(endDate)
                : undefined
        );

        return res.status(201).json({
            success: true,
            message: "Campaign created successfully",
            data: {
                campaign,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function getAll(
    req: AuthRequest,
    res: Response
) {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const campaigns = await getCampaigns(
            req.user.id
        );

        return res.json({
            success: true,
            data: {
                campaigns,
            },
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
                message: "Unauthorized",
            });
        }

        const campaign = await getCampaignById(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            data: {
                campaign,
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
                message: "Unauthorized",
            });
        }

        const {
            name,
            description,
            status,
            targetCriteria,
            strategyId,
            startDate,
            endDate,
        } = req.body;

        const campaign = await updateCampaign(
            req.user.id,
            req.params.id as string,
            {
                name,
                description,
                status,
                targetCriteria,
                strategyId,
                startDate:
                    startDate !== undefined
                        ? new Date(startDate)
                        : undefined,
                endDate:
                    endDate !== undefined
                        ? new Date(endDate)
                        : undefined,
            }
        );

        return res.json({
            success: true,
            message: "Campaign updated successfully",
            data: {
                campaign,
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
                message: "Unauthorized",
            });
        }

        await deleteCampaign(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            message: "Campaign deleted successfully",
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}