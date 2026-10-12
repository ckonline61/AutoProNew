import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants';

interface EmergencyButtonProps {
  onPress: () => void;
  title?: string;
  subtitle?: string;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  onPress,
  title = '24/7 Roadside Assistance',
  subtitle = 'Tap for immediate breakdown support',
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Emergency SOS Assistance"
    >
      <View style={styles.badgeContainer}>
        <View style={styles.pulsingDot} />
        <Text style={styles.badgeText}>SOS EMERGENCY</Text>
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.actionIconContainer}>
        <Text style={styles.sosIcon}>🚨</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.emergency,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: COLORS.emergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginVertical: 12,
  },
  badgeContainer: {
    position: 'absolute',
    top: -10,
    left: 16,
    backgroundColor: '#991B1B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FCA5A5',
    marginRight: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
    marginTop: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosIcon: {
    fontSize: 24,
  },
});
