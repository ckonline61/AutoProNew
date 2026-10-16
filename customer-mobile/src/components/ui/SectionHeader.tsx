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
import { COLORS, TYPOGRAPHY, SPACING } from '../../theme';

export interface SectionHeaderProps {
  /** Section heading title */
  title: string;
  /** Optional action text on the right (e.g. 'View All', 'See More') */
  actionText?: string;
  /** Handler fired when the action button is pressed */
  onAction?: (event: GestureResponderEvent) => void;
  /** Optional subtitle displayed beneath the title */
  subtitle?: string;
  /** Whether to show a trailing chevron icon next to actionText (default: true) */
  showChevron?: boolean;
  /** Custom right-side element override */
  rightElement?: React.ReactNode;
  /** Container style */
  style?: StyleProp<ViewStyle>;
  /** Title text style override */
  titleStyle?: StyleProp<TextStyle>;
  /** Action text style override */
  actionStyle?: StyleProp<TextStyle>;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionText,
  onAction,
  subtitle,
  showChevron = true,
  rightElement,
  style,
  titleStyle,
  actionStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Title & optional subtitle on the left */}
      <View style={styles.titleColumn}>
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* Action link or custom element on the right */}
      {rightElement ? (
        rightElement
      ) : actionText && onAction ? (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.7}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={styles.actionContainer}
          accessibilityRole="button"
          accessibilityLabel={`${actionText} for ${title}`}
        >
          <Text style={[styles.actionText, actionStyle]}>{actionText}</Text>
          {showChevron && (
            <Ionicons
              name="chevron-forward"
              size={14}
              color={COLORS.primary}
              style={styles.chevron}
            />
          )}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  titleColumn: {
    flex: 1,
    marginRight: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
  },
  subtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  chevron: {
    marginLeft: 2,
  },
});

export default SectionHeader;
