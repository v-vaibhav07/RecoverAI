import { Router } from "express";

import {
    create,
    getAll,
    getById,
    update,
    remove,
} from "../controllers/product.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, create);
router.get("/", authenticate, getAll);
router.get("/:id", authenticate, getById);
router.put("/:id", authenticate, update);
router.delete("/:id", authenticate, remove);

export default router;