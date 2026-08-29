import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RecoverLoader from "../components/ui/RecoverLoader";

import AuthLayout from "../components/layout/AuthLayout";
import DashboardLayout from "../components/layout/DashboardLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";

import CustomersListPage from "../pages/customers/CustomersListPage";
import CustomerDetailPage from "../pages/customers/CustomerDetailPage";

import ProductsListPage from "../pages/products/ProductsListPage";

import PaymentsLayout from "../pages/payments/PaymentsLayout";
import PaymentsListPage from "../pages/payments/PaymentsListPage";
import PaymentFailuresListPage from "../pages/payments/PaymentFailuresListPage";
import PaymentAttemptsListPage from "../pages/payments/PaymentAttemptsListPage";

import RecoveryLayout from "../pages/recovery/RecoveryLayout";
import RecoveryCasesListPage from "../pages/recovery/RecoveryCasesListPage";
import RecoveryCaseDetailPage from "../pages/recovery/RecoveryCaseDetailPage";
import RecoveryStrategiesListPage from "../pages/recovery/RecoveryStrategiesListPage";
import RecoveryActionsListPage from "../pages/recovery/RecoveryActionsListPage";

import CampaignsListPage from "../pages/campaigns/CampaignsListPage";
import CampaignDetailPage from "../pages/campaigns/CampaignDetailPage";

import OrdersListPage from "../pages/orders/OrdersListPage";
import TransactionsListPage from "../pages/transactions/TransactionsListPage";

import SubscriptionsListPage from "../pages/subscriptions/SubscriptionsListPage";
import SubscriptionPaymentsListPage from "../pages/subscriptions/SubscriptionPaymentsListPage";

import CheckoutSessionsListPage from "../pages/checkout/CheckoutSessionsListPage";
import NotificationsListPage from "../pages/notifications/NotificationsListPage";
import CustomerSegmentsListPage from "../pages/segments/CustomerSegmentsListPage";
import SettingsPage from "../pages/settings/SettingsPage";
import EventsListPage from "../pages/events/EventsListPage";
import AuditLogsListPage from "../pages/audit/AuditLogsListPage";

import AIHubPage from "../pages/ai/AIHubPage";
import RecoveryMonitoringPage from "../pages/ai/RecoveryMonitoringPage";
import RevenueAnalystPage from "../pages/ai/RevenueAnalystPage";
import ExplainabilityPage from "../pages/ai/ExplainabilityPage";
import RecoveryPipelineBatchPage from "../pages/ai/RecoveryPipelineBatchPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function AppRoutes() {
  const { isLoading } = useAuth();
  if (isLoading) return <RecoverLoader variant="page" size="md" />;

  return (
    <Routes>
      <Route element={<PublicOnlyRoute><AuthLayout /></PublicOnlyRoute>}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/customers" element={<CustomersListPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />

        <Route path="/products" element={<ProductsListPage />} />

        <Route path="/payments" element={<PaymentsLayout />}>
          <Route index element={<PaymentsListPage />} />
          <Route path="failures" element={<PaymentFailuresListPage />} />
          <Route path="attempts" element={<PaymentAttemptsListPage />} />
        </Route>

        <Route path="/recovery" element={<RecoveryLayout />}>
          <Route index element={<RecoveryCasesListPage />} />
          <Route path="strategies" element={<RecoveryStrategiesListPage />} />
          <Route path="actions" element={<RecoveryActionsListPage />} />
        </Route>
        <Route path="/recovery/cases/:id" element={<RecoveryCaseDetailPage />} />

        <Route path="/campaigns" element={<CampaignsListPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />

        <Route path="/orders" element={<OrdersListPage />} />
        <Route path="/transactions" element={<TransactionsListPage />} />

        <Route path="/subscriptions" element={<SubscriptionsListPage />} />
        <Route path="/subscription-payments" element={<SubscriptionPaymentsListPage />} />

        <Route path="/checkout-sessions" element={<CheckoutSessionsListPage />} />
        <Route path="/notifications" element={<NotificationsListPage />} />
        <Route path="/customer-segments" element={<CustomerSegmentsListPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/audit-logs" element={<AuditLogsListPage />} />

        <Route path="/ai" element={<AIHubPage />} />
        <Route path="/ai/monitoring" element={<RecoveryMonitoringPage />} />
        <Route path="/ai/revenue" element={<RevenueAnalystPage />} />
        <Route path="/ai/explainability" element={<ExplainabilityPage />} />
        <Route path="/ai/pipeline" element={<RecoveryPipelineBatchPage />} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
