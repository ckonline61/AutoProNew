import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({ default: module.LoginPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const BookingsPage = lazy(() => import('./pages/BookingsPage').then(module => ({ default: module.BookingsPage })));
const MechanicsPage = lazy(() => import('./pages/MechanicsPage').then(module => ({ default: module.MechanicsPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then(module => ({ default: module.UsersPage })));
const PaymentsPage = lazy(() => import('./pages/PaymentsPage').then(module => ({ default: module.PaymentsPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(module => ({ default: module.ServicesPage })));
const SupportPage = lazy(() => import('./pages/SupportPage').then(module => ({ default: module.SupportPage })));
const FeatureFlagsPage = lazy(() => import('./pages/FeatureFlagsPage').then(module => ({ default: module.FeatureFlagsPage })));
const CmsPage = lazy(() => import('./pages/CmsPage').then(module => ({ default: module.CmsPage })));
const PlaceholderModulePage = lazy(() => import('./pages/PlaceholderModulePage').then(module => ({ default: module.PlaceholderModulePage })));
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
          <Suspense fallback={<div className="p-8 text-center" role="status">Loading page...</div>}><Routes>
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
          </Routes></Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
