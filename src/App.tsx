import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import Index from "./pages/Index";
import SubscribersPage from "./pages/SubscribersPage";
import SubscriberProfilePage from "./pages/SubscriberProfilePage";
import BillingPage from "./pages/BillingPage";
import PaymentsPage from "./pages/PaymentsPage";
import NetworkPage from "./pages/NetworkPage";
import SmartOLTPage from "./pages/SmartOLTPage";
import RadiusPage from "./pages/RadiusPage";
import IPAMPage from "./pages/IPAMPage";
import BandwidthProfilesPage from "./pages/BandwidthProfilesPage";
import TicketsPage from "./pages/TicketsPage";
import SettingsPage from "./pages/SettingsPage";
import CustomerPortalPage from "./pages/CustomerPortalPage";
import ServicePlansPage from "./pages/ServicePlansPage";
import NotificationTemplatesPage from "./pages/NotificationTemplatesPage";
import ReportsPage from "./pages/ReportsPage";
import ReconciliationPage from "./pages/ReconciliationPage";
import TenantAdminPage from "./pages/TenantAdminPage";
import OnboardingPage from "./pages/OnboardingPage";
import DatabaseSetupPage from "./pages/DatabaseSetupPage";
import NotFound from "./pages/NotFound";

// Super Admin Pages
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import TenantsPage from "./pages/super-admin/TenantsPage";
import UsersPage from "./pages/super-admin/UsersPage";
import AuditLogsPage from "./pages/super-admin/AuditLogsPage";
import PlatformSettingsPage from "./pages/super-admin/PlatformSettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/setup" element={<DatabaseSetupPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<ProtectedRoute skipOnboardingCheck><OnboardingPage /></ProtectedRoute>} />
            
            {/* Super Admin Routes */}
            <Route path="/super-admin" element={<ProtectedRoute requireSuperAdmin><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/super-admin/tenants" element={<ProtectedRoute requireSuperAdmin><TenantsPage /></ProtectedRoute>} />
            <Route path="/super-admin/users" element={<ProtectedRoute requireSuperAdmin><UsersPage /></ProtectedRoute>} />
            <Route path="/super-admin/audit" element={<ProtectedRoute requireSuperAdmin><AuditLogsPage /></ProtectedRoute>} />
            <Route path="/super-admin/settings" element={<ProtectedRoute requireSuperAdmin><PlatformSettingsPage /></ProtectedRoute>} />
            
            {/* Tenant Dashboard Routes */}
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/subscribers" element={<ProtectedRoute><SubscribersPage /></ProtectedRoute>} />
            <Route path="/subscribers/:id" element={<ProtectedRoute><SubscriberProfilePage /></ProtectedRoute>} />
            <Route path="/service-plans" element={<ProtectedRoute><ServicePlansPage /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
            <Route path="/reconciliation" element={<ProtectedRoute><ReconciliationPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationTemplatesPage /></ProtectedRoute>} />
            <Route path="/network" element={<ProtectedRoute><NetworkPage /></ProtectedRoute>} />
            <Route path="/network/smartolt" element={<ProtectedRoute><SmartOLTPage /></ProtectedRoute>} />
            <Route path="/network/radius" element={<ProtectedRoute><RadiusPage /></ProtectedRoute>} />
            <Route path="/network/ipam" element={<ProtectedRoute><IPAMPage /></ProtectedRoute>} />
            <Route path="/network/bandwidth" element={<ProtectedRoute><BandwidthProfilesPage /></ProtectedRoute>} />
            <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRoles={['admin', 'manager', 'super_admin']}><TenantAdminPage /></ProtectedRoute>} />
            <Route path="/portal" element={<ProtectedRoute><CustomerPortalPage /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
