import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './contexts/AuthContext';
import { CustomerDataProvider } from './contexts/CustomerDataContext';
import { AppNavigator } from './navigation/AppNavigator';
import { registerForPushNotifications, setupNotificationListeners } from './utils/pushNotifications';
import api from './config/api';

const App: React.FC = () => {
  const notificationListener = useRef<ReturnType<typeof setupNotificationListeners>>();

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
      <AuthProvider>
        <CustomerDataProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </CustomerDataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
