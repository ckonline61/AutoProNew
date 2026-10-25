import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Wrench, CalendarCheck, Zap,
  CreditCard, Tag, Bell, Settings, LogOut, Menu, X, Shield
} from 'lucide-react';

const NAV = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/bookings', icon: CalendarCheck, label: 'Bookings' },
  { path: '/users', icon: Users, label: 'Customers' },
  { path: '/mechanics', icon: Wrench, label: 'Mechanics' },
  { path: '/sos', icon: Zap, label: 'SOS / Emergency' },
  { path: '/payments', icon: CreditCard, label: 'Payments' },
  { path: '/coupons', icon: Tag, label: 'Coupons' },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white flex flex-col transition-all duration-200 shrink-0`}>
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-lg">Auto Pro</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg mb-1 transition
                ${pathname === path ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-700 p-4">
          {sidebarOpen && (
            <div className="mb-3">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm w-full"
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(o => !o)} className="text-gray-600 hover:text-gray-900">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="font-semibold text-gray-800">
            {NAV.find(n => n.path === pathname)?.label || 'Admin Panel'}
          </h2>
          <div className="ml-auto text-sm text-gray-500">
            Welcome, <span className="font-semibold text-gray-800">{user?.name}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
