import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';
import { ProfileScreen, VehicleFormScreen, NotificationsScreen } from '../screens';
import { AddressesScreen } from '../screens/AddressesScreen';
import { SupportScreen } from '../screens/SupportScreen';
import { AccountScreen } from '../screens/AccountScreen';
import { ServiceHistoryScreen } from '../screens/ServiceHistoryScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { SellCarFormScreen } from '../screens/SellCarFormScreen';
import { LiveTrackingScreen } from '../screens/LiveTrackingScreen';
import { COLORS } from '../theme';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="VehicleForm" component={VehicleFormScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="ServiceHistory" component={ServiceHistoryScreen} />
      <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
      <Stack.Screen name="SellCarForm" component={SellCarFormScreen} />
      <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
    </Stack.Navigator>
  );
};
