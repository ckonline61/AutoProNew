import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Settings, User, Shield, Activity, CheckCircle, XCircle,
  RefreshCw, Lock, Eye, EyeOff, Server, Database, Zap
} from 'lucide-react';

interface HealthData {
  status: string;
  database?: { status: string };
  uptime?: number;
  memory?: { used: number; total: number };
  timestamp?: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwResult, setPwResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const fetchHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await api.get('/admin/health');
      setHealth(res.data);
    } catch {
      setHealth({ status: 'unhealthy' });
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => { fetchHealth(); }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwResult(null);

    if (pwForm.newPassword.length < 6) {
      setPwResult({ type: 'error', msg: 'Naya password kam se kam 6 characters ka hona chahiye.' });
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwResult({ type: 'error', msg: 'Naya password aur confirm password match nahi kar rahe.' });
      return;
    }

    setPwLoading(true);
    try {
      await api.put('/users/profile/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwResult({ type: 'success', msg: 'Password successfully change ho gaya! ✅' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPwResult({
        type: 'error',
        msg: err?.response?.data?.message || 'Password change karne mein error aayi.',
      });
    } finally {
      setPwLoading(false);
    }
  };

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('admin_user') || '{}');
    } catch {
      return {};
    }
  })();

  const displayUser = user || storedUser;

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Settings</h1>
          <p className="text-sm text-gray-500">Account aur system settings manage karein</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            Admin Profile
          </h2>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center shadow">
              <span className="text-white text-2xl font-bold">
                {displayUser?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className="font-bold text-gray-800 text-lg">{displayUser?.name || 'Admin'}</p>
              <p className="text-gray-500 text-sm">{displayUser?.email || 'admin@autopro.in'}</p>
              <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                <Shield className="w-3 h-3" />
                Super Admin
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">User ID</span>
              <span className="text-sm font-mono text-gray-700 truncate max-w-[200px]">
                {displayUser?._id || displayUser?.id || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">Role</span>
              <span className="text-sm font-medium text-gray-700">
                {displayUser?.role || 'admin'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Status</span>
              <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                <CheckCircle className="w-3.5 h-3.5" />
                Active
              </span>
            </div>
          </div>
        </div>

        {/* System Health Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              System Health
            </h2>
            <button
              onClick={fetchHealth}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <RefreshCw className={`w-3 h-3 ${healthLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {healthLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Overall Status */}
              <div className={`flex items-center gap-3 p-4 rounded-xl ${
                health?.status === 'healthy' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                {health?.status === 'healthy'
                  ? <CheckCircle className="w-6 h-6 text-green-500" />
                  : <XCircle className="w-6 h-6 text-red-500" />}
                <div>
                  <p className={`font-semibold ${health?.status === 'healthy' ? 'text-green-800' : 'text-red-800'}`}>
                    Backend {health?.status === 'healthy' ? 'Healthy ✅' : 'Unhealthy ❌'}
                  </p>
                  <p className="text-xs text-gray-500">Google Cloud Run — asia-south1</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Database className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-gray-500">Database</p>
                  <p className={`text-sm font-semibold ${
                    health?.database?.status === 'connected' ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {health?.database?.status === 'connected' ? 'Connected' : 'Error'}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
                  <p className="text-xs text-gray-500">Uptime</p>
                  <p className="text-sm font-semibold text-gray-700">{formatUptime(health?.uptime)}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <Server className="w-5 h-5 mx-auto mb-1 text-purple-500" />
                  <p className="text-xs text-gray-500">Region</p>
                  <p className="text-sm font-semibold text-gray-700">Mumbai</p>
                </div>
              </div>

              {/* Backend URL */}
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Backend API URL</p>
                <p className="text-xs font-mono text-gray-700 break-all">
                  https://auto-pro-backend-403346240734.asia-south1.run.app
                </p>
              </div>

              {health?.timestamp && (
                <p className="text-xs text-gray-400 text-right">
                  Last checked: {new Date(health.timestamp).toLocaleString('en-IN')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Lock className="w-4 h-4 text-orange-500" />
          Password Change Karein
        </h2>

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input
                type={showPw.current ? 'text' : 'password'}
                placeholder="••••••••"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPw.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Naya Password</label>
            <div className="relative">
              <input
                type={showPw.new ? 'text' : 'password'}
                placeholder="••••••••"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPw.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showPw.confirm ? 'text' : 'password'}
                placeholder="••••••••"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit + Result */}
          <div className="md:col-span-3 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              type="submit"
              disabled={pwLoading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 disabled:opacity-60 transition"
            >
              {pwLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {pwLoading ? 'Change ho raha hai...' : 'Password Change Karein'}
            </button>

            {pwResult && (
              <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-lg ${
                pwResult.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {pwResult.type === 'success'
                  ? <CheckCircle className="w-4 h-4" />
                  : <XCircle className="w-4 h-4" />}
                {pwResult.msg}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* App Info */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Auto Pro Admin Panel</h3>
            <p className="text-gray-400 text-sm">Vehicle Service Platform</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Version</p>
            <p className="font-semibold">1.0.0</p>
          </div>
          <div>
            <p className="text-gray-400">Platform</p>
            <p className="font-semibold">React + Vite</p>
          </div>
          <div>
            <p className="text-gray-400">Backend</p>
            <p className="font-semibold">Node.js + Cloud Run</p>
          </div>
          <div>
            <p className="text-gray-400">Database</p>
            <p className="font-semibold">MongoDB Atlas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
