import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BookingsPage } from './pages/BookingsPage';
import { MechanicsPage } from './pages/MechanicsPage';
import { UsersPage } from './pages/UsersPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ServicesPage } from './pages/ServicesPage';
import { SupportPage } from './pages/SupportPage';
import { FeatureFlagsPage } from './pages/FeatureFlagsPage';
import { CmsPage } from './pages/CmsPage';
import { PlaceholderModulePage } from './pages/PlaceholderModulePage';
import { Package, ShoppingCart, Car, FileCheck, Star, Ticket, Settings, ShieldCheck } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="mechanics" element={<MechanicsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="feature-flags" element={<FeatureFlagsPage />} />
              <Route path="cms" element={<CmsPage />} />

              {/* Extended modules in sidebar */}
              <Route
                path="spare-parts"
                element={
                  <PlaceholderModulePage
                    title="Spare Parts Inventory"
                    description="Inventory tracking, OEM catalogue, and supplier procurement management"
                    icon={Package}
                  />
                }
              />
              <Route
                path="orders"
                element={
                  <PlaceholderModulePage
                    title="E-Commerce Orders"
                    description="Part purchasing order tracking, fulfillment, and customer delivery updates"
                    icon={ShoppingCart}
                  />
                }
              />
              <Route
                path="used-cars"
                element={
                  <PlaceholderModulePage
                    title="Used Cars Marketplace"
                    description="Marketplace vehicle listings, valuation checks, and seller approval pipelines"
                    icon={Car}
                  />
                }
              />
              <Route
                path="inspections"
                element={
                  <PlaceholderModulePage
                    title="Vehicle Inspections"
                    description="Standardized multi-point checkup reports and vehicle fitness certification"
                    icon={FileCheck}
                  />
                }
              />
              <Route
                path="reviews"
                element={
                  <PlaceholderModulePage
                    title="Ratings & Reviews"
                    description="Customer feedback, ratings moderation, and technician performance monitoring"
                    icon={Star}
                  />
                }
              />
              <Route
                path="coupons"
                element={
                  <PlaceholderModulePage
                    title="Promotions & Coupons"
                    description="Discount codes, promotional campaigns, and customer referral programs"
                    icon={Ticket}
                  />
                }
              />
              <Route
                path="config"
                element={
                  <PlaceholderModulePage
                    title="Platform Configuration"
                    description="Global system settings, currency variables, and regional service parameters"
                    icon={Settings}
                  />
                }
              />
              <Route
                path="audit-logs"
                element={
                  <PlaceholderModulePage
                    title="System Audit Logs"
                    description="Security traceability, privileged role actions, and immutable compliance logs"
                    icon={ShieldCheck}
                  />
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
