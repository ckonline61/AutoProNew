import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { COLORS, SPACING } from '../theme';

const LOGO_IMAGE = require('../../assets/logo.jpg');

export interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      onComplete?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onComplete]);


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={LOGO_IMAGE}
          style={styles.logoImage}
          resizeMode="contain"
          accessibilityLabel="Auto Pro Logo"
        />
        <Text style={styles.brandTitle}>AUTO PRO</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>MECHANIC</Text>
        </View>
        <Text style={styles.tagline}>Mechanic Partner</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 130,
    height: 130,
    borderRadius: 24,
    marginBottom: SPACING.lg,
  },
  brandTitle: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: SPACING.xs,
  },
  badgeContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  tagline: {
    color: COLORS.gray400,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
