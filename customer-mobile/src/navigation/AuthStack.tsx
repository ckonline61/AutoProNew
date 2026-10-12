import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { LoginScreen, RegisterScreen } from '../screens';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: true,
          title: 'Create Account',
          headerBackTitle: 'Login',
          headerTintColor: COLORS.primary,
          headerStyle: { backgroundColor: COLORS.cardBackground },
        }}
      />
    </Stack.Navigator>
  );
};
