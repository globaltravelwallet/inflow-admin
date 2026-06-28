import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import DashboardLayout from "@/app/dashboard/layout";
import LoginPage from "@/app/login/page";

import DashboardHome from "@/app/dashboard/page";
import OrganizationsPage from "@/app/dashboard/organizations/page";
import OrganizationDetailPage from "@/app/dashboard/organizations/[id]/page";
import TransactionsPage from "@/app/dashboard/transactions/page";
import TransactionDetailPage from "@/app/dashboard/transactions/[id]/page";
import PaymentsPage from "@/app/dashboard/payments/page";
import PaymentDetailPage from "@/app/dashboard/payments/[id]/page";
import PayoutsPage from "@/app/dashboard/payouts/page";
import PayoutDetailPage from "@/app/dashboard/payouts/[id]/page";
import KycPage from "@/app/dashboard/kyc/page";
import KycDetailPage from "@/app/dashboard/kyc/[id]/page";
import NotificationsPage from "@/app/dashboard/notifications/page";
import NotificationDetailPage from "@/app/dashboard/notifications/[id]/page";
import LogsPage from "@/app/dashboard/logs/page";
import LogDetailPage from "@/app/dashboard/logs/[id]/page";
import WebhooksPage from "@/app/dashboard/webhooks/page";
import WebhookDetailPage from "@/app/dashboard/webhooks/[id]/page";

// Mirrors the old middleware.ts session gate. The `inflow_session` cookie is
// set on login and cleared on logout / 401.
function hasSession(): boolean {
  return document.cookie
    .split("; ")
    .some((c) => c.startsWith("inflow_session="));
}

function RequireAuth() {
  return hasSession() ? <Outlet /> : <Navigate to="/login" replace />;
}

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  return hasSession() ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

function RootRedirect() {
  return <Navigate to={hasSession() ? "/dashboard" : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route
        path="/login"
        element={
          <RedirectIfAuth>
            <LoginPage />
          </RedirectIfAuth>
        }
      />

      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />

          <Route path="organizations" element={<OrganizationsPage />} />
          <Route path="organizations/:id" element={<OrganizationDetailPage />} />

          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="transactions/:id" element={<TransactionDetailPage />} />

          <Route path="payments" element={<PaymentsPage />} />
          <Route path="payments/:id" element={<PaymentDetailPage />} />

          <Route path="payouts" element={<PayoutsPage />} />
          <Route path="payouts/:id" element={<PayoutDetailPage />} />

          <Route path="kyc" element={<KycPage />} />
          <Route path="kyc/:id" element={<KycDetailPage />} />

          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="notifications/:id" element={<NotificationDetailPage />} />

          <Route path="logs" element={<LogsPage />} />
          <Route path="logs/:id" element={<LogDetailPage />} />

          <Route path="webhooks" element={<WebhooksPage />} />
          <Route path="webhooks/:id" element={<WebhookDetailPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
