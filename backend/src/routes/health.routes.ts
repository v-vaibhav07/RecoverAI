import { Router } from "express";
import { prisma } from "../config/database.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;

        res.json({
            success: true,
            service: "RecoverAI API",
            database: "connected",
            status: "healthy",
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            service: "RecoverAI API",
            database: "disconnected",
            status: "unhealthy",
        });
    }
});

export default router;