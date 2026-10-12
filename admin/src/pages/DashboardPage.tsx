import React, { useEffect, useState } from 'react';
import {
  Users,
  Wrench,
  Calendar,
  DollarSign,
  Clock,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from '../config/api';
import { DashboardStats, Booking, User } from '../types';
import { StatCard } from '../components/common/StatCard';
import { DataTable, Column } from '../components/common/DataTable';
import { StatusBadge } from '../components/common/StatusBadge';
import { PageHeader } from '../components/common/PageHeader';

const chartData = [
  { day: 'Mon', revenue: 4200, bookings: 24 },
  { day: 'Tue', revenue: 5800, bookings: 32 },
  { day: 'Wed', revenue: 5100, bookings: 28 },
  { day: 'Thu', revenue: 7400, bookings: 42 },
  { day: 'Fri', revenue: 8900, bookings: 55 },
  { day: 'Sat', revenue: 11200, bookings: 68 },
  { day: 'Sun', revenue: 9400, bookings: 51 },
];

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 1248,
    totalMechanics: 84,
    activeBookings: 32,
    totalRevenue: 54200,
    pendingApprovals: 7,
    totalOrders: 156,
  });

  const [recentBookings, setRecentBookings] = useState<Booking[]>([
    {
      id: 'b-101',
      bookingNumber: 'BK-2026-001',
      userId: 'u-1',
      serviceName: 'Full Engine Diagnostic',
      amount: 150,
      status: 'CONFIRMED',
      date: '2026-10-12',
      createdAt: '2026-10-12T10:00:00Z',
    },
    {
      id: 'b-102',
      bookingNumber: 'BK-2026-002',
      userId: 'u-2',
      serviceName: 'Brake Pad Replacement',
      amount: 220,
      status: 'IN_PROGRESS',
      date: '2026-10-12',
      createdAt: '2026-10-12T11:30:00Z',
    },
    {
      id: 'b-103',
      bookingNumber: 'BK-2026-003',
      userId: 'u-3',
      serviceName: 'Oil & Filter Change',
      amount: 80,
      status: 'COMPLETED',
      date: '2026-10-11',
      createdAt: '2026-10-11T14:15:00Z',
    },
    {
      id: 'b-104',
      bookingNumber: 'BK-2026-004',
      userId: 'u-4',
      serviceName: 'AC Gas Refill',
      amount: 95,
      status: 'PENDING',
      date: '2026-10-12',
      createdAt: '2026-10-12T13:45:00Z',
    },
  ]);

  const [recentUsers, setRecentUsers] = useState<User[]>([
    {
      id: 'u-101',
      name: 'Michael Scott',
      email: 'michael@dundermifflin.com',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '2026-10-12',
    },
    {
      id: 'u-102',
      name: 'Dwight Schrute',
      email: 'dwight@schrutebeets.com',
      role: 'MECHANIC',
      status: 'ACTIVE',
      createdAt: '2026-10-11',
    },
    {
      id: 'u-103',
      name: 'Jim Halpert',
      email: 'jim@athlead.com',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '2026-10-10',
    },
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [dashRes, bookingsRes, usersRes] = await Promise.allSettled([
          api.get('/admin/dashboard'),
          api.get('/admin/bookings/recent'),
          api.get('/admin/users/recent'),
        ]);

        if (dashRes.status === 'fulfilled' && dashRes.value.data?.data) {
          setStats(dashRes.value.data.data);
        }
        if (bookingsRes.status === 'fulfilled' && bookingsRes.value.data?.data) {
          setRecentBookings(bookingsRes.value.data.data);
        }
        if (usersRes.status === 'fulfilled' && usersRes.value.data?.data) {
          setRecentUsers(usersRes.value.data.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const bookingColumns: Column<Booking>[] = [
    { header: 'Booking #', accessorKey: 'bookingNumber' },
    {
      header: 'Service',
      cell: (b) => <span className="font-medium text-gray-900">{b.serviceName || b.service?.name || 'General Service'}</span>,
    },
    {
      header: 'Amount',
      cell: (b) => <span className="font-semibold text-gray-900">${b.amount}</span>,
    },
    {
      header: 'Status',
      cell: (b) => <StatusBadge status={b.status} />,
    },
    {
      header: 'Date',
      accessorKey: 'date',
    },
  ];

  const userColumns: Column<User>[] = [
    {
      header: 'Name',
      cell: (u) => (
        <div>
          <p className="font-medium text-gray-900">{u.name}</p>
          <p className="text-xs text-gray-500">{u.email}</p>
        </div>
      ),
    },
    { header: 'Role', accessorKey: 'role' },
    {
      header: 'Status',
      cell: (u) => <StatusBadge status={u.status} />,
    },
    { header: 'Joined', accessorKey: 'createdAt' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operations Overview"
        description="Real-time key performance indicators and system monitoring"
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          label="Mechanics"
          value={stats.totalMechanics.toLocaleString()}
          icon={Wrench}
          color="purple"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          label="Active Bookings"
          value={stats.activeBookings}
          icon={Calendar}
          color="amber"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          label="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="emerald"
          trend={{ value: 18, isPositive: true }}
        />
        <StatCard
          label="Pending Approvals"
          value={stats.pendingApprovals}
          icon={Clock}
          color="rose"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="blue"
        />
      </div>

      {/* Revenue & Activity Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Weekly Performance Trend</h3>
            <p className="text-xs text-gray-500">Gross revenue vs total service requests</p>
          </div>
          <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <TrendingUp className="w-3.5 h-3.5 mr-1" />
            +18.4% this week
          </span>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '8px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">Recent Bookings</h3>
          </div>
          <DataTable
            columns={bookingColumns}
            data={recentBookings}
            isLoading={loading}
            emptyMessage="No recent bookings found"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">New Registrations</h3>
          </div>
          <DataTable
            columns={userColumns}
            data={recentUsers}
            isLoading={loading}
            emptyMessage="No newly registered users"
          />
        </div>
      </div>
    </div>
  );
};
