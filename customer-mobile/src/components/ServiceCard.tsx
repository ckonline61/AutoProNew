import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS } from '../constants';

interface ServiceCardProps {
  name: string;
  icon: string;
  startingPrice?: number;
  onPress: () => void;
  description?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  icon,
  startingPrice,
  onPress,
  description,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
      {description ? (
        <Text style={styles.description} numberOfLines={1}>
          {description}
        </Text>
      ) : null}
      {startingPrice !== undefined ? (
        <Text style={styles.price}>Starts ₹{startingPrice}</Text>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 110,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 24,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  price: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
