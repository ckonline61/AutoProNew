import { useState, useEffect } from 'react';
import api from '../api';
import {
  Zap, LogIn, Shield, Megaphone,
  Save, RefreshCw, Check, AlertCircle, Wrench
} from 'lucide-react';

// ===================== TYPES =====================
interface ConfigEntry { key: string; value: any; type: string; description?: string; }

const TABS = [
  { id: 'features', label: 'Features', icon: Zap },
  { id: 'login', label: 'Login Methods', icon: LogIn },
  { id: 'maintenance', label: 'Maintenance', icon: Shield },
  { id: 'announcement', label: 'Announcement', icon: Megaphone },
];

const MECHANIC_FEATURES = [
  { key: 'mechanic_live_location', label: 'Live Location Sharing', desc: 'Customer ko apna live location share karna' },
  { key: 'mechanic_earnings_dashboard', label: 'Earnings Dashboard', desc: 'Kamai ka detailed dashboard' },
  { key: 'mechanic_sos_alerts', label: 'SOS Alerts', desc: 'Emergency SOS alerts receive karna' },
  { key: 'mechanic_job_notifications', label: 'Job Notifications', desc: 'Naye job aane par push notification' },
  { key: 'mechanic_chat_with_customer', label: 'Chat with Customer', desc: 'In-app customer se chat (Coming Soon)' },
  { key: 'mechanic_document_upload', label: 'Document Upload', desc: 'License/Aadhar documents upload' },
  { key: 'mechanic_training_videos', label: 'Training Videos', desc: 'Training content section (Coming Soon)' },
  { key: 'mechanic_incentive_tracker', label: 'Incentive Tracker', desc: 'Monthly incentive tracking (Coming Soon)' },
];

const MECHANIC_LOGIN_METHODS = [
  { key: 'mechanic_phone_login', label: 'Phone OTP Login', desc: 'Mobile + OTP se login', icon: '📱' },
  { key: 'mechanic_email_login', label: 'Email/Password Login', desc: 'Email aur password se login', icon: '✉️' },
  { key: 'mechanic_whatsapp_login', label: 'WhatsApp Login', desc: 'WhatsApp number se login', icon: '💬' },
];

// ===================== DEFAULTS =====================
const DEFAULT_MAINTENANCE = { enabled: false, title: 'Under Maintenance', message: 'Mechanic app maintenance mein hai. Jaldi wapas aayenge!', estimatedTime: '' };
const DEFAULT_ANNOUNCEMENT = { enabled: false, text: '', type: 'info', dismissable: true };

