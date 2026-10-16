import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SPACING } from '../../theme';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  /** Text content displayed inside badge */
  text: string;
  /** Semantic color variant */
  variant?: BadgeVariant;
  /** Size variant */
  size?: BadgeSize;
  /** Whether to show a colored dot indicator (default: true) */
  showDot?: boolean;
  /** Optional Ionicons icon displayed in place of the dot */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Custom text style */
  textStyle?: StyleProp<TextStyle>;
}

interface VariantColorConfig {
  bg: string;
  color: string;
}

const VARIANT_MAP: Record<BadgeVariant, VariantColorConfig> = {
  success: {
    bg: COLORS.successLight,
    color: COLORS.success,
  },
  warning: {
    bg: COLORS.warningLight,
    color: COLORS.warning,
  },
  error: {
    bg: COLORS.errorLight,
    color: COLORS.error,
  },
  info: {
    bg: COLORS.infoLight,
    color: COLORS.info,
  },
  default: {
    bg: COLORS.gray100,
    color: COLORS.gray600,
  },
};

const Badge: React.FC<BadgeProps> = ({
  text,
  variant = 'default',
  size = 'md',
  showDot = true,
  icon,
  style,
  textStyle,
}) => {
  const { bg, color } = VARIANT_MAP[variant] || VARIANT_MAP.default;
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        isSm ? styles.badgeSm : styles.badgeMd,
        { backgroundColor: bg },
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={isSm ? 12 : 14}
          color={color}
          style={styles.icon}
        />
      ) : showDot ? (
        <View
          style={[
            styles.dot,
            isSm ? styles.dotSm : styles.dotMd,
            { backgroundColor: color },
          ]}
        />
      ) : null}

      <Text
        style={[
          styles.text,
          isSm ? styles.textSm : styles.textMd,
          { color },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADII.full,
  },
  badgeSm: {
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm, // 8px
  },
  badgeMd: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  dot: {
    borderRadius: RADII.full,
    marginRight: 6,
  },
  dotSm: {
    width: 6,
    height: 6,
  },
  dotMd: {
    width: 7,
    height: 7,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: 11,
    lineHeight: 14,
  },
  textMd: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default Badge;
