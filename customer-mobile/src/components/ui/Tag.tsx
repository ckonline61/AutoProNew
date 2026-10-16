import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SPACING } from '../../theme';

export interface TagProps {
  /** Text label displayed in tag (e.g. 'Petrol', 'Manual', 'SUV') */
  label: string;
  /** Optional theme color or hex string used for tinting background and text */
  color?: string;
  /** Optional Ionicons icon name displayed on the left */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Optional click handler making tag interactive */
  onPress?: (event: GestureResponderEvent) => void;
  /** Optional custom container style */
  style?: StyleProp<ViewStyle>;
  /** Optional custom text style */
  textStyle?: StyleProp<TextStyle>;
}

const Tag: React.FC<TagProps> = ({
  label,
  color,
  icon,
  onPress,
  style,
  textStyle,
}) => {
  // If color is provided, generate a tinted background (12% opacity)
  const isCustomColor = !!color;
  const textColor = isCustomColor ? color : COLORS.gray700;
  const iconColor = isCustomColor ? color : COLORS.gray600;

  // Background styling: tinted if color provided, else light gray
  const getBackgroundColor = () => {
    if (!color) return COLORS.gray100;
    if (color === COLORS.primary) return COLORS.primaryLight;
    if (color === COLORS.success) return COLORS.successLight;
    if (color === COLORS.warning) return COLORS.warningLight;
    if (color === COLORS.info) return COLORS.infoLight;

    // Check if color is hex
    if (color.startsWith('#') && color.length === 7) {
      return `${color}1A`; // ~10% opacity in hex
    }
    return COLORS.gray100;
  };

  const containerStyles: StyleProp<ViewStyle> = [
    styles.container,
    { backgroundColor: getBackgroundColor() },
    style,
  ];

  const content = (
    <>
      {icon ? (
        <Ionicons
          name={icon}
          size={12}
          color={iconColor}
          style={styles.icon}
        />
      ) : null}
      <Text
        style={[
          styles.text,
          { color: textColor },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={containerStyles}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyles}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADII.full,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm + 2, // 10px
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});

export default Tag;
