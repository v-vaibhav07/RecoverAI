import { Router } from "express";

import {
    create,
    getAll,
    getById,
    update,
    remove,
    process,
} from "../controllers/campaign-action.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", create);

router.get("/campaign/:campaignId", getAll);

router.get("/:id", getById);

router.put("/:id", update);

// Processes a PENDING campaign action: validates the linked recovery case
// and payment, then creates a SCHEDULED recovery_action from it. This is
// what turns a queued campaign action into real recovery-pipeline work.
router.post("/:id/process", process);

router.delete("/:id", remove);

export default router;