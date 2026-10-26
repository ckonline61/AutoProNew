import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../constants';

// ===================== TYPES =====================
interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  cardColor: string;
  textColor: string;
  buttonRadius: number;
}

interface MaintenanceConfig {
  enabled: boolean;
  title: string;
  message: string;
  estimatedTime: string;
}

interface AnnouncementConfig {
  enabled: boolean;
  text: string;
  type: 'info' | 'warning' | 'success';
  dismissable: boolean;
}

interface AppInfoConfig {
  companyName: string;
  supportPhone: string;
  supportEmail: string;
  aboutUs: string;
  termsUrl: string;
  privacyUrl: string;
  websiteUrl: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  price: string;
}

export interface AppConfig {
  theme: ThemeConfig;
  homeWelcomeText: string;
  homeBanners: Array<{ imageUrl: string; title: string; enabled: boolean }>;
  homeSectionsOrder: string[];
  features: Record<string, boolean>;
  serviceCategories: ServiceCategory[];
  appInfo: AppInfoConfig;
  maintenance: MaintenanceConfig;
  announcement: AnnouncementConfig;
  loaded: boolean;
}

// ===================== DEFAULTS =====================
const DEFAULT_CONFIG: AppConfig = {
  theme: {
    primaryColor: '#E53E3E',
    secondaryColor: '#2D3748',
    accentColor: '#ED8936',
    backgroundColor: '#FFFFFF',
    cardColor: '#F7FAFC',
    textColor: '#1A202C',
    buttonRadius: 12,
  },
  homeWelcomeText: 'Welcome to Auto Pro! 🚗',
  homeBanners: [],
  homeSectionsOrder: ['banners', 'services', 'offers', 'recent_bookings'],
  features: {
    feature_google_signin: true,
    feature_apple_signin: true,
    feature_whatsapp_login: false,
    feature_email_login: true,
    feature_phone_login: true,
    feature_sos_button: true,
    feature_live_tracking: true,
    feature_razorpay: true,
    feature_offers: true,
    feature_saved_cars: true,
    feature_service_history: true,
    feature_ratings: true,
    feature_referral: false,
    feature_chat_support: false,
  },
  serviceCategories: [],
  appInfo: {
    companyName: 'Auto Pro',
    supportPhone: '+91 9000000001',
    supportEmail: 'support@autopro.in',
    aboutUs: 'Auto Pro - Your trusted vehicle service partner.',
    termsUrl: 'https://autopro.in/terms',
    privacyUrl: 'https://autopro.in/privacy',
    websiteUrl: 'https://autopro.in',
  },
  maintenance: { enabled: false, title: '', message: '', estimatedTime: '' },
  announcement: { enabled: false, text: '', type: 'info', dismissable: true },
  loaded: false,
};

const CONFIG_CACHE_KEY = '@autopro_remote_config';

// ===================== CONTEXT =====================
interface ConfigContextType {
  config: AppConfig;
  refreshConfig: () => Promise<void>;
  isFeatureEnabled: (key: string) => boolean;
}

const ConfigContext = createContext<ConfigContextType>({
  config: DEFAULT_CONFIG,
  refreshConfig: async () => {},
  isFeatureEnabled: () => true,
});

// ===================== PROVIDER =====================
export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);

  const parseRemoteConfig = (data: Record<string, any>): AppConfig => {
    const features: Record<string, boolean> = { ...DEFAULT_CONFIG.features };

    // Parse feature flags
    Object.keys(data).forEach((key) => {
      if (key.startsWith('feature_')) {
        features[key] = typeof data[key] === 'boolean' ? data[key] : true;
      }
    });

    return {
      theme: data.theme ? { ...DEFAULT_CONFIG.theme, ...data.theme } : DEFAULT_CONFIG.theme,
      homeWelcomeText: data.home_welcome_text || DEFAULT_CONFIG.homeWelcomeText,
      homeBanners: Array.isArray(data.home_banners) ? data.home_banners.filter((b: any) => b.enabled) : DEFAULT_CONFIG.homeBanners,
      homeSectionsOrder: Array.isArray(data.home_sections_order) ? data.home_sections_order : DEFAULT_CONFIG.homeSectionsOrder,
      features,
      serviceCategories: Array.isArray(data.service_categories)
        ? data.service_categories.filter((c: any) => c.enabled)
        : DEFAULT_CONFIG.serviceCategories,
      appInfo: data.app_info ? { ...DEFAULT_CONFIG.appInfo, ...data.app_info } : DEFAULT_CONFIG.appInfo,
      maintenance: data.maintenance ? { ...DEFAULT_CONFIG.maintenance, ...data.maintenance } : DEFAULT_CONFIG.maintenance,
      announcement: data.announcement ? { ...DEFAULT_CONFIG.announcement, ...data.announcement } : DEFAULT_CONFIG.announcement,
      loaded: true,
    };
  };

  const refreshConfig = useCallback(async () => {
    try {
      // Fetch from public config endpoint (no auth needed)
      const response = await axios.get(`${API_CONFIG.baseUrl}/config/public`, { timeout: 10000 });
      const data = response.data?.data || response.data || {};
      const parsed = parseRemoteConfig(data);
      setConfig(parsed);

      // Cache for offline use
      await AsyncStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(data));
      console.log('[RemoteConfig] Config fetched & cached successfully');
    } catch (error) {
      console.log('[RemoteConfig] Fetch failed, trying cache...');
      // Fallback to cached config
      try {
        const cached = await AsyncStorage.getItem(CONFIG_CACHE_KEY);
        if (cached) {
          const data = JSON.parse(cached);
          setConfig(parseRemoteConfig(data));
          console.log('[RemoteConfig] Loaded from cache');
        } else {
          setConfig({ ...DEFAULT_CONFIG, loaded: true });
          console.log('[RemoteConfig] Using defaults');
        }
      } catch {
        setConfig({ ...DEFAULT_CONFIG, loaded: true });
      }
    }
  }, []);

  const isFeatureEnabled = useCallback(
    (key: string): boolean => {
      return config.features[key] !== false;
    },
    [config.features]
  );

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  return (
    <ConfigContext.Provider value={{ config, refreshConfig, isFeatureEnabled }}>
      {children}
    </ConfigContext.Provider>
  );
};

// ===================== HOOK =====================
export const useConfig = () => useContext(ConfigContext);
export const useFeature = (key: string) => {
  const { isFeatureEnabled } = useConfig();
  return isFeatureEnabled(key);
};
