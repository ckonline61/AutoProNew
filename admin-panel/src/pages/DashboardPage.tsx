import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Wrench, CalendarCheck, IndianRupee, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../api';

interface Stats {
  totalUsers: number; totalMechanics: number; totalBookings: number;
  totalRevenue: number; pendingBookings: number; completedBookings: number;
  cancelledBookings: number; activeEmergencies: number;
  revenueByDay?: { date: string; revenue: number }[];
  bookingsByStatus?: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B', CONFIRMED: '#3B82F6', IN_PROGRESS: '#8B5CF6',
  COMPLETED: '#10B981', CANCELLED: '#EF4444', REJECTED: '#6B7280',
};

const StatCard = ({ icon: Icon, label, value, color, sub }: any) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-1">{label}</p>
    {sub && <p className="text-xs text-green-600 font-medium mt-1">{sub}</p>}
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/bookings/recent?limit=8'),
      api.get('/admin/users/recent?limit=6'),
    ]).then(([statsRes, bookingsRes, usersRes]) => {
      setStats(statsRes.data?.data);
      setBookings(bookingsRes.data?.data || []);
      setUsers(usersRes.data?.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    </div>
  );

  const pieData = stats?.bookingsByStatus || [
    { status: 'COMPLETED', count: stats?.completedBookings || 0 },
    { status: 'PENDING', count: stats?.pendingBookings || 0 },
    { status: 'CANCELLED', count: stats?.cancelledBookings || 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Customers" value={stats?.totalUsers?.toLocaleString() || '0'} color="bg-blue-500" />
        <StatCard icon={Wrench} label="Total Mechanics" value={stats?.totalMechanics?.toLocaleString() || '0'} color="bg-purple-500" />
        <StatCard icon={CalendarCheck} label="Total Bookings" value={stats?.totalBookings?.toLocaleString() || '0'} color="bg-orange-500" />
        <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${((stats?.totalRevenue || 0) / 100).toLocaleString()}`} color="bg-green-500" sub="All time" />
        <StatCard icon={Clock} label="Pending" value={stats?.pendingBookings || 0} color="bg-yellow-500" />
        <StatCard icon={CheckCircle} label="Completed" value={stats?.completedBookings || 0} color="bg-emerald-500" />
        <StatCard icon={XCircle} label="Cancelled" value={stats?.cancelledBookings || 0} color="bg-red-500" />
        <StatCard icon={TrendingUp} label="Active SOS" value={stats?.activeEmergencies || 0} color="bg-red-700" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue (Last 7 Days)</h3>
          {stats?.revenueByDay && stats.revenueByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.revenueByDay}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No revenue data yet</div>
          )}
        </div>

        {/* Booking Status Pie */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Booking Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={70}>
                {pieData.map((entry: any, i: number) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.status] || '#9CA3AF'} />
                ))}
              </Pie>
              <Legend formatter={(v) => v} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Recent Bookings</h3>
          <a href="/bookings" className="text-sm text-red-600 hover:underline">View all</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['ID', 'Customer', 'Service', 'Status', 'Amount', 'Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">No bookings yet</td></tr>
              ) : bookings.map((b: any) => (
                <tr key={b._id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs text-gray-500">{b._id?.slice(-6).toUpperCase()}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{b.customerId?.name || '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{b.serviceId?.name || b.serviceName || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold`}
                      style={{ background: STATUS_COLORS[b.status] + '20', color: STATUS_COLORS[b.status] }}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-800">₹{((b.totalAmount || 0) / 100).toFixed(0)}</td>
                  <td className="px-5 py-3 text-gray-500">{b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