// ===================== TOGGLE =====================
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${checked ? 'bg-red-600' : 'bg-gray-300'}`}>
      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

// ===================== MAIN =====================
export function MechanicAppPage() {
  const [tab, setTab] = useState('features');
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Local states
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [maintenance, setMaintenance] = useState(DEFAULT_MAINTENANCE);
  const [announcement, setAnnouncement] = useState(DEFAULT_ANNOUNCEMENT);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/config');
      const list: ConfigEntry[] = res.data?.data || res.data || [];
      const map: Record<string, any> = {};
      list.forEach((c: ConfigEntry) => { map[c.key] = c.value; });
      setConfigs(map);

      // Parse maintenance & announcement
      if (map.mechanic_maintenance) setMaintenance({ ...DEFAULT_MAINTENANCE, ...map.mechanic_maintenance });
      if (map.mechanic_announcement) setAnnouncement({ ...DEFAULT_ANNOUNCEMENT, ...map.mechanic_announcement });

      // Parse features
      const ff: Record<string, boolean> = {};
      MECHANIC_FEATURES.forEach(f => { ff[f.key] = map[f.key] !== undefined ? map[f.key] : true; });
      MECHANIC_LOGIN_METHODS.forEach(f => { ff[f.key] = map[f.key] !== undefined ? map[f.key] : (f.key === 'mechanic_whatsapp_login' ? false : true); });
      setFeatures(ff);
    } catch {
      showToast('error', 'Config load karne mein error aayi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchConfigs(); }, []);

  const saveKey = async (key: string, value: any, type: string, description?: string) => {
    await api.put(`/admin/config/${key}`, { value, type, description });
  };

  // ===================== SAVE HANDLERS =====================
  const saveFeatures = async () => {
    setSaving(true);
    try {
      for (const f of MECHANIC_FEATURES) {
        await saveKey(f.key, features[f.key] ?? true, 'BOOLEAN', f.desc);
      }
      showToast('success', 'Mechanic feature flags save ho gaye! ✅');
    } catch { showToast('error', 'Features save mein error aayi'); }
    finally { setSaving(false); }
  };

  const saveLoginMethods = async () => {
    setSaving(true);
    try {
      for (const m of MECHANIC_LOGIN_METHODS) {
        await saveKey(m.key, features[m.key] ?? (m.key === 'mechanic_whatsapp_login' ? false : true), 'BOOLEAN', m.desc);
      }
      showToast('success', 'Mechanic login methods save ho gaye! ✅');
    } catch { showToast('error', 'Login methods save mein error aayi'); }
    finally { setSaving(false); }
  };

  const saveMaintenance = async () => {
    setSaving(true);
    try {
      await saveKey('mechanic_maintenance', maintenance, 'JSON', 'Mechanic app maintenance mode');
      showToast('success', 'Mechanic maintenance config save ho gayi! ✅');
    } catch { showToast('error', 'Maintenance save mein error aayi'); }
    finally { setSaving(false); }
  };

  const saveAnnouncement = async () => {
    setSaving(true);
    try {
      await saveKey('mechanic_announcement', announcement, 'JSON', 'Mechanic app announcement bar');
      showToast('success', 'Mechanic announcement save ho gaya! ✅');
    } catch { showToast('error', 'Announcement save mein error aayi'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      <p className="ml-3 text-gray-500">Config load ho raha hai...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Mechanic App Controls</h1>
            <p className="text-sm text-gray-500">Mechanic App ko admin panel se customize karein — features, login, maintenance sab yahan se!</p>
          </div>
        </div>
        <button onClick={fetchConfigs} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-2 rounded-lg">
          <RefreshCw className="w-3.5 h-3.5" /> Reload
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${tab === t.id ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

        {/* =================== FEATURES =================== */}
        {tab === 'features' && (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" /> Mechanic Feature Flags</h2>
            <p className="text-sm text-gray-500">Mechanic app ke features ko ON/OFF karein. Off karne pe wo feature mechanic app mein dikhna band ho jaega.</p>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-orange-700 font-medium">🔧 <strong>Note:</strong> Ye controls sirf Mechanic App ke liye hain. Customer App ke controls <strong>App Customize</strong> page par hain.</p>
            </div>

            <div className="space-y-3">
              {MECHANIC_FEATURES.map(f => (
                <div key={f.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{f.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${features[f.key] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {features[f.key] ? 'ON' : 'OFF'}
                    </span>
                    <Toggle checked={features[f.key] ?? true} onChange={v => setFeatures(ff => ({ ...ff, [f.key]: v }))} />
                  </div>
                </div>
              ))}
            </div>

            <button onClick={saveFeatures} disabled={saving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Features
            </button>
          </div>
        )}

        {/* =================== LOGIN METHODS =================== */}
        {tab === 'login' && (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><LogIn className="w-5 h-5 text-blue-500" /> Mechanic Login Methods</h2>
            <p className="text-sm text-gray-500">Mechanic app ki login screen par kaunsi login methods dikhni chahiye. Enable/Disable karein admin panel se — app mein turant reflect hoga.</p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-blue-700 font-medium">💡 <strong>WhatsApp Login:</strong> Enable karne par future mein mechanic ko OTP WhatsApp par aayega. Abhi "Coming Soon" mode mein hai.</p>
            </div>

            <div className="space-y-3">
              {MECHANIC_LOGIN_METHODS.map(m => (
                <div key={m.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{m.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{m.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${features[m.key] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {features[m.key] ? 'ON' : 'OFF'}
                    </span>
                    <Toggle checked={features[m.key] ?? (m.key === 'mechanic_whatsapp_login' ? false : true)} onChange={v => setFeatures(ff => ({ ...ff, [m.key]: v }))} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs text-yellow-700"><strong>⚠️ Note:</strong> Kam se kam ek login method (Phone OTP ya Email) enable rakhein, warna mechanic login nahi kar payega!</p>
            </div>

            <button onClick={saveLoginMethods} disabled={saving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Login Methods
            </button>
          </div>
        )}

        {/* =================== MAINTENANCE =================== */}
        {tab === 'maintenance' && (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Shield className="w-5 h-5 text-orange-500" /> Mechanic Maintenance Mode</h2>
            <p className="text-sm text-gray-500">Enable karne pe mechanic app mein full-screen maintenance message dikhega. Mechanic app use nahi ho payega.</p>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-orange-700 font-medium">🔧 <strong>Note:</strong> Ye sirf Mechanic App ka maintenance mode hai. Customer App ka maintenance alag hai (App Customize page par).</p>
            </div>

            <div className={`flex items-center justify-between p-5 rounded-xl border-2 ${maintenance.enabled ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
              <div>
                <p className={`font-bold text-lg ${maintenance.enabled ? 'text-red-700' : 'text-green-700'}`}>
                  {maintenance.enabled ? '🔴 Maintenance Mode ON' : '🟢 Mechanic App Live & Running'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {maintenance.enabled ? 'Mechanics app use nahi kar sakte abhi' : 'Sab kuch normal hai, mechanics app use kar sakte hain'}
                </p>
              </div>
              <Toggle checked={maintenance.enabled} onChange={v => setMaintenance(m => ({ ...m, enabled: v }))} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={maintenance.title} onChange={e => setMaintenance(m => ({ ...m, title: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time</label>
                <input type="text" placeholder="e.g. 2 hours" value={maintenance.estimatedTime} onChange={e => setMaintenance(m => ({ ...m, estimatedTime: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea rows={3} value={maintenance.message} onChange={e => setMaintenance(m => ({ ...m, message: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none" />
            </div>

            {/* Preview */}
            {maintenance.enabled && (
              <div className="p-6 bg-gray-900 rounded-xl text-center text-white">
                <Shield className="w-12 h-12 mx-auto mb-3 text-yellow-400" />
                <h3 className="text-xl font-bold">{maintenance.title}</h3>
                <p className="text-gray-300 mt-2">{maintenance.message}</p>
                {maintenance.estimatedTime && <p className="text-yellow-400 mt-2 text-sm">⏰ Estimated: {maintenance.estimatedTime}</p>}
              </div>
            )}

            <button onClick={saveMaintenance} disabled={saving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Maintenance
            </button>
          </div>
        )}

        {/* =================== ANNOUNCEMENT =================== */}
        {tab === 'announcement' && (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Megaphone className="w-5 h-5 text-indigo-500" /> Mechanic Announcement Bar</h2>
            <p className="text-sm text-gray-500">Mechanic app ke top pe ek message bar dikhayein — updates, alerts, ya koi bhi important message.</p>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-800">Announcement Bar</p>
                <p className="text-xs text-gray-500">Enable karne pe mechanic app ke top pe bar dikhega</p>
              </div>
              <Toggle checked={announcement.enabled} onChange={v => setAnnouncement(a => ({ ...a, enabled: v }))} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Text</label>
              <input type="text" placeholder="e.g. 🎉 Naye incentive program shuru!" value={announcement.text} onChange={e => setAnnouncement(a => ({ ...a, text: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={announcement.type} onChange={e => setAnnouncement(a => ({ ...a, type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="info">ℹ️ Info (Blue)</option>
                  <option value="warning">⚠️ Warning (Yellow)</option>
                  <option value="promo">🎁 Promo (Green)</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Toggle checked={announcement.dismissable} onChange={v => setAnnouncement(a => ({ ...a, dismissable: v }))} />
                <span className="text-sm text-gray-700">Mechanic dismiss kar sakta hai?</span>
              </div>
            </div>

            {/* Preview */}
            {announcement.enabled && announcement.text && (
              <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                announcement.type === 'info' ? 'bg-blue-100 text-blue-800' :
                announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                <Megaphone className="w-4 h-4" />
                {announcement.text}
                {announcement.dismissable && <span className="ml-auto text-xs opacity-60">✕</span>}
              </div>
            )}

            <button onClick={saveAnnouncement} disabled={saving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Announcement
            </button>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h3 className="font-semibold text-blue-800 flex items-center gap-2"><Wrench className="w-4 h-4" /> Kaise kaam karta hai?</h3>
        <ul className="text-sm text-blue-700 mt-2 space-y-1">
          <li>• Yahan se koi bhi change karein → <strong>Save</strong> dabayein</li>
          <li>• Mechanic app jab khulega toh naye config automatically load honge</li>
          <li>• <strong>Koi Play Store update nahi chahiye</strong> — changes live honge!</li>
          <li>• Maintenance Mode ON karne pe mechanic app band ho jaega sabke liye</li>
          <li>• Ye controls <strong>Customer App</strong> se alag hain — dono independently manage hote hain</li>
        </ul>
      </div>
    </div>
  );
}

export default MechanicAppPage;
