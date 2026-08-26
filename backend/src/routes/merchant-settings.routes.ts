import { Router } from "express";

import {
    create,
    get,
    update,
    remove,
} from "../controllers/merchant-settings.controller.js";

import {
    authenticate,
} from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", create);

router.get("/", get);

router.put("/", update);

router.delete("/", remove);

export default router;