import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { useAuth } from '../contexts/AuthContext';
import { useCustomerData } from '../contexts/CustomerDataContext';
import { LoadingScreen } from '../components/LoadingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isRestoring, isPreview, logout } = useAuth();
  const { loading, errors, refresh } = useCustomerData();

  if (isRestoring) {
    return <LoadingScreen message="Initializing Auto Pro..." />;
  }

  return (
    <View style={{ flex: 1 }}>
      {isAuthenticated && <SafeAreaView edges={['top']} style={{ backgroundColor: isPreview ? '#FEF3C7' : '#EFF6FF' }}>
        <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ flex: 1, color: '#92400E', fontSize: 12 }}>{isPreview ? 'Sample-data preview. No real bookings or payments.' : loading ? 'Loading your account...' : errors.length ? errors.join('\n') : 'Connected to your account'}</Text>
          {isPreview && <TouchableOpacity onPress={() => void logout()} accessibilityRole="button"><Text style={{ color: '#2563EB', padding: 8 }}>Exit preview</Text></TouchableOpacity>}
          {!isPreview && <TouchableOpacity disabled={loading} onPress={() => void refresh()} accessibilityRole="button"><Text style={{ color: '#2563EB', padding: 8 }}>Refresh</Text></TouchableOpacity>}
        </View>
      </SafeAreaView>}
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
