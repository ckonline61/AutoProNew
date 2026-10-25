import React, { useEffect, useState, useCallback } from 'react';
import { Search, X, Wrench, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import api from '../api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B', CONFIRMED: '#3B82F6', IN_PROGRESS: '#8B5CF6',
  COMPLETED: '#10B981', CANCELLED: '#EF4444', REJECTED: '#6B7280',
};

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
  </div>
);

const Badge = ({ status }: { status: string }) => (
  <span
    className="px-2 py-1 rounded-full text-xs font-semibold"
    style={{ background: (STATUS_COLORS[status] || '#9CA3AF') + '20', color: STATUS_COLORS[status] || '#9CA3AF' }}
  >
    {status}
  </span>
);

interface Mechanic { _id: string; name: string; email: string; specializations?: string[]; }
interface Booking {
  _id: string; customerId?: { name: string }; serviceId?: { name: string };
  mechanicId?: { name: string }; status: string; totalAmount: number; createdAt: string;
  serviceName?: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 10;

  // Assign mechanic modal
  const [assignModal, setAssignModal] = useState<{ open: boolean; bookingId: string }>({ open: false, bookingId: '' });
  const [selectedMechanic, setSelectedMechanic] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Status modal
  const [statusModal, setStatusModal] = useState<{ open: boolean; bookingId: string; current: string }>({ open: false, bookingId: '', current: '' });
  const [newStatus, setNewStatus] = useState('CONFIRMED');
  const [reason, setReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/admin/resources/bookings', {
        params: { page, limit: PER_PAGE, status: statusFilter === 'ALL' ? undefined : statusFilter },
      });
      const data = res.data?.data;
      setBookings(Array.isArray(data) ? data : data?.bookings || data?.data || []);
      setTotal(res.data?.total || res.data?.data?.total || 0);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load bookings');
    } finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  useEffect(() => {
    api.get('/admin/resources/mechanics').then(r => {
      const d = r.data?.data;
      setMechanics(Array.isArray(d) ? d : d?.mechanics || []);
    }).catch(() => {});
  }, []);

  const filtered = bookings.filter(b => {
    if (!search) return true;
    return b._id?.toLowerCase().includes(search.toLowerCase()) ||
      b._id?.slice(-6).toLowerCase().includes(search.toLowerCase());
  });

  const handleAssign = async () => {
    if (!selectedMechanic) return;
    setAssigning(true);
    try {
      await api.put(`/admin/bookings/${assignModal.bookingId}/assign`, { mechanicId: selectedMechanic });
      setAssignModal({ open: false, bookingId: '' });
      setSelectedMechanic('');
      fetchBookings();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to assign mechanic');
    } finally { setAssigning(false); }
  };

  const handleStatusUpdate = async () => {
    setUpdatingStatus(true);
    try {
      await api.put(`/admin/bookings/${statusModal.bookingId}/status`, { status: newStatus, reason });
      setStatusModal({ open: false, bookingId: '', current: '' });
      setReason('');
      fetchBookings();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update status');
    } finally { setUpdatingStatus(false); }
  };

  const totalPages = Math.ceil(total / PER_PAGE) || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <button onClick={fetchBookings} className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search by booking ID..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <select
          value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? <Spinner /> : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['ID', 'Customer', 'Service', 'Mechanic', 'Status', 'Amount', 'Date', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-10 text-gray-400">No bookings found</td></tr>
                  ) : filtered.map(b => (
                    <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-gray-500">{b._id?.slice(-8).toUpperCase()}</td>
                      <td className="px-5 py-3 font-medium text-gray-800">{b.customerId?.name || '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{b.serviceId?.name || b.serviceName || '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{b.mechanicId?.name || <span className="text-gray-300">Unassigned</span>}</td>
                      <td className="px-5 py-3"><Badge status={b.status} /></td>
                      <td className="px-5 py-3 font-medium text-gray-800">₹{((b.totalAmount || 0) / 100).toFixed(0)}</td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setAssignModal({ open: true, bookingId: b._id }); setSelectedMechanic(''); }}
                            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <Wrench className="w-3 h-3" /> Assign
                          </button>
                          <button
                            onClick={() => { setStatusModal({ open: true, bookingId: b._id, current: b.status }); setNewStatus('CONFIRMED'); setReason(''); }}
                            className="px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors"
                          >
                            Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="p-1 rounded disabled:opacity-40 hover:bg-gray-100">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  className="p-1 rounded disabled:opacity-40 hover:bg-gray-100">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Assign Mechanic Modal */}
      {assignModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Assign Mechanic</h3>
              <button onClick={() => setAssignModal({ open: false, bookingId: '' })} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-3 max-h-80 overflow-y-auto">
              {mechanics.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No mechanics available</p>
              ) : mechanics.map(m => (
                <label key={m._id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedMechanic === m._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="mechanic" value={m._id} checked={selectedMechanic === m._id}
                    onChange={() => setSelectedMechanic(m._id)} className="accent-blue-600" />
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{m.name}</p>
                    <p className="text-xs text-gray-500">{m.email}</p>
                    {m.specializations?.length ? <p className="text-xs text-gray-400">{m.specializations.join(', ')}</p> : null}
                  </div>
                </label>
              ))}
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setAssignModal({ open: false, bookingId: '' })}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleAssign} disabled={!selectedMechanic || assigning}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Update Status</h3>
              <button onClick={() => setStatusModal({ open: false, bookingId: '', current: '' })} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                  {['CONFIRMED', 'CANCELLED', 'REJECTED'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                  placeholder="Enter reason..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setStatusModal({ open: false, bookingId: '', current: '' })}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleStatusUpdate} disabled={updatingStatus}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                {updatingStatus ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
