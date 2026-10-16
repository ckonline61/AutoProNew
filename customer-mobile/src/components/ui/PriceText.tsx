import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { COLORS, RADII, SPACING } from '../../theme';

export type PriceTextSize = 'sm' | 'md' | 'lg';

export interface PriceTextProps {
  /** Current price value (number or formatted string) */
  price: number | string;
  /** Original / MRP price (number or formatted string), shown with strikethrough */
  originalPrice?: number | string;
  /** Size variant */
  size?: PriceTextSize;
  /** Custom color for the active price (defaults to COLORS.textPrimary) */
  color?: string;
  /** Whether to show the discount percentage badge when originalPrice > price */
  showDiscountBadge?: boolean;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Text style override for the active price */
  priceStyle?: StyleProp<TextStyle>;
}

/** Formats a numeric price to Indian comma separated format (e.g. 12,499) */
const formatCurrency = (val: number | string): string => {
  if (typeof val === 'number') {
    return val.toLocaleString('en-IN');
  }
  const parsed = Number(val);
  if (!isNaN(parsed)) {
    return parsed.toLocaleString('en-IN');
  }
  return String(val);
};

const SIZE_CONFIG = {
  sm: {
    priceSize: 14,
    symbolSize: 12,
    originalSize: 11,
    badgeFontSize: 9,
    badgePaddingH: 4,
    badgePaddingV: 1,
    gap: SPACING.xs,
  },
  md: {
    priceSize: 18,
    symbolSize: 15,
    originalSize: 13,
    badgeFontSize: 10,
    badgePaddingH: 6,
    badgePaddingV: 2,
    gap: SPACING.sm,
  },
  lg: {
    priceSize: 24,
    symbolSize: 20,
    originalSize: 15,
    badgeFontSize: 11,
    badgePaddingH: 8,
    badgePaddingV: 3,
    gap: SPACING.sm,
  },
};

const PriceText: React.FC<PriceTextProps> = ({
  price,
  originalPrice,
  size = 'md',
  color = COLORS.textPrimary,
  showDiscountBadge = true,
  style,
  priceStyle,
}) => {
  const config = SIZE_CONFIG[size];

  const numPrice = typeof price === 'number' ? price : parseFloat(String(price));
  const numOriginal =
    originalPrice !== undefined
      ? typeof originalPrice === 'number'
        ? originalPrice
        : parseFloat(String(originalPrice))
      : undefined;

  let discountPercent = 0;
  if (
    numOriginal !== undefined &&
    !isNaN(numOriginal) &&
    !isNaN(numPrice) &&
    numOriginal > numPrice
  ) {
    discountPercent = Math.round(((numOriginal - numPrice) / numOriginal) * 100);
  }

  return (
    <View style={[styles.container, { gap: config.gap }, style]}>
      {/* Current price with ₹ symbol */}
      <View style={styles.priceRow}>
        <Text style={[styles.currencySymbol, { fontSize: config.symbolSize, color }]}>
          ₹
        </Text>
        <Text
          style={[
            styles.priceText,
            { fontSize: config.priceSize, color },
            priceStyle,
          ]}
        >
          {formatCurrency(price)}
        </Text>
      </View>

      {/* Strikethrough original price if available */}
      {originalPrice !== undefined ? (
        <Text style={[styles.originalPrice, { fontSize: config.originalSize }]}>
          ₹{formatCurrency(originalPrice)}
        </Text>
      ) : null}

      {/* Discount badge if original > current */}
      {showDiscountBadge && discountPercent > 0 ? (
        <View
          style={[
            styles.discountBadge,
            {
              paddingHorizontal: config.badgePaddingH,
              paddingVertical: config.badgePaddingV,
            },
          ]}
        >
          <Text style={[styles.discountText, { fontSize: config.badgeFontSize }]}>
            {discountPercent}% OFF
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currencySymbol: {
    fontWeight: '700',
    marginRight: 1,
  },
  priceText: {
    fontWeight: '700',
  },
  originalPrice: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    fontWeight: '400',
  },
  discountBadge: {
    backgroundColor: COLORS.successLight,
    borderRadius: RADII.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountText: {
    color: COLORS.success,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default PriceText;
