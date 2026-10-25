import React, { useState, useEffect } from 'react';
import api from '../api';
import { Bell, Send, Users, Wrench, User, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface NotificationLog {
  _id: string;
  title: string;
  body: string;
  target: string;
  sentAt: string;
  status: string;
}

const TARGET_OPTIONS = [
  { value: 'all_users', label: 'All Customers', icon: Users },
  { value: 'all_mechanics', label: 'All Mechanics', icon: Wrench },
  { value: 'specific_user', label: 'Specific User (by ID)', icon: User },
];

export default function NotificationsPage() {
  const [form, setForm] = useState({ title: '', body: '', target: 'all_users', userId: '' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/resources/notifications');
      setLogs(res.data?.data || res.data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      setResult({ type: 'error', msg: 'Title aur Message dono required hain.' });
      return;
    }
    if (form.target === 'specific_user' && !form.userId.trim()) {
      setResult({ type: 'error', msg: 'Specific User ke liye User ID required hai.' });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const payload: any = { title: form.title, body: form.body, target: form.target };
      if (form.target === 'specific_user') payload.userId = form.userId;
      await api.post('/notifications/send', payload);
      setResult({ type: 'success', msg: 'Notification successfully send ho gaya! ✅' });
      setForm({ title: '', body: '', target: 'all_users', userId: '' });
      fetchLogs();
    } catch (err: any) {
      setResult({ type: 'error', msg: err?.response?.data?.message || 'Notification send karne mein error aayi.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
          <Bell className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Push Notifications</h1>
          <p className="text-sm text-gray-500">Customers aur Mechanics ko notifications bhejein</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Send className="w-4 h-4 text-red-500" />
            Notification Bhejein
          </h2>

          <form onSubmit={handleSend} className="space-y-4">
            {/* Target Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
              <div className="grid grid-cols-1 gap-2">
                {TARGET_OPTIONS.map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                      form.target === value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="target"
                      value={value}
                      checked={form.target === value}
                      onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
                      className="sr-only"
                    />
                    <Icon className={`w-4 h-4 ${form.target === value ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${form.target === value ? 'text-red-700' : 'text-gray-600'}`}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* User ID (conditional) */}
            {form.target === 'specific_user' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID (MongoDB)</label>
                <input
                  type="text"
                  placeholder="64abc123def456..."
                  value={form.userId}
                  onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="Notification ka title..."
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                rows={4}
                placeholder="Notification ka message..."
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            {/* Result */}
            {result && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                result.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {result.type === 'success'
                  ? <CheckCircle className="w-4 h-4" />
                  : <AlertCircle className="w-4 h-4" />}
                {result.msg}
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition"
            >
              {sending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending ? 'Bhej raha hai...' : 'Send Notification'}
            </button>
          </form>
        </div>

        {/* Tips / Info */}
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
            <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notification Tips
            </h3>
            <ul className="text-sm text-yellow-700 space-y-2">
              <li>• <strong>All Customers</strong> — App mein registered sabhi customers ko notification milegi</li>
              <li>• <strong>All Mechanics</strong> — Sabhi mechanics ko notification milegi</li>
              <li>• <strong>Specific User</strong> — Kisi ek user ko targeted notification bhejein</li>
              <li>• Notification receive hone ke liye user ka app active hona zaroori nahi</li>
              <li>• Title 50 characters se kam rakhein for best results</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <h3 className="font-semibold text-blue-800 mb-3">Quick Templates</h3>
            <div className="space-y-2">
              {[
                { title: 'Special Offer! 🎉', body: 'AutoPro mein aaj 20% discount! App open karein.' },
                { title: 'Booking Reminder ⏰', body: 'Aapki service appointment kal hai. Tayyar rahein!' },
                { title: 'New Feature! 🚗', body: 'AutoPro mein naya feature aa gaya. Check karein!' },
              ].map((t, i) => (
                <button
                  key={i}
                  onClick={() => setForm(f => ({ ...f, title: t.title, body: t.body }))}
                  className="w-full text-left p-3 bg-white border border-blue-200 rounded-lg hover:border-blue-400 transition"
                >
                  <p className="text-sm font-medium text-blue-800">{t.title}</p>
                  <p className="text-xs text-blue-600 mt-0.5 truncate">{t.body}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Logs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Recent Notifications</h2>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p className="text-sm">Load ho raha hai...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Koi notification history nahi mili</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Title</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Message</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Target</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((n) => (
                  <tr key={n._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium text-gray-800">{n.title}</td>
                    <td className="py-2 px-3 text-gray-600 max-w-xs truncate">{n.body}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {n.target}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-gray-500">
                      {n.sentAt ? new Date(n.sentAt).toLocaleString('en-IN') : '-'}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        n.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {n.status || 'sent'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
