import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';
import {
  HomeScreen,
  ServiceDetailScreen,
  BookingFormScreen,
  BookingDetailScreen,
  EmergencyScreen,
} from '../screens';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="HomeMain"
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.cardBackground },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ServiceDetail"
        component={ServiceDetailScreen}
        options={{ title: 'Service Details' }}
      />
      <Stack.Screen
        name="BookingForm"
        component={BookingFormScreen}
        options={{ title: 'Schedule Service' }}
      />
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{ title: 'Track Booking' }}
      />
      <Stack.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{
          title: 'Roadside Assistance SOS',
          headerStyle: { backgroundColor: '#DC2626' },
          headerTintColor: '#FFFFFF',
        }}
      />
    </Stack.Navigator>
  );
};
