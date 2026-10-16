import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SavedStackParamList } from './types';
import { SavedCarsScreen } from '../screens/SavedCarsScreen';

const Stack = createNativeStackNavigator<SavedStackParamList>();

export const SavedStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SavedMain" component={SavedCarsScreen} />
    </Stack.Navigator>
  );
};
