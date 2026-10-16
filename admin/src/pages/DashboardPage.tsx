import { useState, useEffect } from 'react';
import { isAxiosError } from 'axios';
import api from '../config/api';
import { PageHeader } from '../components/common/PageHeader';
import { RecordData, recordId } from '../modules/resource-types';
export const DashboardPage = () => {
  const [stats, setStats] = useState<RecordData>(); const [bookings, setBookings] = useState<RecordData[]>([]); const [users, setUsers] = useState<RecordData[]>([]);
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const load = async () => {
    setLoading(true); setError('');
    try { const [stats,bookings,users] = await Promise.all([api.get('/admin/dashboard'),api.get('/admin/bookings/recent'),api.get('/admin/users/recent')]); setStats(stats.data.data); setBookings(bookings.data.data); setUsers(users.data.data); }
    catch (error) { setError(isAxiosError(error) ? error.response?.data?.message || 'The API is unavailable.' : error instanceof Error ? error.message : 'Unable to load dashboard.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); },[]);
  const metrics = [['totalUsers','Users'],['totalMechanics','Mechanics'],['activeBookings','Active bookings'],['totalOrders','Orders'],['pendingMechanicApprovals','Pending mechanic approvals'],['totalRevenue','Collected revenue']] as const;
  return <div><PageHeader title="Operations Dashboard" description="Live counts and recent activity from the backend." /><button disabled={loading} onClick={() => void load()} className="mb-4 px-4 py-2 border rounded-lg bg-white">{loading ? 'Loading...' : 'Refresh'}</button>{!!error && <p role="alert" className="p-3 mb-4 bg-red-50 text-red-700 rounded-lg">{error}</p>}<div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{metrics.map(([key,label]) => <div key={key} className="p-5 bg-white rounded-xl border"><p className="text-sm text-gray-500">{label}</p><p className="text-2xl font-bold mt-2">{stats ? key === 'totalRevenue' ? new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(Number(stats[key] || 0)) : String(stats[key] ?? 0) : '—'}</p></div>)}</div><div className="grid lg:grid-cols-2 gap-6 mt-6"><section className="p-5 bg-white border rounded-xl"><h2 className="font-bold mb-3">Recent Bookings</h2>{!bookings.length && <p className="text-gray-500">No recent bookings.</p>}{bookings.map(booking => <div key={recordId(booking)} className="py-3 border-b flex justify-between gap-4"><span>{String(booking.bookingNumber || recordId(booking))}</span><span>{String(booking.status)}</span></div>)}</section><section className="p-5 bg-white border rounded-xl"><h2 className="font-bold mb-3">Recent Users</h2>{!users.length && <p className="text-gray-500">No recent users.</p>}{users.map(user => <div key={recordId(user)} className="py-3 border-b"><p>{String(user.name)}</p><p className="text-sm text-gray-500">{String(user.email)}</p></div>)}</section></div></div>;
};
