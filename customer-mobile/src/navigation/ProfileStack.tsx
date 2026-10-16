import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';
import { ProfileScreen, VehicleFormScreen, NotificationsScreen } from '../screens';
import { COLORS } from '../constants';
import { AddressesScreen } from '../screens/AddressesScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { AccountScreen } from '../screens/AccountScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.cardBackground },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VehicleForm"
        component={VehicleFormScreen}
        options={{ title: 'Vehicle Information' }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Activity & Alerts' }}
      />
      <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: 'Service Addresses' }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ title: 'Customer Support' }} />
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Account & Security' }} />
    </Stack.Navigator>
  );
};
