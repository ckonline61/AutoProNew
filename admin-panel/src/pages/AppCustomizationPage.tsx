import { useState, useEffect } from 'react';
import api from '../api';
import {
  Palette, Home, Zap, Wrench, Smartphone, Shield, Megaphone,
  Save, RefreshCw, Check, AlertCircle, Plus, Trash2, GripVertical,
  Eye, EyeOff, LogIn
} from 'lucide-react';

// ===================== TYPES =====================
interface ConfigEntry { key: string; value: any; type: string; description?: string; }
interface BannerItem { imageUrl: string; title: string; enabled: boolean; }
interface ServiceCat { id: string; name: string; icon: string; enabled: boolean; price: string; }

const TABS = [
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'home', label: 'Home Screen', icon: Home },
  { id: 'features', label: 'Features', icon: Zap },
  { id: 'login', label: 'Login Methods', icon: LogIn },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'appinfo', label: 'App Info', icon: Smartphone },
  { id: 'maintenance', label: 'Maintenance', icon: Shield },
  { id: 'announcement', label: 'Announcement', icon: Megaphone },
];

const FEATURE_FLAGS = [
  { key: 'feature_sos_button', label: 'SOS Emergency', desc: 'Emergency SOS button dikhaye' },
  { key: 'feature_live_tracking', label: 'Live Tracking', desc: 'Mechanic ka live location tracking' },
  { key: 'feature_razorpay', label: 'Razorpay Payment', desc: 'Online payment via Razorpay' },
  { key: 'feature_offers', label: 'Offers Section', desc: 'Coupons aur offers section' },
  { key: 'feature_saved_cars', label: 'Saved Cars', desc: 'User ki saved vehicles' },
  { key: 'feature_service_history', label: 'Service History', desc: 'Past booking history' },
  { key: 'feature_ratings', label: 'Ratings & Reviews', desc: 'Mechanic ko rating dein' },
  { key: 'feature_referral', label: 'Referral System', desc: 'Refer & earn feature (Coming Soon)' },
  { key: 'feature_chat_support', label: 'Chat Support', desc: 'In-app chat support (Coming Soon)' },
];

const LOGIN_METHODS = [
  { key: 'feature_phone_login', label: 'Phone OTP Login', desc: 'Mobile number + OTP se login', icon: '📱' },
  { key: 'feature_email_login', label: 'Email/Password Login', desc: 'Email aur password se login', icon: '✉️' },
  { key: 'feature_google_signin', label: 'Google Sign-In', desc: 'Google account se one-click login', icon: '🔍' },
  { key: 'feature_apple_signin', label: 'Apple Sign-In', desc: 'Apple ID se login (iOS only)', icon: '🍎' },
  { key: 'feature_whatsapp_login', label: 'WhatsApp Login', desc: 'WhatsApp number se login — Enable karne par OTP WhatsApp par aayega', icon: '💬' },
];

