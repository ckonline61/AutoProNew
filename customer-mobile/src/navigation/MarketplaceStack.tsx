import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MarketplaceStackParamList } from './types';
import { MarketplaceScreen } from '../screens/MarketplaceScreen';
import { CartScreen } from '../screens/CartScreen';
import { COLORS } from '../theme';

const Stack = createNativeStackNavigator<MarketplaceStackParamList>();

export const MarketplaceStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="MarketplaceMain" component={MarketplaceScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
    </Stack.Navigator>
  );
};
