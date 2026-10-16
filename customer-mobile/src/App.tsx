import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './contexts/AuthContext';
import { CustomerDataProvider } from './contexts/CustomerDataContext';
import { AppNavigator } from './navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AuthProvider>
        <CustomerDataProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
        </CustomerDataProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
