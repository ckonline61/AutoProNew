import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SPACING, TYPOGRAPHY } from '../../theme';

export interface SearchBarProps {
  /** Input value */
  value: string;
  /** Callback fired when text changes */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Optional handler when filter button is pressed; renders filter button when passed */
  onFilterPress?: () => void;
  /** Optional handler when search is submitted */
  onSubmitEditing?: (e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => void;
  /** Optional callback fired when clear button is tapped */
  onClear?: () => void;
  /** Disables typing and allows tapping as a trigger button */
  onPress?: () => void;
  /** Whether the input is editable (defaults to true) */
  editable?: boolean;
  /** Whether to auto-focus when mounted */
  autoFocus?: boolean;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Custom text input style */
  inputStyle?: StyleProp<TextStyle>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search services, packages, cars...',
  onFilterPress,
  onSubmitEditing,
  onClear,
  onPress,
  editable = true,
  autoFocus = false,
  style,
  inputStyle,
}) => {
  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  const isTouchableOnly = !editable && !!onPress;

  const content = (
    <View style={[styles.container, style]}>
      {/* Search icon */}
      <Ionicons
        name="search"
        size={18}
        color={COLORS.textMuted}
        style={styles.searchIcon}
      />

      {/* Text input */}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        editable={editable && !isTouchableOnly}
        autoFocus={autoFocus}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        style={[styles.input, inputStyle]}
        pointerEvents={isTouchableOnly ? 'none' : 'auto'}
      />

      {/* Clear button (when value is present and editable) */}
      {editable && value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          style={styles.actionBtn}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={18} color={COLORS.gray400} />
        </TouchableOpacity>
      )}

      {/* Filter button */}
      {onFilterPress && (
        <>
          <View style={styles.filterDivider} />
          <TouchableOpacity
            onPress={onFilterPress}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel="Filter search"
          >
            <Ionicons name="options-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  if (isTouchableOnly) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100, // #F3F4F6
    borderRadius: RADII.md,         // 12px
    height: 46,
    paddingHorizontal: SPACING.md,  // 12px
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    paddingVertical: 0, // Android alignment fix
  },
  actionBtn: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.sm,
  },
});

export default SearchBar;
