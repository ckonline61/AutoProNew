import React, { useEffect, useState } from 'react';
import { CreditCard, RefreshCw, IndianRupee } from 'lucide-react';
import api from '../api';

const STATUS_COLORS: Record<string, string> = { PAID: '#10B981', PENDING: '#F59E0B', FAILED: '#EF4444', REFUNDED: '#6B7280' };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/resources/payments?limit=100');
      const data: any[] = res.data?.data || [];
      setPayments(data);
      const total = data.filter(p => p.status === 'PAID' || p.status === 'COMPLETED').reduce((sum, p) => sum + (p.amount || 0), 0);
      setTotalRevenue(total);
    } catch { setPayments([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><CreditCard className="w-6 h-6 text-red-600" />Payments</h1>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><RefreshCw className="w-4 h-4" />Refresh</button>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center"><IndianRupee className="w-5 h-5 text-white" /></div>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{(totalRevenue / 100).toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-500 mt-1">Total Revenue (Paid)</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Transactions</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-2xl font-bold text-green-600">{payments.filter(p => p.status === 'PAID' || p.status === 'COMPLETED').length}</p>
          <p className="text-sm text-gray-500 mt-1">Successful Payments</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['ID','Customer','Amount','Method','Status','Razorpay ID','Date'].map(h =>
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={7} className="text-center py-12"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div></td></tr>
              : payments.length === 0 ? <tr><td colSpan={7} className="text-center py-10 text-gray-400">No payments yet</td></tr>
              : payments.map(p => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p._id?.slice(-8).toUpperCase()}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.customerId?.name || p.userId?.name || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">₹{((p.amount || 0) / 100).toFixed(0)}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{p.method || p.paymentMethod || '—'}</td>
                  <td className="px-4 py-3"><span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ background: (STATUS_COLORS[p.status] || '#9CA3AF') + '22', color: STATUS_COLORS[p.status] || '#9CA3AF' }}>{p.status}</span></td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.razorpayPaymentId || p.transactionId || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
