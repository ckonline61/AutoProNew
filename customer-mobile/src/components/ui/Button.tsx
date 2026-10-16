import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Button label text */
  title: string;
  /** Press handler */
  onPress?: (event: GestureResponderEvent) => void;
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size variant */
  size?: ButtonSize;
  /** Disables user interaction and dims appearance */
  disabled?: boolean;
  /** Replaces content with a loading spinner */
  loading?: boolean;
  /** Left icon name from Ionicons */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Optional right icon name from Ionicons */
  iconRight?: keyof typeof Ionicons.glyphMap;
  /** Expand button to fill container width */
  fullWidth?: boolean;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Custom label text style */
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const isInteractive = !disabled && !loading;

  // Determine colors based on variant
  const getVariantStyles = (): {
    container: ViewStyle;
    text: TextStyle;
    iconColor: string;
    spinnerColor: string;
  } => {
    switch (variant) {
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText,
          iconColor: COLORS.primary,
          spinnerColor: COLORS.primary,
        };
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
          iconColor: COLORS.textPrimary,
          spinnerColor: COLORS.textPrimary,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
          iconColor: COLORS.primary,
          spinnerColor: COLORS.primary,
        };
      case 'primary':
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
          iconColor: COLORS.white,
          spinnerColor: COLORS.white,
        };
    }
  };

  // Determine sizes
  const getSizeStyles = (): {
    container: ViewStyle;
    text: TextStyle;
    iconSize: number;
    gap: number;
  } => {
    switch (size) {
      case 'sm':
        return {
          container: styles.sizeSm,
          text: styles.textSm,
          iconSize: 16,
          gap: 6,
        };
      case 'lg':
        return {
          container: styles.sizeLg,
          text: styles.textLg,
          iconSize: 22,
          gap: 10,
        };
      case 'md':
      default:
        return {
          container: styles.sizeMd,
          text: styles.textMd,
          iconSize: 18,
          gap: 8,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      accessibilityLabel={title}
      style={[
        styles.baseContainer,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        variant === 'primary' && !disabled && SHADOWS.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size={size === 'lg' ? 'small' : 'small'}
          color={variantStyles.spinnerColor}
        />
      ) : (
        <>
          {icon ? (
            <Ionicons
              name={icon}
              size={sizeStyles.iconSize}
              color={variantStyles.iconColor}
              style={{ marginRight: sizeStyles.gap }}
            />
          ) : null}
          <Text
            style={[
              styles.baseText,
              variantStyles.text,
              sizeStyles.text,
              textStyle,
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {iconRight ? (
            <Ionicons
              name={iconRight}
              size={sizeStyles.iconSize}
              color={variantStyles.iconColor}
              style={{ marginLeft: sizeStyles.gap }}
            />
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
  baseText: {
    textAlign: 'center',
  },

  // ── Variants ──────────────────────────────────────────
  primaryContainer: {
    backgroundColor: COLORS.primary,
    borderColor: 'transparent',
    borderWidth: 0,
  },
  primaryText: {
    color: COLORS.white,
  },

  secondaryContainer: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  secondaryText: {
    color: COLORS.primary,
  },

  outlineContainer: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
    borderWidth: 1.5,
  },
  outlineText: {
    color: COLORS.textPrimary,
  },

  ghostContainer: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  ghostText: {
    color: COLORS.primary,
  },

  // ── Sizes ─────────────────────────────────────────────
  sizeSm: {
    paddingVertical: SPACING.xs + 2, // 6px
    paddingHorizontal: SPACING.md,   // 12px
    minHeight: 34,
    borderRadius: RADII.sm,
  },
  textSm: {
    ...TYPOGRAPHY.buttonSmall,
  },

  sizeMd: {
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,   // 16px
    minHeight: 46,
    borderRadius: RADII.md,
  },
  textMd: {
    ...TYPOGRAPHY.buttonMedium,
  },

  sizeLg: {
    paddingVertical: 16,             // 16px height padding per prompt
    paddingHorizontal: SPACING.xl,   // 20px
    minHeight: 54,
    borderRadius: 16,               // 16px radius per prompt
  },
  textLg: {
    ...TYPOGRAPHY.buttonLarge,       // Bold text per prompt
  },
});

export default Button;
