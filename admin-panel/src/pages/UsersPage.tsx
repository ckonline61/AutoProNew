import React, { useEffect, useState, useCallback } from 'react';
import { Search, UserCheck, UserX, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import api from '../api';

interface User {
  _id: string; name: string; email: string; phone?: string;
  isActive: boolean; createdAt: string; role: string;
}

const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
  </div>
);

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [togglingId, setTogglingId] = useState('');
  const PER_PAGE = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await api.get('/admin/resources/users', {
        params: { page, limit: PER_PAGE, role: 'customer' },
      });
      const d = res.data?.data;
      setUsers(Array.isArray(d) ? d : d?.users || d?.data || []);
      setTotal(res.data?.total || d?.total || 0);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load users');
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleStatus = async (u: User) => {
    setTogglingId(u._id);
    try {
      await api.put(`/admin/users/${u._id}/status`, { isActive: !u.isActive });
      setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isActive: !u.isActive } : x));
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to update status');
    } finally { setTogglingId(''); }
  };

  const filtered = users.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const totalPages = Math.ceil(total / PER_PAGE) || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button onClick={fetchUsers} className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
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
                    {['Name', 'Email', 'Phone', 'Status', 'Registered', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">No customers found</td></tr>
                  ) : filtered.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800">{u.name || '—'}</td>
                      <td className="px-5 py-3 text-gray-600">{u.email}</td>
                      <td className="px-5 py-3 text-gray-600">{u.phone || '—'}</td>
                      <td className="px-5 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-semibold"
                          style={{
                            background: u.isActive ? '#10B98120' : '#EF444420',
                            color: u.isActive ? '#10B981' : '#EF4444'
                          }}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={togglingId === u._id}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${u.isActive
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        >
                          {u.isActive ? <><UserX className="w-3 h-3" /> Deactivate</> : <><UserCheck className="w-3 h-3" /> Activate</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
              <span>Showing {filtered.length} of {total} customers</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="p-1 rounded disabled:opacity-40 hover:bg-gray-100">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2">Page {page} of {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                  className="p-1 rounded disabled:opacity-40 hover:bg-gray-100">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
