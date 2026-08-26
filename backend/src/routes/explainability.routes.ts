import { Router } from "express";

import {
    generateExplainability,
} from "../controllers/explainability.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post(
    "/:recoveryCaseId",
    authenticate,
    generateExplainability
);

export default router;