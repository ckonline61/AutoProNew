import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Wrench,
  CreditCard,
  Layers,
  Package,
  ShoppingCart,
  Car,
  FileCheck,
  Star,
  Ticket,
  LifeBuoy,
  FileText,
  Settings,
  Flag,
  ShieldCheck,
  Menu,
  ChevronLeft,
  LogOut,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
}

const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: 'Core Operations',
    items: [
      { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      { name: 'Users', to: '/users', icon: Users },
      { name: 'Bookings', to: '/bookings', icon: Calendar },
      { name: 'Mechanics', to: '/mechanics', icon: Wrench },
      { name: 'Payments', to: '/payments', icon: CreditCard },
      { name: 'Services', to: '/services', icon: Layers },
    ],
  },
  {
    title: 'Commerce & Marketplace',
    items: [
      { name: 'Spare Parts', to: '/spare-parts', icon: Package },
      { name: 'Orders', to: '/orders', icon: ShoppingCart },
      { name: 'Used Cars', to: '/used-cars', icon: Car },
      { name: 'Inspections', to: '/inspections', icon: FileCheck },
    ],
  },
  {
    title: 'Customer & Growth',
    items: [
      { name: 'Reviews', to: '/reviews', icon: Star },
      { name: 'Coupons', to: '/coupons', icon: Ticket },
      { name: 'Support', to: '/support', icon: LifeBuoy },
    ],
  },
  {
    title: 'System & Admin',
    items: [
      { name: 'CMS', to: '/cms', icon: FileText },
      { name: 'Config', to: '/config', icon: Settings },
      { name: 'Feature Flags', to: '/feature-flags', icon: Flag },
      { name: 'Audit Logs', to: '/audit-logs', icon: ShieldCheck },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-slate-900 text-slate-200 transition-all duration-300 ease-in-out flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-800">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                🚗
              </div>
              <span className="font-bold text-lg tracking-wide text-white">Auto Pro Admin</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
              AP
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors hidden lg:block"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {navSections.map((section, sIndex) => (
            <div key={sIndex} className="space-y-1">
              {!collapsed && (
                <h4 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h4>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      } ${collapsed ? 'justify-center' : 'justify-start'}`
                    }
                    title={collapsed ? item.name : undefined}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${collapsed ? '' : 'mr-3'}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer User info */}
        <div className="border-t border-slate-800 p-3">
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3 px-2 py-1'}`}>
            <UserCircle className="w-8 h-8 text-slate-400 shrink-0" />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@autopro.com'}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-xs">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-500 hover:text-gray-700 lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-sm font-medium text-gray-500">Auto Pro Platform &bull; Operations</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <span className="text-sm font-medium text-gray-900 block">
                {user?.name || 'Super Admin'}
              </span>
              <span className="text-xs text-gray-500 block">{user?.role || 'ADMIN'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Development preview: some modules use sample data and local-only changes. Verify API integration before operating on real records.</p>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
