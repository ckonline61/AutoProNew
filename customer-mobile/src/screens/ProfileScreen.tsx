import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { useCustomerData } from '../contexts/CustomerDataContext';
import { Card, Avatar } from '../components/ui';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  badge?: string | number;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { vehicles, bookings, notifications } = useCustomerData();

  const completedBookingsCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Auto Pro?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => void logout(),
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    {
      id: 'vehicles',
      label: 'My Vehicles',
      icon: 'car-sport',
      onPress: () => navigation.navigate('VehicleForm'),
      badge: vehicles.length > 0 ? vehicles.length : undefined,
    },
    {
      id: 'addresses',
      label: 'My Addresses',
      icon: 'location',
      onPress: () => navigation.navigate('Addresses'),
    },
    {
      id: 'payments',
      label: 'Payment Methods',
      icon: 'card',
      onPress: () =>
        Alert.alert(
          'Payment Methods',
          'Supported methods: UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking & Cash on Delivery.'
        ),
    },
    {
      id: 'history',
      label: 'Service History',
      icon: 'document-text',
      onPress: () => navigation.navigate('ServiceHistory'),
      badge: completedBookingsCount > 0 ? completedBookingsCount : undefined,
    },
    {
      id: 'reviews',
      label: 'My Reviews',
      icon: 'star',
      onPress: () =>
        Alert.alert(
          'My Reviews',
          'You have rated 2 completed services with 5 stars. Keep your feedback coming to help our mechanics!'
        ),
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: 'notifications',
      onPress: () => navigation.navigate('Notifications'),
      badge: unreadNotifCount > 0 ? unreadNotifCount : undefined,
    },
    {
      id: 'support',
      label: 'Help & Support',
      icon: 'help-circle',
      onPress: () => navigation.navigate('Support'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Profile Card */}
        <Card style={styles.profileCard} padding="lg" elevation="md">
          {/* Settings Gear Top-Right */}
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Account')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Account settings"
          >
            <Ionicons name="settings-outline" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>

          {/* User Avatar Circle */}
          <View style={styles.avatarWrapper}>
            <Avatar
              name={user?.name || 'Customer'}
              size={80}
              backgroundColor={COLORS.primaryLight}
              textColor={COLORS.primary}
            />
          </View>

          {/* User Details */}
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'Auto Pro Customer'}</Text>
            <Text style={styles.userPhone}>
              {user?.phone ? user.phone : '+91 98765 43210'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || 'customer@autopro.com'}
            </Text>
          </View>

          <View style={styles.cardDivider} />

          {/* Stats Row (3 Columns) */}
          <View style={styles.statsRow}>
            {/* My Vehicles */}
            <TouchableOpacity
              style={styles.statColumn}
              onPress={() => navigation.navigate('VehicleForm')}
              activeOpacity={0.7}
            >
              <Text style={styles.statNumber}>{vehicles.length}</Text>
              <Text style={styles.statLabel}>My Vehicles</Text>
            </TouchableOpacity>

            <View style={styles.statDivider} />

            {/* Total Bookings */}
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>{bookings.length}</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
            </View>

            <View style={styles.statDivider} />

            {/* Saved Cars */}
            <View style={styles.statColumn}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Saved Cars</Text>
            </View>
          </View>
        </Card>

        {/* Menu List */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuSectionTitle}>Account & Services</Text>

          <Card style={styles.menuCard} padding={0} elevation="sm">
            {menuItems.map((item, index) => {
              const isLast = index === menuItems.length - 1;

              return (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.menuItemRow}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    {/* Icon in light background circle */}
                    <View style={styles.menuIconCircle}>
                      <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                    </View>

                    {/* Label */}
                    <Text style={styles.menuItemLabel}>{item.label}</Text>

                    {/* Optional Badge */}
                    {item.badge !== undefined && (
                      <View style={styles.menuBadge}>
                        <Text style={styles.menuBadgeText}>{item.badge}</Text>
                      </View>
                    )}

                    {/* Chevron Right */}
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={COLORS.gray400}
                      style={styles.chevron}
                    />
                  </TouchableOpacity>

                  {!isLast && <View style={styles.menuDivider} />}
                </View>
              );
            })}
          </Card>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.emergencyRed} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version Info */}
        <Text style={styles.versionText}>Auto Pro Mobile v2.4.0 • Built with ❤️ for Drivers</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    position: 'relative',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  settingsBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOWS.sm,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  userPhone: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  userEmail: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cardDivider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary,
    fontWeight: '800',
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },
  menuContainer: {
    marginBottom: SPACING.xl,
  },
  menuSectionTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    overflow: 'hidden',
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuItemLabel: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  menuBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: SPACING.sm,
  },
  menuBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  chevron: {
    marginLeft: 4,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginLeft: 58,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: RADII.md,
    paddingVertical: 14,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  logoutText: {
    ...TYPOGRAPHY.buttonMedium,
    color: COLORS.emergencyRed,
    fontWeight: '700',
  },
  versionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
