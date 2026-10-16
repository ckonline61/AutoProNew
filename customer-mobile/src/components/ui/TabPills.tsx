import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SPACING } from '../../theme';

export interface TabPillItem {
  /** Unique key identifying tab */
  key: string;
  /** Label text */
  label: string;
  /** Optional badge count */
  count?: number;
  /** Optional icon displayed before label */
  icon?: keyof typeof Ionicons.glyphMap;
}

export interface TabPillsProps {
  /** List of tabs to render */
  tabs: TabPillItem[];
  /** Key of currently selected tab */
  activeTab: string;
  /** Callback fired when a tab is pressed */
  onTabChange: (key: string) => void;
  /** ScrollView wrapper style */
  style?: StyleProp<ViewStyle>;
  /** Content container style inside ScrollView */
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Custom text style */
  labelStyle?: StyleProp<TextStyle>;
}

const TabPills: React.FC<TabPillsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  style,
  contentContainerStyle,
  labelStyle,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.scrollView, style]}
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        const iconColor = isActive ? COLORS.white : COLORS.textSecondary;

        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.75}
            onPress={() => onTabChange(tab.key)}
            style={[
              styles.pill,
              isActive ? styles.activePill : styles.inactivePill,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${tab.label}${tab.count !== undefined ? ` (${tab.count})` : ''}`}
          >
            {tab.icon ? (
              <Ionicons
                name={tab.icon}
                size={14}
                color={iconColor}
                style={styles.icon}
              />
            ) : null}

            <Text
              style={[
                styles.label,
                isActive ? styles.activeLabel : styles.inactiveLabel,
                labelStyle,
              ]}
            >
              {tab.label}
            </Text>

            {tab.count !== undefined ? (
              <View
                style={[
                  styles.countBadge,
                  isActive ? styles.activeCountBadge : styles.inactiveCountBadge,
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isActive ? styles.activeCountText : styles.inactiveCountText,
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg, // 16px screen padding
    gap: SPACING.sm,              // 8px between pills
    paddingVertical: SPACING.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADII.full,     // 999px pill shape
  },
  activePill: {
    backgroundColor: COLORS.primary,
  },
  inactivePill: {
    backgroundColor: COLORS.gray100, // #F3F4F6
  },
  icon: {
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
  },
  activeLabel: {
    color: COLORS.white,
    fontWeight: '600',
  },
  inactiveLabel: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADII.full,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  inactiveCountBadge: {
    backgroundColor: COLORS.gray200,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeCountText: {
    color: COLORS.white,
  },
  inactiveCountText: {
    color: COLORS.gray600,
  },
});

export default TabPills;
