import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../theme';

export interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.container}>
        {/* Top half: Placeholder view for hero car image */}
        <View style={styles.heroPlaceholder}>
          <Text style={styles.carEmoji}>🚗</Text>
        </View>

        {/* Center text section */}
        <View style={styles.textSection}>
          <Text style={styles.heading}>
            Everything your <Text style={styles.highlightCar}>car</Text> needs
          </Text>
          <Text style={styles.description}>
            Car service, roadside assistance, spare parts, used cars and more — all in one app.
          </Text>
        </View>

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={onComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.getStartedText}>Get Started →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={onComplete}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  heroPlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.gray200,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  carEmoji: {
    fontSize: 60,
  },
  textSection: {
    alignItems: 'center',
    paddingHorizontal: 8,
    marginVertical: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
  },
  highlightCar: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 12,
    paddingHorizontal: 16,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  getStartedButton: {
    width: '100%',
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  getStartedText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});

export default OnboardingScreen;
