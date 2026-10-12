import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './types';
import { ProfileScreen, VehicleFormScreen, NotificationsScreen } from '../screens';
import { COLORS } from '../constants';

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
    </Stack.Navigator>
  );
};