// ===================== DEFAULTS =====================
const DEFAULT_THEME = { primaryColor: '#E53E3E', secondaryColor: '#2D3748', accentColor: '#ED8936', backgroundColor: '#FFFFFF', cardColor: '#F7FAFC', textColor: '#1A202C', buttonRadius: 12 };
const DEFAULT_APP_INFO = { companyName: 'Auto Pro', supportPhone: '+91 9000000001', supportEmail: 'support@autopro.in', aboutUs: 'Auto Pro - Your trusted vehicle service partner.', termsUrl: 'https://autopro.in/terms', privacyUrl: 'https://autopro.in/privacy', websiteUrl: 'https://autopro.in' };
const DEFAULT_MAINTENANCE = { enabled: false, title: 'Under Maintenance', message: 'App maintenance mein hai. Jaldi wapas aayenge!', estimatedTime: '' };
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
export default function AppCustomizationPage() {
  const [tab, setTab] = useState('theme');
  const [configs, setConfigs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Local states
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [welcomeText, setWelcomeText] = useState('Welcome to Auto Pro! 🚗');
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [sectionsOrder, setSectionsOrder] = useState(['banners', 'services', 'offers', 'recent_bookings']);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<ServiceCat[]>([]);
  const [appInfo, setAppInfo] = useState(DEFAULT_APP_INFO);
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

      // Parse into local state
      if (map.theme) setTheme({ ...DEFAULT_THEME, ...map.theme });
      if (map.home_welcome_text) setWelcomeText(map.home_welcome_text);
      if (map.home_banners) setBanners(map.home_banners);
      if (map.home_sections_order) setSectionsOrder(map.home_sections_order);
      if (map.service_categories) setCategories(map.service_categories);
      if (map.app_info) setAppInfo({ ...DEFAULT_APP_INFO, ...map.app_info });
      if (map.maintenance) setMaintenance({ ...DEFAULT_MAINTENANCE, ...map.maintenance });
      if (map.announcement) setAnnouncement({ ...DEFAULT_ANNOUNCEMENT, ...map.announcement });

      const ff: Record<string, boolean> = {};
      FEATURE_FLAGS.forEach(f => { ff[f.key] = map[f.key] !== undefined ? map[f.key] : true; });
      // Also parse login method flags into features
      LOGIN_METHODS.forEach(f => { ff[f.key] = map[f.key] !== undefined ? map[f.key] : (f.key === 'feature_whatsapp_login' ? false : true); });
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
  const saveTheme = async () => {
    setSaving(true);
    try {
      await saveKey('theme', theme, 'JSON', 'App theme colors and styling');
      showToast('success', 'Theme save ho gaya! ✅');
    } catch { showToast('error', 'Theme save mein error aayi'); }
    finally { setSaving(false); }
  };

  const saveHome = async () => {
    setSaving(true);
    try {
      await saveKey('home_welcome_text', welcomeText, 'STRING', 'Home screen welcome message');
      await saveKey('home_banners', banners, 'JSON', 'Home screen banners');
      await saveKey('home_sections_order', sectionsOrder, 'JSON', 'Home sections order');
      showToast('success', 'Home screen config save ho gaya! ✅');
    } catch { showToast('error', 'Home config save mein error aayi'); }
    finally { setSaving(false); }
  };

  const saveFeatures = async () => {
    setSaving(true);
    try {
      for (const f of FEATURE_FLAGS) {
        await saveKey(f.key, features[f.key] ?? true, 'BOOLEAN', f.desc);
      }
      showToast('success', 'Feature flags save ho gaye! ✅');
    } catch { showToast('error', 'Features save mein error aayi'); }
    finally { setSaving(false); }
  };

  const saveLoginMethods = async () => {
    setSaving(true);
    try {
      for (const m of LOGIN_METHODS) {
        await saveKey(m.key, features[m.key] ?? (m.key === 'feature_whatsapp_login' ? false : true), 'BOOLEAN', m.desc);
      }
      showToast('success', 'Login methods save ho gaye! ✅');
    } catch { showToast('error', 'Login methods save mein error aayi'); }
    finally { setSaving(false); }
  };

  const saveServices = async () => {
    setSaving(true);
    try {
      await saveKey('service_categories', categories, 'JSON', 'Service categories');
      showToast('success', 'Services save ho gayi! ✅');
    } catch { showToast('error', 'Services save mein error aayi'); }
    finally { setSaving(false); }
  };

  const saveAppInfo = async () => {
    setSaving(true);
    try {
      await saveKey('app_info', appInfo, 'JSON', 'App information');
      showToast('success', 'App info save ho gayi! ✅');
    } catch { showToast('error', 'App info save mein error aayi'); }
    finally { setSaving(false); }
  };

  const saveMaintenance = async () => {
    setSaving(true);
    try {
      await saveKey('maintenance', maintenance, 'JSON', 'Maintenance mode');
      showToast('success', 'Maintenance config save ho gayi! ✅');
    } catch { showToast('error', 'Maintenance save mein error aayi'); }
    finally { setSaving(false); }
  };

  const saveAnnouncement = async () => {
    setSaving(true);
    try {
      await saveKey('announcement', announcement, 'JSON', 'Announcement bar');
      showToast('success', 'Announcement save ho gaya! ✅');
    } catch { showToast('error', 'Announcement save mein error aayi'); }
    finally { setSaving(false); }
  };

  // ===================== COLOR INPUT =====================
  const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="flex items-center gap-3">
      <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="text-xs font-mono text-gray-500 bg-gray-50 rounded px-2 py-1 w-24 mt-0.5 border border-gray-200" />
      </div>
    </div>
  );

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
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">App Customization</h1>
            <p className="text-sm text-gray-500">Customer App ko bina code kiye customize karein — changes live honge!</p>
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

        {/* =================== THEME =================== */}
        {tab === 'theme' && (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Palette className="w-5 h-5 text-red-500" /> Theme & Colors</h2>
            <p className="text-sm text-gray-500">App ke sabhi colors yahan se change karein. Changes customer app mein live dikhenge.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ColorInput label="Primary Color" value={theme.primaryColor} onChange={v => setTheme(t => ({ ...t, primaryColor: v }))} />
              <ColorInput label="Secondary Color" value={theme.secondaryColor} onChange={v => setTheme(t => ({ ...t, secondaryColor: v }))} />
              <ColorInput label="Accent Color" value={theme.accentColor} onChange={v => setTheme(t => ({ ...t, accentColor: v }))} />
              <ColorInput label="Background Color" value={theme.backgroundColor} onChange={v => setTheme(t => ({ ...t, backgroundColor: v }))} />
              <ColorInput label="Card Color" value={theme.cardColor} onChange={v => setTheme(t => ({ ...t, cardColor: v }))} />
              <ColorInput label="Text Color" value={theme.textColor} onChange={v => setTheme(t => ({ ...t, textColor: v }))} />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Button Radius: {theme.buttonRadius}px</label>
              <input type="range" min={0} max={30} value={theme.buttonRadius} onChange={e => setTheme(t => ({ ...t, buttonRadius: parseInt(e.target.value) }))} className="w-full mt-1" />
            </div>

            {/* Preview */}
            <div className="p-4 rounded-xl border border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-3">Live Preview:</p>
              <div className="flex items-center gap-3 flex-wrap">
                <button style={{ backgroundColor: theme.primaryColor, color: '#fff', borderRadius: theme.buttonRadius + 'px' }} className="px-6 py-2 text-sm font-semibold">Primary Button</button>
                <button style={{ backgroundColor: theme.secondaryColor, color: '#fff', borderRadius: theme.buttonRadius + 'px' }} className="px-6 py-2 text-sm font-semibold">Secondary</button>
                <button style={{ backgroundColor: theme.accentColor, color: '#fff', borderRadius: theme.buttonRadius + 'px' }} className="px-6 py-2 text-sm font-semibold">Accent</button>
                <div style={{ backgroundColor: theme.cardColor, color: theme.textColor, borderRadius: '12px' }} className="p-3 border text-sm">Card Preview Text</div>
              </div>
            </div>

            <button onClick={saveTheme} disabled={saving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Theme
            </button>
          </div>
        )}

        {/* =================== HOME SCREEN =================== */}
        {tab === 'home' && (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Home className="w-5 h-5 text-blue-500" /> Home Screen</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Text</label>
              <input type="text" value={welcomeText} onChange={e => setWelcomeText(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
            </div>

            {/* Banners */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Banners</label>
                <button onClick={() => setBanners(b => [...b, { imageUrl: '', title: '', enabled: true }])} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700">
                  <Plus className="w-3.5 h-3.5" /> Add Banner
                </button>
              </div>
              <div className="space-y-3">
                {banners.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Image URL" value={b.imageUrl} onChange={e => { const nb = [...banners]; nb[i].imageUrl = e.target.value; setBanners(nb); }} className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm" />
                    <input type="text" placeholder="Title" value={b.title} onChange={e => { const nb = [...banners]; nb[i].title = e.target.value; setBanners(nb); }} className="w-32 border border-gray-300 rounded px-2 py-1.5 text-sm" />
                    <Toggle checked={b.enabled} onChange={v => { const nb = [...banners]; nb[i].enabled = v; setBanners(nb); }} />
                    <button onClick={() => setBanners(banners.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {banners.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Koi banner nahi hai. "Add Banner" pe click karein.</p>}
              </div>
            </div>

            {/* Sections Order */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Sections Order (drag to reorder — top = pehle dikhega)</label>
              <div className="space-y-2">
                {sectionsOrder.map((s, i) => (
                  <div key={s} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs bg-gray-200 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center font-bold">{i + 1}</span>
                    <span className="text-sm font-medium text-gray-700 capitalize">{s.replace('_', ' ')}</span>
                    <div className="ml-auto flex gap-1">
                      {i > 0 && <button onClick={() => { const n = [...sectionsOrder]; [n[i-1], n[i]] = [n[i], n[i-1]]; setSectionsOrder(n); }} className="text-xs text-gray-500 hover:text-gray-700 bg-white px-2 py-1 rounded border">↑</button>}
                      {i < sectionsOrder.length - 1 && <button onClick={() => { const n = [...sectionsOrder]; [n[i], n[i+1]] = [n[i+1], n[i]]; setSectionsOrder(n); }} className="text-xs text-gray-500 hover:text-gray-700 bg-white px-2 py-1 rounded border">↓</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={saveHome} disabled={saving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Home Screen
            </button>
          </div>
        )}

        {/* =================== FEATURES =================== */}
        {tab === 'features' && (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" /> Feature Flags</h2>
            <p className="text-sm text-gray-500">Features ko ON/OFF karein. Off karne pe wo feature app mein dikhna band ho jaega.</p>

            <div className="space-y-3">
              {FEATURE_FLAGS.map(f => (
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
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><LogIn className="w-5 h-5 text-blue-500" /> Login Methods</h2>
            <p className="text-sm text-gray-500">Customer app ki login screen par kaunsi login methods dikhni chahiye. Enable/Disable karein admin panel se — app mein turant reflect hoga.</p>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-xs text-blue-700 font-medium">💡 <strong>WhatsApp Login:</strong> Enable karne par future mein customer ko OTP WhatsApp par aayega. Abhi "Coming Soon" mode mein hai. Jab WhatsApp Business API integrate karenge tab automatically kaam karega.</p>
            </div>

            <div className="space-y-3">
              {LOGIN_METHODS.map(m => (
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
                    <Toggle checked={features[m.key] ?? (m.key === 'feature_whatsapp_login' ? false : true)} onChange={v => setFeatures(ff => ({ ...ff, [m.key]: v }))} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-xs text-yellow-700"><strong>⚠️ Note:</strong> Kam se kam ek login method (Phone OTP ya Email) enable rakhein, warna customer login nahi kar payega!</p>
            </div>

            <button onClick={saveLoginMethods} disabled={saving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Login Methods
            </button>
          </div>
        )}

        {/* =================== SERVICES =================== */}
        {tab === 'services' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Wrench className="w-5 h-5 text-green-500" /> Service Categories</h2>
              <button onClick={() => setCategories(c => [...c, { id: `svc_${Date.now()}`, name: '', icon: '🔧', enabled: true, price: '₹0' }])} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg">
                <Plus className="w-3.5 h-3.5" /> Add Category
              </button>
            </div>

            <div className="space-y-3">
              {categories.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <input type="text" value={c.icon} onChange={e => { const nc = [...categories]; nc[i].icon = e.target.value; setCategories(nc); }} className="w-12 text-center text-xl border border-gray-200 rounded-lg py-1" />
                  <input type="text" placeholder="Service name" value={c.name} onChange={e => { const nc = [...categories]; nc[i].name = e.target.value; setCategories(nc); }} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  <input type="text" placeholder="₹999" value={c.price} onChange={e => { const nc = [...categories]; nc[i].price = e.target.value; setCategories(nc); }} className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  <Toggle checked={c.enabled} onChange={v => { const nc = [...categories]; nc[i].enabled = v; setCategories(nc); }} />
                  <button onClick={() => setCategories(categories.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>

            <button onClick={saveServices} disabled={saving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Services
            </button>
          </div>
        )}

        {/* =================== APP INFO =================== */}
        {tab === 'appinfo' && (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Smartphone className="w-5 h-5 text-purple-500" /> App Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                ['companyName', 'Company Name'],
                ['supportPhone', 'Support Phone'],
                ['supportEmail', 'Support Email'],
                ['websiteUrl', 'Website URL'],
                ['termsUrl', 'Terms & Conditions URL'],
                ['privacyUrl', 'Privacy Policy URL'],
              ] as const).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type="text" value={(appInfo as any)[key]} onChange={e => setAppInfo(a => ({ ...a, [key]: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">About Us</label>
              <textarea rows={3} value={appInfo.aboutUs} onChange={e => setAppInfo(a => ({ ...a, aboutUs: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none" />
            </div>

            <button onClick={saveAppInfo} disabled={saving} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save App Info
            </button>
          </div>
        )}

        {/* =================== MAINTENANCE =================== */}
        {tab === 'maintenance' && (
          <div className="space-y-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Shield className="w-5 h-5 text-orange-500" /> Maintenance Mode</h2>
            <p className="text-sm text-gray-500">Enable karne pe customer app mein full-screen maintenance message dikhega. App use nahi ho payega.</p>

            <div className={`flex items-center justify-between p-5 rounded-xl border-2 ${maintenance.enabled ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
              <div>
                <p className={`font-bold text-lg ${maintenance.enabled ? 'text-red-700' : 'text-green-700'}`}>
                  {maintenance.enabled ? '🔴 Maintenance Mode ON' : '🟢 App Live & Running'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {maintenance.enabled ? 'Customers app use nahi kar sakte abhi' : 'Sab kuch normal hai, customers app use kar sakte hain'}
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
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Megaphone className="w-5 h-5 text-indigo-500" /> Announcement Bar</h2>
            <p className="text-sm text-gray-500">App ke top pe ek message bar dikhayein — offers, updates, ya koi bhi important message.</p>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-800">Announcement Bar</p>
                <p className="text-xs text-gray-500">Enable karne pe app ke top pe bar dikhega</p>
              </div>
              <Toggle checked={announcement.enabled} onChange={v => setAnnouncement(a => ({ ...a, enabled: v }))} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Text</label>
              <input type="text" placeholder="e.g. 🎉 50% Off on first service!" value={announcement.text} onChange={e => setAnnouncement(a => ({ ...a, text: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={announcement.type} onChange={e => setAnnouncement(a => ({ ...a, type: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="info">ℹ️ Info (Blue)</option>
                  <option value="warning">⚠️ Warning (Yellow)</option>
                  <option value="success">✅ Success (Green)</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Toggle checked={announcement.dismissable} onChange={v => setAnnouncement(a => ({ ...a, dismissable: v }))} />
                <span className="text-sm text-gray-700">User dismiss kar sakta hai?</span>
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
        <h3 className="font-semibold text-blue-800 flex items-center gap-2"><Eye className="w-4 h-4" /> Kaise kaam karta hai?</h3>
        <ul className="text-sm text-blue-700 mt-2 space-y-1">
          <li>• Yahan se koi bhi change karein → <strong>Save</strong> dabayein</li>
          <li>• Customer app jab khulega toh naye config automatically load honge</li>
          <li>• <strong>Koi Play Store update nahi chahiye</strong> — changes live honge!</li>
          <li>• Maintenance Mode ON karne pe app band ho jaega sabke liye</li>
        </ul>
      </div>

      {/* Play Store Section */}
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
        <h3 className="font-semibold text-orange-800 flex items-center gap-2"><EyeOff className="w-4 h-4" /> Play Store Update Required (In changes ke liye)</h3>
        <ul className="text-sm text-orange-700 mt-2 space-y-1">
          <li>• 🆕 Naya screen / feature add karna</li>
          <li>• 💳 Naya payment method (UPI, etc.)</li>
          <li>• 📱 App icon / Splash screen change</li>
          <li>• 🔀 Navigation structure change</li>
          <li>• 🌐 Naya language add karna</li>
          <li>• 📷 Camera/GPS permission changes</li>
        </ul>
        <p className="text-xs text-orange-600 mt-2">In changes ke liye mujhe batayein — code update karke naya build banaunga.</p>
      </div>
    </div>
  );
}
