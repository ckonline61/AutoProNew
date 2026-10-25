import React, { useEffect, useState } from 'react';
import { Tag, Plus, RefreshCw, Trash2 } from 'lucide-react';
import api from '../api';

const emptyForm = { code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', maxUsage: '', validUntil: '', isActive: true, description: '' };

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/resources/coupons?limit=100');
      setCoupons(res.data?.data || []);
    } catch { setCoupons([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/resources/coupons', {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderValue: Number(form.minOrderValue) * 100,
        maxUsage: Number(form.maxUsage),
        validUntil: new Date(form.validUntil).toISOString(),
      });
      showMsg('✅ Coupon created!'); setShowForm(false); setForm({ ...emptyForm }); load();
    } catch (e: any) { showMsg('❌ ' + (e.response?.data?.message || 'Error')); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/admin/resources/coupons/${id}`, { isActive: !isActive });
      showMsg(`✅ Coupon ${!isActive ? 'activated' : 'deactivated'}`); load();
    } catch (e: any) { showMsg('❌ ' + (e.response?.data?.message || 'Error')); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Tag className="w-6 h-6 text-red-600" />Coupons</h1>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"><RefreshCw className="w-4 h-4" />Refresh</button>
          <button onClick={() => setShowForm(f => !f)} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"><Plus className="w-4 h-4" />New Coupon</button>
        </div>
      </div>

      {msg && <div className={`p-3 rounded-lg text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg}</div>}

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-3 gap-4">
          <h3 className="col-span-full text-lg font-bold text-gray-900">Create New Coupon</h3>
          {[
            { label: 'Coupon Code', key: 'code', type: 'text', placeholder: 'SAVE20', required: true },
            { label: 'Discount Value', key: 'discountValue', type: 'number', placeholder: '20', required: true },
            { label: 'Min Order (₹)', key: 'minOrderValue', type: 'number', placeholder: '200' },
            { label: 'Max Usage', key: 'maxUsage', type: 'number', placeholder: '100' },
            { label: 'Valid Until', key: 'validUntil', type: 'date', required: true },
            { label: 'Description', key: 'description', type: 'text', placeholder: 'Save 20% on all services' },
          ].map(({ label, key, type, placeholder, required }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-gray-700 block mb-1">{label}</label>
              <input type={type} required={required} placeholder={placeholder} value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">Discount Type</label>
            <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
          </div>
          <div className="col-span-full flex gap-3">
            <button type="submit" disabled={saving} className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60">{saving ? 'Saving...' : 'Create Coupon'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-gray-200 px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Code','Type','Discount','Min Order','Usage','Valid Until','Status','Actions'].map(h =>
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? <tr><td colSpan={8} className="text-center py-12"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div></td></tr>
              : coupons.length === 0 ? <tr><td colSpan={8} className="text-center py-10 text-gray-400">No coupons yet. Create one!</td></tr>
              : coupons.map(c => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-gray-800 font-mono">{c.code}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{c.discountType}</td>
                  <td className="px-4 py-3 font-semibold text-red-600">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                  <td className="px-4 py-3 text-gray-600">₹{((c.minOrderValue || 0) / 100).toFixed(0)}</td>
                  <td className="px-4 py-3 text-gray-600">{c.usageCount || 0}/{c.maxUsage || '∞'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{c.validUntil ? new Date(c.validUntil).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-3">{c.isActive ? <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">Active</span> : <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Inactive</span>}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(c._id, c.isActive)} className={`text-xs px-3 py-1 rounded-lg font-semibold ${c.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
