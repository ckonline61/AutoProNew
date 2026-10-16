import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../../theme';

export interface AutoProLogoProps {
  /** Size variant: sm (32px), md (48px), lg (80px) */
  size?: 'sm' | 'md' | 'lg';
  /** Optional tagline shown below or next to the brand name */
  tagline?: string;
  /** Whether to show the "AUTO PRO" text next to / under the emblem */
  showBrandName?: boolean;
  /** Layout direction: horizontal (typical in headers) or vertical (splash / auth) */
  layout?: 'horizontal' | 'vertical';
  /** Custom color for the "AUTO" text portion (defaults to COLORS.textPrimary) */
  textColor?: string;
  /** Optional container style */
  style?: StyleProp<ViewStyle>;
}

const SIZE_CONFIG = {
  sm: {
    circle: 32,
    fontSize: 14,
    titleSize: 16,
    taglineSize: 10,
    gap: SPACING.sm,
  },
  md: {
    circle: 48,
    fontSize: 20,
    titleSize: 20,
    taglineSize: 11,
    gap: SPACING.md,
  },
  lg: {
    circle: 80,
    fontSize: 34,
    titleSize: 26,
    taglineSize: 13,
    gap: SPACING.md,
  },
};

const AutoProLogo: React.FC<AutoProLogoProps> = ({
  size = 'md',
  tagline,
  showBrandName,
  layout,
  textColor = COLORS.textPrimary,
  style,
}) => {
  const config = SIZE_CONFIG[size];
  const isVertical = layout ? layout === 'vertical' : size === 'lg';
  const shouldShowText = showBrandName !== undefined ? showBrandName : !!tagline || size === 'lg';

  return (
    <View
      style={[
        styles.container,
        isVertical ? styles.verticalContainer : styles.horizontalContainer,
        { gap: config.gap },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={`Auto Pro Logo${tagline ? ` - ${tagline}` : ''}`}
    >
      {/* Red emblem circle with white "AP" letters */}
      <View
        style={[
          styles.emblem,
          {
            width: config.circle,
            height: config.circle,
            borderRadius: config.circle / 2,
          },
        ]}
      >
        <Text style={[styles.emblemText, { fontSize: config.fontSize }]}>AP</Text>
      </View>

      {/* Brand title + optional tagline */}
      {shouldShowText && (
        <View style={isVertical ? styles.verticalTextGroup : styles.horizontalTextGroup}>
          <Text style={[styles.brandTitle, { fontSize: config.titleSize }]}>
            <Text style={{ color: textColor }}>AUTO </Text>
            <Text style={{ color: COLORS.primary }}>PRO</Text>
          </Text>
          {tagline ? (
            <Text
              style={[
                styles.tagline,
                { fontSize: config.taglineSize },
                isVertical && styles.centerText,
              ]}
              numberOfLines={2}
            >
              {tagline}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblem: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  emblemText: {
    color: COLORS.white,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  horizontalTextGroup: {
    justifyContent: 'center',
  },
  verticalTextGroup: {
    alignItems: 'center',
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  tagline: {
    color: COLORS.textSecondary,
    fontWeight: '400',
    marginTop: 2,
  },
  centerText: {
    textAlign: 'center',
  },
});

export default AutoProLogo;
