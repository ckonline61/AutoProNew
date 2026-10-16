import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { HomeStack } from './HomeStack';
import { BookingsStack } from './BookingsStack';
import { MarketplaceStack } from './MarketplaceStack';
import { ProfileStack } from './ProfileStack';
import { OffersStack } from './OffersStack';
import { SavedStack } from './SavedStack';
import { COLORS } from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Home:     { focused: 'home',           unfocused: 'home-outline' },
  Bookings: { focused: 'calendar',       unfocused: 'calendar-outline' },
  Offers:   { focused: 'pricetag',       unfocused: 'pricetag-outline' },
  Saved:    { focused: 'heart',          unfocused: 'heart-outline' },
  Profile:  { focused: 'person-circle',  unfocused: 'person-circle-outline' },
};

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsStack}
        options={{ tabBarLabel: 'Bookings' }}
      />
      <Tab.Screen
        name="Offers"
        component={OffersStack}
        options={{ tabBarLabel: 'Offers' }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedStack}
        options={{ tabBarLabel: 'Saved' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
