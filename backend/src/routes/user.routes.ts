import { Router } from "express";
import {
    authenticate,
    AuthRequest,
} from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", authenticate, (req: AuthRequest, res) => {
    res.json({
        success: true,
        user: req.user,
    });
});

export default router;