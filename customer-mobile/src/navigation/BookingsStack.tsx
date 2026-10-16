import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BookingsStackParamList } from './types';
import { BookingsScreen, BookingDetailScreen } from '../screens';
import { PaymentCheckoutScreen } from '../screens/PaymentCheckoutScreen';
import { InvoiceDetailScreen } from '../screens/InvoiceDetailScreen';
import { LiveTrackingScreen } from '../screens/LiveTrackingScreen';
import { ReviewScreen } from '../screens/ReviewScreen';
import { COLORS } from '../theme';

const Stack = createNativeStackNavigator<BookingsStackParamList>();

export const BookingsStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="BookingsMain"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="BookingsMain" component={BookingsScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="PaymentCheckout" component={PaymentCheckoutScreen} />
      <Stack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
      <Stack.Screen name="LiveTracking" component={LiveTrackingScreen} />
      <Stack.Screen name="ReviewScreen" component={ReviewScreen} />
    </Stack.Navigator>
  );
};
