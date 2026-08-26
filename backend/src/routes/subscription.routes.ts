import { Router } from "express";

import {
    create,
    getAll,
    getById,
    update,
    cancel,
    remove,
} from "../controllers/subscription.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", create);
router.get("/", getAll);
router.get("/:id", getById);
router.put("/:id", update);
router.patch("/:id/cancel", cancel);
router.delete("/:id", remove);

export default router;