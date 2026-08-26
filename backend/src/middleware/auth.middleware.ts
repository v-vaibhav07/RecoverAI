import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase.js";

export interface AuthRequest extends Request {
    user?: any;
}

export async function authenticate(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token required",
            });
        }

        const token = authHeader.split(" ")[1];

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        req.user = data.user;

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Authentication failed",
        });
    }
}




export async function getMe(req: any, res: Response) {
    try {
        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: {
                user: req.user,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user",
        });
    }
}