import { Router } from "express";

import { runForCase, runBatch } from "../controllers/recovery-pipeline.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

// Run predict -> decide -> schedule -> execute for a single recovery case.
router.post("/:recoveryCaseId/run", runForCase);

// Run the same pipeline across a batch of eligible OPEN recovery cases.
// Body: { limit?: number (1-50, default 10), status?: string (default "OPEN") }
router.post("/batch", runBatch);

export default router;
