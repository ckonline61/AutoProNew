import React, { useEffect, useState } from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import api from '../api';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B', ASSIGNED: '#3B82F6', IN_PROGRESS: '#8B5CF6', RESOLVED: '#10B981', CANCELLED: '#EF4444',
};

export default function SOSPage() {
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [eRes, mRes] = await Promise.all([
        api.get('/admin/resources/emergencies?limit=50'),
        api.get('/admin/resources/mechanics?limit=100'),
      ]);
      setEmergencies(eRes.data?.data || []);
      setMechanics(mRes.data?.data || []);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAssign = async () => {
    if (!assignModal || !selectedProvider) return;
    try {
      await api.put(`/admin/emergency/${assignModal}/assign`, { providerId: selectedProvider });
      setMsg('✅ Provider assigned!'); setAssignModal(null); load();
    } catch (e: any) { setMsg('❌ ' + (e.response?.data?.message || 'Error')); }
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Zap className="w-6 h-6 text-red-600" />SOS / Emergency</h1>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>

      {msg && <div className={`p-3 rounded-lg text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['ID','Customer','Type','Status','Location','Assigned To','Date','Action'].map(h =>
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={8} className="text-center py-12"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div></td></tr>
              : emergencies.length === 0 ? <tr><td colSpan={8} className="text-center py-10 text-gray-400">No SOS requests</td></tr>
              : emergencies.map(e => (
                <tr key={e._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{e._id?.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{e.customerId?.name || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{e.emergencyType || e.type || 'SOS'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ background: (STATUS_COLORS[e.status] || '#9CA3AF') + '22', color: STATUS_COLORS[e.status] || '#9CA3AF' }}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{e.location?.address || `${e.location?.coordinates?.[1]?.toFixed(4) || ''}°N`}</td>
                  <td className="px-4 py-3 text-gray-600">{e.providerId?.name || <span className="text-orange-500 text-xs">Unassigned</span>}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{e.createdAt ? new Date(e.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-3">
                    {e.status === 'PENDING' && (
                      <button onClick={() => { setAssignModal(e._id); setSelectedProvider(''); }}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 font-semibold">Assign</button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500">Total: {emergencies.length} emergencies</div>
      </div>

      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Assign Provider to SOS</h3>
            <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4">
              <option value="">-- Select Mechanic/Provider --</option>
              {mechanics.map(m => <option key={m._id} value={m._id}>{m.userId?.name || m.name || m._id} {m.isOnline ? '🟢' : '🔴'}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={handleAssign} disabled={!selectedProvider} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60">Assign</button>
              <button onClick={() => setAssignModal(null)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
