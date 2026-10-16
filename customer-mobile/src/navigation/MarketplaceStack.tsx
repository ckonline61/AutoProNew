import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MarketplaceStackParamList } from './types';
import { MarketplaceScreen } from '../screens/MarketplaceScreen';
import { CartScreen } from '../screens/CartScreen';
const Stack = createNativeStackNavigator<MarketplaceStackParamList>();
export const MarketplaceStack = () => <Stack.Navigator><Stack.Screen name="MarketplaceMain" component={MarketplaceScreen} options={{ headerShown: false }} /><Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart & Orders' }} /></Stack.Navigator>;
