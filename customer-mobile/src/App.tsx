import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, StatusBar } from 'react-native';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.content}>
        <Text style={styles.title}>🚗 Auto Pro</Text>
        <Text style={styles.subtitle}>Customer App</Text>
        <Text style={styles.version}>v0.1.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6C757D',
    marginBottom: 16,
  },
  version: {
    fontSize: 14,
    color: '#ADB5BD',
  },
});

export default App;
