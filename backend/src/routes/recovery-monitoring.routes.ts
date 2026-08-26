import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { monitor } from "../controllers/recovery-monitoring.controller.js";

const router = Router();

router.get(
    "/",
    authenticate,
    monitor
);

export default router;