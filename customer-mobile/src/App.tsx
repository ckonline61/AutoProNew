import React, { useEffect, useRef } from 'react';
import { StatusBar, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './contexts/AuthContext';
import { CustomerDataProvider } from './contexts/CustomerDataContext';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import { AppNavigator } from './navigation/AppNavigator';
import { registerForPushNotifications, setupNotificationListeners } from './utils/pushNotifications';
import api from './config/api';

const App: React.FC = () => {
  const notificationListener = useRef<ReturnType<typeof setupNotificationListeners> | null>(null);

  useEffect(() => {
    // Register push token and send to backend
    registerForPushNotifications().then(async (token) => {
      if (token) {
        try {
          await api.post('/users/device-token', { token, platform: 'android' });
          console.log('[Push] Token saved to backend');
        } catch (e) {
          console.log('[Push] Token save failed (non-critical):', e);
        }
      }
    });

    // Setup notification listeners
    notificationListener.current = setupNotificationListeners();

    return () => {
      notificationListener.current?.();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <ConfigProvider>
        <MaintenanceGate>
          <AuthProvider>
            <CustomerDataProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </CustomerDataProvider>
          </AuthProvider>
        </MaintenanceGate>
      </ConfigProvider>
    </SafeAreaProvider>
  );
};

// Maintenance Mode Gate — blocks entire app when enabled
const MaintenanceGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config } = useConfig();

  if (config.maintenance.enabled) {
    return (
      <View style={mStyles.container}>
        <Text style={mStyles.icon}>🔧</Text>
        <Text style={mStyles.title}>{config.maintenance.title || 'Under Maintenance'}</Text>
        <Text style={mStyles.message}>{config.maintenance.message || 'App abhi maintenance mein hai.'}</Text>
        {config.maintenance.estimatedTime ? (
          <Text style={mStyles.time}>⏰ {config.maintenance.estimatedTime}</Text>
        ) : null}
      </View>
    );
  }

  return <>{children}</>;
};

const mStyles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A202C', padding: 40 },
  icon: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  message: { fontSize: 16, color: '#A0AEC0', textAlign: 'center', lineHeight: 24 },
  time: { fontSize: 14, color: '#ED8936', marginTop: 16 },
});

export default App;
