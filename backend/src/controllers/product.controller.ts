import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";

import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
} from "../services/product/product.service.js";

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
            price,
            description,
            currency,
            metadata,
        } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Product name is required",
            });
        }

        if (price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Product price is required",
            });
        }

        const product = await createProduct(
            req.user.id,
            name,
            Number(price),
            description,
            currency,
            metadata
        );

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: {
                product,
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
                message: "Authentication required",
            });
        }

        const products = await getProducts(req.user.id);

        return res.json({
            success: true,
            data: {
                products,
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
                message: "Authentication required",
            });
        }

        const id = String(req.params.id);

        const product = await getProductById(
            req.user.id,
            id
        );

        return res.json({
            success: true,
            data: {
                product,
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

        const id = String(req.params.id);

        const {
            name,
            description,
            price,
            currency,
            metadata,
        } = req.body;

        const product = await updateProduct(
            req.user.id,
            id,
            {
                name,
                description,
                price: price !== undefined
                    ? Number(price)
                    : undefined,
                currency,
                metadata,
            }
        );

        return res.json({
            success: true,
            message: "Product updated successfully",
            data: {
                product,
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

        const id = String(req.params.id);

        await deleteProduct(
            req.user.id,
            id
        );

        return res.json({
            success: true,
            message: "Product deleted successfully",
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}