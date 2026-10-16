import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { COLORS } from '../theme';

export interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onComplete]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A1A" />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Red circle (80px) with white "AP" text (bold, 28px) */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>AP</Text>
        </View>

        {/* "AUTO PRO" in white, 24px bold, letter-spacing 3 */}
        <Text style={styles.brandTitle}>AUTO PRO</Text>

        {/* "Your car, our care" tagline in gray400, 14px */}
        <Text style={styles.tagline}>Your car, our care</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 20,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 8,
  },
  tagline: {
    color: COLORS.gray400,
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
