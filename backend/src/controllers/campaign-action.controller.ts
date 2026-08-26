import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createCampaignAction,
    getCampaignActions,
    getCampaignActionById,
    updateCampaignAction,
    deleteCampaignAction,
} from "../services/campaign/campaign-action.service.js";
import { processCampaignAction } from "../services/campaign/campaign-action-processor.service.js";

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
            campaignId,
            action,
            recoveryCaseId,
        } = req.body;

        if (!campaignId) {
            return res.status(400).json({
                success: false,
                message: "Campaign ID is required",
            });
        }

        if (!action) {
            return res.status(400).json({
                success: false,
                message: "Action is required",
            });
        }

        const campaignAction = await createCampaignAction(
            req.user.id,
            campaignId,
            action,
            recoveryCaseId
        );

        return res.status(201).json({
            success: true,
            message: "Campaign action created successfully",
            data: {
                campaignAction,
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

        const campaignActions = await getCampaignActions(
            req.user.id,
            req.params.campaignId as string
        );

        return res.json({
            success: true,
            data: {
                campaignActions,
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

        const campaignAction = await getCampaignActionById(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            data: {
                campaignAction,
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
            action,
            status,
            result,
            recoveryCaseId,
        } = req.body;

        const campaignAction = await updateCampaignAction(
            req.user.id,
            req.params.id as string,
            {
                action,
                status,
                result,
                recoveryCaseId,
            }
        );

        return res.json({
            success: true,
            message: "Campaign action updated successfully",
            data: {
                campaignAction,
            },
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function process(
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

        const result = await processCampaignAction(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            message: "Campaign action processed successfully",
            data: {
                processResult: result,
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

        await deleteCampaignAction(
            req.user.id,
            req.params.id as string
        );

        return res.json({
            success: true,
            message: "Campaign action deleted successfully",
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}