import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { useAuth } from '../contexts/AuthContext';
import { useCustomerData } from '../contexts/CustomerDataContext';
import { LoadingScreen } from '../components/LoadingScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { COLORS } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isRestoring, isPreview, logout } = useAuth();
  const { loading, errors, refresh } = useCustomerData();
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  if (isRestoring) {
    return <LoadingScreen message="Initializing Auto Pro..." />;
  }

  // Show splash screen first
  if (showSplash && !isAuthenticated) {
    return (
      <SplashScreen
        onComplete={() => {
          setShowSplash(false);
          setShowOnboarding(true);
        }}
      />
    );
  }

  // Show onboarding after splash
  if (showOnboarding && !isAuthenticated) {
    return (
      <OnboardingScreen
        onComplete={() => setShowOnboarding(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Status Banner for authenticated users */}
      {isAuthenticated && (
        <SafeAreaView
          edges={['top']}
          style={[
            styles.statusBanner,
            { backgroundColor: isPreview ? '#FEF3C7' : COLORS.white },
          ]}
        >
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View style={[styles.statusDot, { backgroundColor: isPreview ? '#F59E0B' : errors.length ? COLORS.primary : COLORS.success }]} />
              <Text style={styles.statusText} numberOfLines={1}>
                {isPreview
                  ? 'Preview mode — Sample data'
                  : loading
                  ? 'Syncing...'
                  : errors.length
                  ? 'Connection issue'
                  : 'Connected'}
              </Text>
            </View>
            {isPreview ? (
              <TouchableOpacity onPress={() => void logout()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.statusAction, { color: COLORS.primary }]}>Exit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                disabled={loading}
                onPress={() => void refresh()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="refresh" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      )}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusBanner: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statusAction: {
    fontSize: 12,
    fontWeight: '600',
  },
});
