import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BookingsStackParamList } from './types';
import { BookingsScreen, BookingDetailScreen } from '../screens';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator<BookingsStackParamList>();

export const BookingsStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="BookingsMain"
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.cardBackground },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen
        name="BookingsMain"
        component={BookingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{ title: 'Booking Status' }}
      />
    </Stack.Navigator>
  );
};
