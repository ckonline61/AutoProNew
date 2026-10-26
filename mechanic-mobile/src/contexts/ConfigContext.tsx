import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
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
  type: 'info' | 'warning' | 'promo';
  dismissable: boolean;
}

export interface MechanicAppConfig {
  theme: ThemeConfig;
  features: Record<string, boolean>;
  maintenance: MaintenanceConfig;
  announcement: AnnouncementConfig;
  loaded: boolean;
}

// ===================== DEFAULTS =====================
const DEFAULT_CONFIG: MechanicAppConfig = {
  theme: {
    primaryColor: '#E53E3E',
    secondaryColor: '#2D3748',
    accentColor: '#ED8936',
    backgroundColor: '#FFFFFF',
    cardColor: '#F7FAFC',
    textColor: '#1A202C',
    buttonRadius: 12,
  },
  features: {
    mechanic_live_location: true,
    mechanic_earnings_dashboard: true,
    mechanic_sos_alerts: true,
    mechanic_job_notifications: true,
    mechanic_chat_with_customer: false,
    mechanic_document_upload: true,
    mechanic_training_videos: false,
    mechanic_incentive_tracker: false,
    mechanic_phone_login: true,
    mechanic_email_login: true,
    mechanic_whatsapp_login: false,
  },
  maintenance: { enabled: false, title: '', message: '', estimatedTime: '' },
  announcement: { enabled: false, text: '', type: 'info', dismissable: true },
  loaded: false,
};

const CONFIG_CACHE_KEY = '@autopro_mechanic_config';

// ===================== CONTEXT =====================
interface ConfigContextType {
  config: MechanicAppConfig;
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
  const [config, setConfig] = useState<MechanicAppConfig>(DEFAULT_CONFIG);

  const parseRemoteConfig = (data: Record<string, any>): MechanicAppConfig => {
    const features: Record<string, boolean> = { ...DEFAULT_CONFIG.features };

    Object.keys(data).forEach((key) => {
      if (key.startsWith('mechanic_') || key.startsWith('feature_')) {
        if (typeof data[key] === 'boolean') {
          features[key] = data[key];
        }
      }
    });

    return {
      theme: data.theme ? { ...DEFAULT_CONFIG.theme, ...data.theme } : DEFAULT_CONFIG.theme,
      features,
      maintenance: data.mechanic_maintenance
        ? { ...DEFAULT_CONFIG.maintenance, ...data.mechanic_maintenance }
        : DEFAULT_CONFIG.maintenance,
      announcement: data.mechanic_announcement
        ? { ...DEFAULT_CONFIG.announcement, ...data.mechanic_announcement }
        : DEFAULT_CONFIG.announcement,
      loaded: true,
    };
  };

  const refreshConfig = useCallback(async () => {
    try {
      const response = await axios.get(`${API_CONFIG.baseUrl}/config/public`, { timeout: 10000 });
      const data = response.data?.data || response.data || {};
      const parsed = parseRemoteConfig(data);
      setConfig(parsed);
      await AsyncStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(data));
      console.log('[MechanicConfig] Config fetched & cached');
    } catch (error) {
      console.log('[MechanicConfig] Fetch failed, trying cache...');
      try {
        const cached = await AsyncStorage.getItem(CONFIG_CACHE_KEY);
        if (cached) {
          setConfig(parseRemoteConfig(JSON.parse(cached)));
          console.log('[MechanicConfig] Loaded from cache');
        } else {
          setConfig({ ...DEFAULT_CONFIG, loaded: true });
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

// ===================== HOOKS =====================
export const useConfig = () => useContext(ConfigContext);
export const useFeature = (key: string) => {
  const { isFeatureEnabled } = useConfig();
  return isFeatureEnabled(key);
};
