import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
} from "../services/customer/customer.service.js";

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
            email,
            phone,
            country,
            externalCustomerId,
            metadata,
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Customer name is required",
            });
        }

        const customer = await createCustomer(
            req.user.id,
            {
                name,
                email,
                phone,
                country,
                externalCustomerId,
                metadata,
            }
        );

        return res.status(201).json({
            success: true,
            message: "Customer created successfully",
            data: {
                customer,
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
            Math.max(Number(req.query.limit) || 20, 1),
            100
        );

        const search =
            typeof req.query.search === "string"
                ? req.query.search
                : undefined;

        const result = await getCustomers(
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

        const customer = await getCustomerById(
            req.user.id,
            req.params.id
        );

        return res.json({
            success: true,
            data: {
                customer,
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

        const customer = await updateCustomer(
            req.user.id,
            req.params.id,
            req.body
        );

        return res.json({
            success: true,
            message: "Customer updated successfully",
            data: {
                customer,
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

        await deleteCustomer(
            req.user.id,
            req.params.id
        );

        return res.json({
            success: true,
            message: "Customer deleted successfully",
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
}