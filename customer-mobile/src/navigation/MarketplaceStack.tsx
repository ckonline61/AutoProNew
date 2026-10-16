import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MarketplaceStackParamList } from './types';
import { MarketplaceScreen } from '../screens/MarketplaceScreen';
import { CartScreen } from '../screens/CartScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { UsedCarDetailScreen } from '../screens/UsedCarDetailScreen';
import { CarInspectionScreen } from '../screens/CarInspectionScreen';
import { InspectionReportScreen } from '../screens/InspectionReportScreen';
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
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="UsedCarDetail" component={UsedCarDetailScreen} />
      <Stack.Screen name="CarInspection" component={CarInspectionScreen} />
      <Stack.Screen name="InspectionReport" component={InspectionReportScreen} />
    </Stack.Navigator>
  );
};
