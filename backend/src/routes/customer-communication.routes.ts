import { Router } from "express";

import {
    generateCommunication,
} from "../controllers/customer-communication.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Generates a personalized, channel-appropriate (EMAIL/SMS/WHATSAPP) message
// for the customer on a recovery case, using the case, customer, payment,
// latest AI prediction/decision, and prior recovery actions as context.
// Persists the generated message as an ai_decisions row
// (decision_type: CUSTOMER_COMMUNICATION) for audit purposes.
router.post(
    "/:recoveryCaseId",
    authenticate,
    generateCommunication
);

export default router;
