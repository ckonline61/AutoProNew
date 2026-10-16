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
import { PaymentCheckoutScreen } from '../screens/PaymentCheckoutScreen';
import { InvoiceDetailScreen } from '../screens/InvoiceDetailScreen';
import { LiveTrackingScreen } from '../screens/LiveTrackingScreen';
import { COLORS } from '../theme';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="HomeMain"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="BookingForm" component={BookingFormScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
      <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
      <Stack.Screen
        name="Emergency"
        component={EmergencyScreen}
        options={{
          headerShown: true,
          title: 'Emergency Assistance',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: '700' },
        }}
      />
    </Stack.Navigator>
  );
};
