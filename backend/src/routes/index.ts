import { Router } from "express";
import healthRoutes from "./health.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import customerRoutes from "./customer.routes.js";
import productRoutes from "./product.routes.js";
import subscriptionRoutes from "./subscription.routes.js";
import paymentRoutes from "./payment.routes.js";
import paymentFailureRoutes from "./paymentFailure.routes.js";
import recoveryRoutes from "./recovery.routes.js";
import recoveryActionRoutes from "./recovery-action.routes.js";
import recoveryStrategyRoutes from "./recovery-strategy.routes.js";
import campaignRoutes from "./campaign.routes.js";
import campaignActionRoutes from "./campaign-action.routes.js";
import paymentAttemptRoutes from "./payment-attempt.routes.js";
import orderRoutes from "./order.routes.js";
import transactionRoutes from "./transaction.routes.js";
import subscriptionPaymentRoutes from "./subscription-payment.routes.js";
import checkoutSessionRoutes from "./checkout-session.routes.js";
import notificationRoutes from "./notification.routes.js";
import customerSegmentRoutes from "./customer-segment.routes.js";
import merchantSettingsRoutes from "./merchant-settings.routes.js";
import eventRoutes from "./event.routes.js";
import auditLogRoutes from "./audit-log.routes.js";
import recoveryFailureAnalysisRoutes from "./recovery-failure-analysis.routes.js";
import recoveryMonitoringRoutes from "./recovery-monitoring.routes.js";
import revenueAnalystRoutes from "./revenue-analyst.routes.js";
import explainabilityRoutes from "./explainability.routes.js";
import recoveryPipelineRoutes from "./recovery-pipeline.routes.js";
import customerCommunicationRoutes from "./customer-communication.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/customers", customerRoutes);
router.use("/products", productRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/payments", paymentRoutes);
router.use("/payment-failures", paymentFailureRoutes);
router.use("/recovery-cases", recoveryRoutes);
router.use("/recovery-actions", recoveryActionRoutes);
router.use("/recovery-strategies", recoveryStrategyRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/campaign-actions", campaignActionRoutes);
router.use("/payment-attempts", paymentAttemptRoutes);
router.use("/orders", orderRoutes);
router.use("/transactions", transactionRoutes);
router.use("/subscription-payments", subscriptionPaymentRoutes);
router.use("/checkout-sessions", checkoutSessionRoutes);
router.use("/notifications", notificationRoutes);
router.use("/customer-segments", customerSegmentRoutes);
router.use("/merchant-settings", merchantSettingsRoutes);
router.use("/events", eventRoutes);
router.use("/audit-logs", auditLogRoutes);
router.use(
    "/recovery-failure-analysis",
    recoveryFailureAnalysisRoutes
);
router.use(
    "/recovery-monitoring",
    recoveryMonitoringRoutes
);

router.use(
    "/revenue-analyst",
    revenueAnalystRoutes
);

router.use("/explainability", explainabilityRoutes);
router.use("/recovery-pipeline", recoveryPipelineRoutes);
router.use("/customer-communication", customerCommunicationRoutes);

export default router;