// Types mirror the exact snake_case field names returned by the backend
// (Prisma models serialized directly to JSON). Money fields are Decimal ->
// serialized as strings. Do not rename fields to camelCase here.

import {
  BillingInterval,
  CampaignStatus,
  CheckoutStatus,
  ConfidenceLevel,
  EventStatus,
  FailureCategory,
  FailureSeverity,
  NotificationChannel,
  NotificationStatus,
  PaymentAttemptStatus,
  PaymentStatus,
  RecordStatus,
  RecoveryActionStatus,
  RecoveryPriority,
  RecoveryStatus,
  StrategyType,
  SubscriptionStatus,
  TransactionStatus,
  TransactionType,
  UserRole,
} from "./enums";

export type UUID = string;
export type ISODate = string;
export type DecimalString = string;

export interface Merchant {
  id: UUID;
  business_name: string;
  legal_name: string | null;
  email: string;
  country: string;
  currency: string;
  timezone: string;
  status: RecordStatus;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface Profile {
  id: UUID;
  merchant_id: UUID;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  status: RecordStatus;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, any>;
  [key: string]: any;
}

export interface Customer {
  id: UUID;
  merchant_id: UUID;
  external_customer_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  lifetime_value: DecimalString;
  total_transactions: number;
  successful_payments: number;
  failed_payments: number;
  recovered_payments: number;
  total_recovered_amount: DecimalString;
  status: RecordStatus;
  metadata: Record<string, any>;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface Product {
  id: UUID;
  merchant_id: UUID;
  name: string;
  description: string | null;
  price: DecimalString;
  currency: string;
  status: RecordStatus;
  metadata: Record<string, any>;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface Subscription {
  id: UUID;
  merchant_id: UUID;
  customer_id: UUID;
  product_id: UUID | null;
  external_subscription_id: string | null;
  plan_name: string | null;
  amount: DecimalString;
  currency: string;
  billing_interval: BillingInterval;
  status: SubscriptionStatus;
  start_date: ISODate;
  current_period_start: ISODate | null;
  current_period_end: ISODate | null;
  cancelled_at: ISODate | null;
  metadata: Record<string, any>;
  created_at: ISODate;
  updated_at: ISODate;
  customers?: Customer;
  products?: Product | null;
}

export interface Payment {
  id: UUID;
  merchant_id: UUID;
  customer_id: UUID | null;
  transaction_id: UUID | null;
  payment_method_id: UUID | null;
  amount: DecimalString;
  currency: string;
  provider: string | null;
  provider_payment_id: string | null;
  status: PaymentStatus;
  failure_code: string | null;
  failure_message: string | null;
  metadata: Record<string, any>;
  created_at: ISODate;
  updated_at: ISODate;
  customers?: Customer | null;
}

export interface PaymentFailure {
  id: UUID;
  payment_id: UUID;
  payment_attempt_id: UUID | null;
  merchant_id: UUID;
  failure_code: string | null;
  failure_category: FailureCategory;
  failure_reason: string | null;
  retryable: boolean;
  severity: FailureSeverity;
  provider: string | null;
  metadata: Record<string, any>;
  created_at: ISODate;
}

export interface PaymentAttempt {
  id: UUID;
  payment_id: UUID;
  attempt_number: number;
  amount: DecimalString;
  payment_method_id: UUID | null;
  provider: string | null;
  status: PaymentAttemptStatus;
  failure_code: string | null;
  failure_category: FailureCategory | null;
  provider_response: Record<string, any> | null;
  started_at: ISODate;
  completed_at: ISODate | null;
  created_at: ISODate;
}

export interface AIPrediction {
  id: UUID;
  merchant_id: UUID;
  recovery_case_id: UUID;
  model_provider: string | null;
  model_name: string | null;
  model_version: string | null;
  recovery_score: DecimalString | null;
  recovery_probability: DecimalString | null;
  expected_recovery_amount: DecimalString;
  confidence: ConfidenceLevel;
  prediction_reasons: any[];
  input_snapshot: Record<string, any>;
  created_at: ISODate;
}

export interface AIDecision {
  id: UUID;
  merchant_id: UUID;
  recovery_case_id: UUID;
  prediction_id: UUID | null;
  agent_name: string;
  decision_type: string;
  recommended_action: StrategyType | null;
  reasoning_summary: string | null;
  confidence: ConfidenceLevel;
  structured_decision: Record<string, any>;
  created_at: ISODate;
}

export interface RecoveryAction {
  id: UUID;
  merchant_id: UUID;
  recovery_case_id: UUID;
  strategy_id: UUID | null;
  action_type: StrategyType;
  status: RecoveryActionStatus;
  attempt_number: number;
  scheduled_at: ISODate | null;
  started_at: ISODate | null;
  completed_at: ISODate | null;
  result: string | null;
  error: string | null;
  metadata: Record<string, any>;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface RecoveryCase {
  id: UUID;
  merchant_id: UUID;
  customer_id: UUID | null;
  payment_id: UUID | null;
  subscription_payment_id: UUID | null;
  checkout_session_id: UUID | null;
  original_amount: DecimalString;
  recoverable_amount: DecimalString;
  recovered_amount: DecimalString;
  recovery_score: DecimalString | null;
  recovery_probability: DecimalString | null;
  expected_recovery_amount: DecimalString;
  status: RecoveryStatus;
  priority: RecoveryPriority;
  created_at: ISODate;
  updated_at: ISODate;
  closed_at: ISODate | null;
  customers?: Customer | null;
  payments?: Payment | null;
  recovery_actions?: RecoveryAction[];
  ai_decisions?: AIDecision[];
  ai_predictions?: AIPrediction[];
}

export interface RecoveryStrategy {
  id: UUID;
  merchant_id: UUID | null;
  name: string;
  type: StrategyType;
  description: string | null;
  configuration: Record<string, any>;
  is_active: boolean;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface Campaign {
  id: UUID;
  merchant_id: UUID;
  name: string;
  description: string | null;
  status: CampaignStatus;
  target_criteria: Record<string, any>;
  strategy_id: UUID | null;
  start_date: ISODate | null;
  end_date: ISODate | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface CampaignAction {
  id: UUID;
  campaign_id: UUID;
  recovery_case_id: UUID | null;
  action: string;
  status: RecoveryActionStatus;
  result: string | null;
  created_at: ISODate;
}

export interface Order {
  id: UUID;
  merchant_id: UUID;
  customer_id: UUID;
  order_number: string;
  total_amount: DecimalString;
  currency: string;
  status: string;
  metadata: Record<string, any>;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface Transaction {
  id: UUID;
  merchant_id: UUID;
  customer_id: UUID | null;
  order_id: UUID | null;
  external_transaction_id: string | null;
  amount: DecimalString;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  metadata: Record<string, any>;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface SubscriptionPayment {
  id: UUID;
  subscription_id: UUID;
  payment_id: UUID | null;
  billing_period: string;
  amount: DecimalString;
  currency: string;
  status: PaymentStatus;
  due_date: ISODate;
  paid_at: ISODate | null;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface CheckoutSession {
  id: UUID;
  merchant_id: UUID;
  customer_id: UUID | null;
  order_id: UUID | null;
  amount: DecimalString;
  currency: string;
  status: CheckoutStatus;
  started_at: ISODate;
  last_activity_at: ISODate | null;
  completed_at: ISODate | null;
  abandoned_at: ISODate | null;
  expires_at: ISODate | null;
  metadata: Record<string, any>;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface Notification {
  id: UUID;
  merchant_id: UUID;
  customer_id: UUID | null;
  recovery_case_id: UUID | null;
  channel: NotificationChannel;
  template: string | null;
  recipient: string | null;
  subject: string | null;
  content: string | null;
  status: NotificationStatus;
  sent_at: ISODate | null;
  delivered_at: ISODate | null;
  failed_at: ISODate | null;
  provider_id: string | null;
  metadata: Record<string, any>;
  created_at: ISODate;
}

export interface CustomerSegment {
  id: UUID;
  merchant_id: UUID;
  name: string;
  description: string | null;
  criteria: Record<string, any>;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface MerchantSettings {
  id: UUID;
  merchant_id: UUID;
  recovery_enabled: boolean;
  ai_enabled: boolean;
  max_retry_attempts: number;
  default_retry_delay_minutes: number;
  notification_enabled: boolean;
  settings: Record<string, any>;
  created_at: ISODate;
  updated_at: ISODate;
}

export interface EventRecord {
  id: UUID;
  merchant_id: UUID | null;
  event_type: string;
  aggregate_type: string | null;
  aggregate_id: UUID | null;
  payload: Record<string, any>;
  status: EventStatus;
  processed: boolean;
  processed_at: ISODate | null;
  error: string | null;
  created_at: ISODate;
}

export interface AuditLog {
  id: UUID;
  merchant_id: UUID | null;
  user_id: UUID | null;
  action: string;
  entity_type: string | null;
  entity_id: UUID | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: ISODate;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MonitoringIssue {
  type: "STUCK_ACTION" | "REPEATED_FAILURE" | "NO_ACTION" | "PENDING_AFTER_RECOVERY" | "CASE_STUCK" | "HEALTHY";
  severity: "LOW" | "MEDIUM" | "HIGH";
  recoveryCaseId?: string;
  actionId?: string;
  message: string;
  recommendation: string;
}

export interface RecoveryMonitoringResult {
  merchantId: UUID;
  monitoredAt: ISODate;
  totalCases: number;
  activeCases: number;
  recoveredCases: number;
  closedCases: number;
  scheduledActions: number;
  runningActions: number;
  successfulActions: number;
  failedActions: number;
  issues: MonitoringIssue[];
  health: "HEALTHY" | "WARNING" | "CRITICAL";
}

export interface RevenueAnalysisResult {
  merchantId: UUID;
  analyzedAt: ISODate;
  totalCases: number;
  activeCases: number;
  recoveredCases: number;
  closedCases: number;
  totalOriginalAmount: number;
  totalRecoverableAmount: number;
  totalRecoveredAmount: number;
  totalLostAmount: number;
  recoveryRate: number;
  totalActions: number;
  successfulActions: number;
  failedActions: number;
  actionSuccessRate: number;
  averageRecoveryAmount: number;
  revenueImpact: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  insights: string[];
  recommendations: string[];
}

export interface FailureAnalysisResult {
  failureCategory: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  recoverability: number;
  reason: string;
  recommendedApproach: string;
}

export interface ExplainabilityResult {
  summary: string;
  decisionExplanation: string;
  predictionExplanation: string;
  factors: string[];
  risks: string[];
  recommendation: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
}

export interface CustomerCommunicationResult {
  channel: "EMAIL" | "SMS" | "WHATSAPP";
  subject: string;
  message: string;
  reason: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
}

export interface RecoveryPipelineExecutionResult {
  success: boolean;
  status: string;
  recoveredAmount: number;
  failureCode?: string | null;
  failureMessage?: string | null;
  message: string;
}

export interface RecoveryPipelineRunResult {
  recoveryCaseId: string;
  prediction: {
    id: string;
    recoveryScore: number | null;
    recoveryProbability: number | null;
    expectedRecoveryAmount: string;
    confidence: string;
  };
  decision: {
    id: string;
    recommendedAction: string | null;
    reasoningSummary: string | null;
    confidence: string;
  };
  action: {
    id: string;
    actionType: string;
    status: string;
  };
  execution: RecoveryPipelineExecutionResult;
}

export interface RecoveryPipelineBatchResult {
  totalCases: number;
  succeeded: number;
  failed: number;
  totalRecoveredAmount: number;
  results: Array<
    | { recoveryCaseId: string; success: true; result: RecoveryPipelineRunResult }
    | { recoveryCaseId: string; success: false; error: string }
  >;
}
