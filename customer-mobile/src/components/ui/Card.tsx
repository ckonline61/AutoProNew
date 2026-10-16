import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { COLORS, RADII, SHADOWS, SPACING } from '../../theme';

export type CardPadding = keyof typeof SPACING | number;

export interface CardProps {
  /** Card children */
  children: React.ReactNode;
  /** Optional container style */
  style?: StyleProp<ViewStyle>;
  /** If provided, renders Card as an interactive TouchableOpacity */
  onPress?: (event: GestureResponderEvent) => void;
  /** Inner padding (defaults to 'lg' = 16px) */
  padding?: CardPadding;
  /** Elevation / shadow depth (defaults to 'md') */
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show a subtle border (defaults to false) */
  border?: boolean;
  /** Active opacity when touched (defaults to 0.7) */
  activeOpacity?: number;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padding = 'lg',
  elevation = 'md',
  border = false,
  activeOpacity = 0.7,
  accessibilityLabel,
}) => {
  const paddingValue =
    typeof padding === 'number'
      ? padding
      : SPACING[padding] ?? SPACING.lg;

  const cardStyles: StyleProp<ViewStyle> = [
    styles.card,
    SHADOWS[elevation] ?? SHADOWS.md,
    { padding: paddingValue },
    border && styles.border,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPress={onPress}
        style={cardStyles}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md, // 12px
  },
  border: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
});

export default Card;
