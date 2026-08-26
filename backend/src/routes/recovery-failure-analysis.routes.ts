import { Router } from "express";

import {
    analyze,
} from "../controllers/recoveryFailureAnalysis.controller.js";

import {
    authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post(
    "/:recoveryCaseId/analyze",
    analyze
);

export default router;