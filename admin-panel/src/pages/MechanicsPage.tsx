import React, { useEffect, useState } from 'react';
import { Wrench, Search, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import api from '../api';

export default function MechanicsPage() {
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/resources/mechanics?limit=100');
      setMechanics(res.data?.data || []);
    } catch { setMechanics([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !isActive });
      showMsg(`✅ Mechanic ${!isActive ? 'activated' : 'deactivated'}`); load();
    } catch (e: any) { showMsg('❌ ' + (e.response?.data?.message || 'Error')); }
  };

  const filtered = mechanics.filter(m => {
    const name = m.userId?.name || m.name || '';
    return !search || name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Wrench className="w-6 h-6 text-red-600" />Mechanics</h1>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>

      {msg && <div className={`p-3 rounded-lg text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search mechanic name..."
          className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Name','Email','Specializations','Rating','Online','Approved','Active','Actions'].map(h =>
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={8} className="text-center py-12"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div></td></tr>
              : filtered.length === 0 ? <tr><td colSpan={8} className="text-center py-10 text-gray-400">No mechanics found</td></tr>
              : filtered.map(m => {
                const user = m.userId || {};
                const isActive = user.isActive !== false;
                return (
                  <tr key={m._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{user.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{user.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[150px]">{(m.specializations || []).join(', ') || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-yellow-500 font-semibold">★ {m.rating?.toFixed(1) || '—'}</span>
                    </td>
                    <td className="px-4 py-3">{m.isOnline ? <span className="text-green-500 text-xs font-semibold">🟢 Online</span> : <span className="text-gray-400 text-xs">🔴 Offline</span>}</td>
                    <td className="px-4 py-3">{m.isApproved ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-orange-500" />}</td>
                    <td className="px-4 py-3">{isActive ? <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">Active</span> : <span className="text-xs text-red-600 font-semibold bg-red-50 px-2 py-1 rounded-full">Inactive</span>}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleStatus(user._id || m._id, isActive)}
                        className={`text-xs px-3 py-1 rounded-lg font-semibold ${isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                        {isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">Total: {filtered.length} mechanics</div>
      </div>
    </div>
  );
}
