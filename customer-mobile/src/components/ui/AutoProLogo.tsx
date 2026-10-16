import React from 'react';
import { View, Text, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../../theme';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const LOGO_IMAGE = require('../../../assets/logo.jpg');

export interface AutoProLogoProps {
  /** Size variant: sm (32px), md (48px), lg (80px), xl (120px) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Optional tagline shown below the brand name */
  tagline?: string;
  /** Whether to show the "AUTO PRO" text next to / under the logo */
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
    imageSize: 36,
    titleSize: 14,
    taglineSize: 10,
    gap: SPACING.xs,
  },
  md: {
    imageSize: 52,
    titleSize: 18,
    taglineSize: 11,
    gap: SPACING.sm,
  },
  lg: {
    imageSize: 90,
    titleSize: 24,
    taglineSize: 13,
    gap: SPACING.md,
  },
  xl: {
    imageSize: 130,
    titleSize: 28,
    taglineSize: 14,
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
  const isVertical = layout ? layout === 'vertical' : size === 'lg' || size === 'xl';
  const shouldShowText = showBrandName !== undefined ? showBrandName : !!tagline || size === 'lg' || size === 'xl';

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
      {/* Actual brand logo image */}
      <Image
        source={LOGO_IMAGE}
        style={{
          width: config.imageSize,
          height: config.imageSize,
        }}
        resizeMode="contain"
      />

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
