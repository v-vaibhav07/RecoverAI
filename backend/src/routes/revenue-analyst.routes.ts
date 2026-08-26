import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware.js";

import {
    analyze,
} from "../controllers/revenue-analyst.controller.js";

const router = Router();

router.get(
    "/",
    authenticate,
    analyze
);

export default router;