import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../../theme';

export type DividerSpacing = keyof typeof SPACING | number;

export interface DividerProps {
  /** Vertical margin for horizontal divider, or horizontal margin for vertical divider (default: 'md' = 12px) */
  spacing?: DividerSpacing;
  /** Custom line color (defaults to COLORS.divider) */
  color?: string;
  /** Thickness of divider line (default: 1) */
  thickness?: number;
  /** Orientation of the divider (default: 'horizontal') */
  orientation?: 'horizontal' | 'vertical';
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
}

const Divider: React.FC<DividerProps> = ({
  spacing = 'md',
  color = COLORS.divider,
  thickness = 1,
  orientation = 'horizontal',
  style,
}) => {
  const marginValue =
    typeof spacing === 'number'
      ? spacing
      : SPACING[spacing] ?? SPACING.md;

  const isHorizontal = orientation === 'horizontal';

  return (
    <View
      style={[
        isHorizontal
          ? {
              height: thickness,
              backgroundColor: color,
              marginVertical: marginValue,
              width: '100%',
            }
          : {
              width: thickness,
              backgroundColor: color,
              marginHorizontal: marginValue,
              alignSelf: 'stretch',
            },
        styles.divider,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    opacity: 1,
  },
});

export default Divider;
