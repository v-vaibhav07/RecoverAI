// Exact enum values as defined in prisma/schema.prisma. Do not add/remove values.

export const BillingInterval = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] as const;
export type BillingInterval = (typeof BillingInterval)[number];

export const CampaignStatus = ["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"] as const;
export type CampaignStatus = (typeof CampaignStatus)[number];

export const CheckoutStatus = ["CREATED", "IN_PROGRESS", "COMPLETED", "ABANDONED", "EXPIRED"] as const;
export type CheckoutStatus = (typeof CheckoutStatus)[number];

export const ConfidenceLevel = ["LOW", "MEDIUM", "HIGH"] as const;
export type ConfidenceLevel = (typeof ConfidenceLevel)[number];

export const EventStatus = ["PENDING", "PROCESSED", "FAILED"] as const;
export type EventStatus = (typeof EventStatus)[number];

export const FailureCategory = [
  "INSUFFICIENT_FUNDS",
  "BANK_DECLINED",
  "EXPIRED_CARD",
  "INVALID_PAYMENT_METHOD",
  "NETWORK_FAILURE",
  "GATEWAY_TIMEOUT",
  "AUTHENTICATION_FAILURE",
  "FRAUD_SUSPECTED",
  "LIMIT_EXCEEDED",
  "UNKNOWN",
] as const;
export type FailureCategory = (typeof FailureCategory)[number];

export const FailureSeverity = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type FailureSeverity = (typeof FailureSeverity)[number];

export const NotificationChannel = ["EMAIL", "SMS", "WHATSAPP", "IN_APP"] as const;
export type NotificationChannel = (typeof NotificationChannel)[number];

export const NotificationStatus = ["PENDING", "SENT", "DELIVERED", "FAILED", "CANCELLED"] as const;
export type NotificationStatus = (typeof NotificationStatus)[number];

export const PaymentAttemptStatus = ["PENDING", "PROCESSING", "SUCCESS", "FAILED", "CANCELLED"] as const;
export type PaymentAttemptStatus = (typeof PaymentAttemptStatus)[number];

export const PaymentStatus = ["PENDING", "PROCESSING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"] as const;
export type PaymentStatus = (typeof PaymentStatus)[number];

export const RecordStatus = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
export type RecordStatus = (typeof RecordStatus)[number];

export const RecoveryActionStatus = [
  "PENDING",
  "SCHEDULED",
  "RUNNING",
  "SUCCESS",
  "FAILED",
  "CANCELLED",
  "SKIPPED",
] as const;
export type RecoveryActionStatus = (typeof RecoveryActionStatus)[number];

export const RecoveryPriority = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type RecoveryPriority = (typeof RecoveryPriority)[number];

export const RecoveryStatus = [
  "OPEN",
  "ANALYZING",
  "RECOVERABLE",
  "ACTION_SCHEDULED",
  "IN_PROGRESS",
  "RECOVERED",
  "PARTIALLY_RECOVERED",
  "FAILED",
  "CLOSED",
] as const;
export type RecoveryStatus = (typeof RecoveryStatus)[number];

export const StrategyType = [
  "AUTOMATIC_RETRY",
  "DELAYED_RETRY",
  "CUSTOMER_REMINDER",
  "PAYMENT_METHOD_UPDATE",
  "ALTERNATIVE_PAYMENT_METHOD",
  "HUMAN_ESCALATION",
  "STOP_RECOVERY",
] as const;
export type StrategyType = (typeof StrategyType)[number];

export const SubscriptionStatus = ["ACTIVE", "PAST_DUE", "PAUSED", "CANCELLED", "EXPIRED"] as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[number];

export const TransactionStatus = ["PENDING", "PROCESSING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"] as const;
export type TransactionStatus = (typeof TransactionStatus)[number];

export const TransactionType = ["PAYMENT", "REFUND", "ADJUSTMENT"] as const;
export type TransactionType = (typeof TransactionType)[number];

export const UserRole = ["ADMIN", "MERCHANT", "FINANCE", "OPERATIONS"] as const;
export type UserRole = (typeof UserRole)[number];
