import { Navigate, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./components/ui/Toast";
import { AppShell } from "./components/layout/AppShell";
import { AdminShell } from "./components/layout/AdminShell";
import { RequireAuth } from "./components/layout/RequireAuth";

import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { SignupPage } from "./pages/auth/SignupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AgentsPage } from "./pages/AgentsPage";
import { AgentDetailPage } from "./pages/AgentDetailPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { ConversationsPage } from "./pages/ConversationsPage";
import { KnowledgePage } from "./pages/KnowledgePage";
import { MemoryPage } from "./pages/MemoryPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SecurityPage } from "./pages/SecurityPage";
import { RequirementsPage } from "./pages/RequirementsPage";
import { SalesPage } from "./pages/SalesPage";
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
import { SettingsPage } from "./pages/SettingsPage";

import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminSubscriptionsPage } from "./pages/admin/AdminSubscriptionsPage";
import { AdminAuditLogsPage } from "./pages/admin/AdminAuditLogsPage";
import { AdminPlansPage } from "./pages/admin/AdminPlansPage";
import { AdminFeatureFlagsPage } from "./pages/admin/AdminFeatureFlagsPage";
import { AdminAgentsPage } from "./pages/admin/AdminAgentsPage";
import { AdminSystemHealthPage } from "./pages/admin/AdminSystemHealthPage";
import { AdminPaymentsPage } from "./pages/admin/AdminPaymentsPage";

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-valtier-bg text-center text-white font-sans">
      <p className="text-6xl font-bold text-valtier-accent">404</p>
      <p className="text-valtier-muted">This mission doesn't exist.</p>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* User workspace — requires a session */}
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/:agentId" element={<AgentDetailPage />} />
            <Route path="/missions" element={<WorkspacePage />} />
            <Route path="/workspace" element={<WorkspacePage />} />
            <Route path="/conversations" element={<ConversationsPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/memory" element={<MemoryPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/requirements" element={<RequirementsPage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Admin */}
          <Route element={<AdminShell />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
            <Route path="/admin/plans" element={<AdminPlansPage />} />
            <Route path="/admin/feature-flags" element={<AdminFeatureFlagsPage />} />
            <Route path="/admin/agents" element={<AdminAgentsPage />} />
            <Route path="/admin/system-health" element={<AdminSystemHealthPage />} />
            <Route path="/admin/payments" element={<AdminPaymentsPage />} />
          </Route>
        </Route>

        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </ToastProvider>
  );
}
