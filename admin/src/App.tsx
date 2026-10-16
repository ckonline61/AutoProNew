import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { adminModules } from './modules/admin-modules';
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({default: module.LoginPage})));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({default: module.DashboardPage})));
const ResourceModulePage = lazy(() => import('./pages/ResourceModulePage').then(module => ({default: module.ResourceModulePage})));
const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus:false,retry:1 } } });
export default function App() {
  return <QueryClientProvider client={queryClient}><AuthProvider><BrowserRouter><Suspense fallback={<div className="p-8 text-center" role="status">Loading page...</div>}><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
      <Route index element={<Navigate to="/dashboard" replace />} /><Route path="dashboard" element={<DashboardPage />} />
      {Object.entries(adminModules).map(([path,spec]) => <Route key={path} path={path} element={<ResourceModulePage spec={spec} />} />)}
    </Route><Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></Suspense></BrowserRouter></AuthProvider></QueryClientProvider>;
}
