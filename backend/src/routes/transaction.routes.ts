import { Router } from "express";

import {
    create,
    list,
    getById,
    update,
    remove,
} from "../controllers/transaction.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", create);

router.get("/", list);

router.get("/:id", getById);

router.patch("/:id", update);

router.delete("/:id", remove);

export default router;