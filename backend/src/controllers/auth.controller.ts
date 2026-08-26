import { Request, Response } from "express";
import {
    registerMerchant,
    loginMerchant,
    logoutMerchant,
} from "../services/auth/auth.service.js";

export async function register(
    req: Request,
    res: Response
) {
    try {
        const { email, password, fullName } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: "Email, password and full name are required",
            });
        }

        const data = await registerMerchant(
            email,
            password,
            fullName
        );

        return res.status(201).json({
            success: true,
            message: "Merchant registered successfully",
            data,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

export async function login(
    req: Request,
    res: Response
) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const data = await loginMerchant(
            email,
            password
        );

        return res.json({
            success: true,
            message: "Login successful",
            data,
        });
    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message,
        });
    }
}

export async function logout(
    req: Request,
    res: Response
) {
    try {
        await logoutMerchant();

        return res.json({
            success: true,
            message: "Logout successful",
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}




export async function getMe(
    req: Request,
    res: Response
) {
    try {
        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: {
                user: (req as any).user,
            },
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
}