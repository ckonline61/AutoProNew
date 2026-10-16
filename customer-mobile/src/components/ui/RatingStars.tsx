import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING } from '../../theme';

export type RatingStarsSize = 'sm' | 'md';

export interface RatingStarsProps {
  /** Numeric rating value (e.g. 4.5) */
  rating: number;
  /** Optional review count displayed as "(120)" */
  reviewCount?: number;
  /** Size variant */
  size?: RatingStarsSize;
  /** Maximum number of stars to display (default: 5) */
  maxStars?: number;
  /** Whether to show numeric rating text (default: true) */
  showNumeric?: boolean;
  /** Whether to show the star icons (default: true) */
  showStars?: boolean;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
}

const SIZE_CONFIG = {
  sm: {
    starSize: 13,
    starGap: 1,
    ratingFontSize: 12,
    countFontSize: 11,
    gap: SPACING.xs,
  },
  md: {
    starSize: 16,
    starGap: 2,
    ratingFontSize: 14,
    countFontSize: 12,
    gap: SPACING.sm,
  },
};

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewCount,
  size = 'md',
  maxStars = 5,
  showNumeric = true,
  showStars = true,
  style,
}) => {
  const config = SIZE_CONFIG[size];
  const clampedRating = Math.max(0, Math.min(maxStars, rating || 0));

  const renderStar = (index: number) => {
    const starNumber = index + 1;
    let iconName: keyof typeof Ionicons.glyphMap = 'star-outline';

    if (clampedRating >= starNumber) {
      iconName = 'star';
    } else if (clampedRating >= starNumber - 0.5) {
      iconName = 'star-half';
    }

    return (
      <Ionicons
        key={index}
        name={iconName}
        size={config.starSize}
        color={COLORS.starGold}
        style={{ marginRight: index < maxStars - 1 ? config.starGap : 0 }}
      />
    );
  };

  return (
    <View style={[styles.container, { gap: config.gap }, style]}>
      {showStars && (
        <View style={styles.starsRow}>
          {Array.from({ length: maxStars }).map((_, i) => renderStar(i))}
        </View>
      )}

      {showNumeric && (
        <Text style={[styles.ratingText, { fontSize: config.ratingFontSize }]}>
          {clampedRating.toFixed(1)}
        </Text>
      )}

      {reviewCount !== undefined && (
        <Text style={[styles.countText, { fontSize: config.countFontSize }]}>
          ({reviewCount.toLocaleString()})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  countText: {
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
});

export default RatingStars;
