import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OffersStackParamList } from './types';
import { OffersScreen } from '../screens/OffersScreen';

const Stack = createNativeStackNavigator<OffersStackParamList>();

export const OffersStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OffersMain" component={OffersScreen} />
    </Stack.Navigator>
  );
};
