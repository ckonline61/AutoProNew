/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SHADOWS, SPACING } from '../theme';

export interface ProfileScreenProps {
  user: any;
  profile: any;
  onLogout: () => void;
  onNavigateEarnings?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  profile,
  onLogout,
  onNavigateEarnings,
}) => {
  const getInitials = (name?: string): string => {
    if (!name) return 'MP';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of Auto Pro Mechanic?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: onLogout,
      },
    ]);
  };

  const handleSupport = () => {
    Alert.alert(
      'Auto Pro Partner Support',
      'For immediate roadside coordination or partner escalation:\n\nPhone: +91 1800-288-6776\nEmail: partners@autopro.in\nHours: 24/7 Priority Support'
    );
  };

  const handleServiceHistory = () => {
    Alert.alert(
      'Service History',
      `You have completed ${profile?.totalJobs || 0} jobs with Auto Pro.\nTotal verified service volume: ₹${(profile?.totalEarnings || 0).toLocaleString('en-IN')}`
    );
  };

  const handleSettings = () => {
    Alert.alert(
      'Settings',
      'App Version: v0.1.0\nPush Notifications: Active\nLocation Sharing: On demand during transit\nSound Alerts: Enabled'
    );
  };

  const approvalStatus = (profile?.approvalStatus || 'PENDING').toUpperCase();
  let statusBadgeBg: string = COLORS.warningLight;
  let statusBadgeText: string = COLORS.warning;
  let statusBadgeLabel = 'Pending Review';
  let statusIcon: keyof typeof Ionicons.glyphMap = 'time-outline';

  if (approvalStatus === 'APPROVED') {
    statusBadgeBg = COLORS.successLight;
    statusBadgeText = COLORS.success;
    statusBadgeLabel = 'Approved Partner';
    statusIcon = 'checkmark-circle';
  } else if (approvalStatus === 'REJECTED') {
    statusBadgeBg = COLORS.errorLight;
    statusBadgeText = COLORS.error;
    statusBadgeLabel = 'Application Rejected';
    statusIcon = 'close-circle';
  }

  const specializations: string[] =
    Array.isArray(profile?.specializations) && profile.specializations.length > 0
      ? profile.specializations
      : ['General Service', 'Brake Systems', 'Engine Diagnostics', 'Electrical'];

  const experienceYears = profile?.experience ?? 4;

  const menuItems = [
    {
      id: 'earnings',
      label: 'My Earnings',
      icon: 'cash-outline' as const,
      onPress: () => {
        if (onNavigateEarnings) {
          onNavigateEarnings();
        } else {
          Alert.alert(
            'My Earnings',
            `Total Career Volume: ₹${(profile?.totalEarnings || 0).toLocaleString('en-IN')}\nCompleted Jobs: ${profile?.totalJobs || 0}`
          );
        }
      },
    },
    {
      id: 'history',
      label: 'Service History',
      icon: 'document-text-outline' as const,
      onPress: handleServiceHistory,
      badge: profile?.totalJobs ? `${profile.totalJobs}` : undefined,
    },
    {
      id: 'support',
      label: 'Help & Support',
      icon: 'help-circle-outline' as const,
      onPress: handleSupport,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings-outline' as const,
      onPress: handleSettings,
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Bar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={handleSettings}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={22} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {/* Avatar Circle 64px */}
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>{getInitials(user?.name)}</Text>
        </View>

        {/* User Info */}
        <Text style={styles.userName}>{user?.name || 'Auto Pro Mechanic'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'mechanic@autopro.in'}</Text>
        <Text style={styles.userPhone}>
          {user?.phone ? user.phone : '+91 98765 43210'}
        </Text>

        {/* Approval Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusBadgeBg }]}>
          <Ionicons name={statusIcon} size={14} color={statusBadgeText} style={{ marginRight: 5 }} />
          <Text style={[styles.statusBadgeText, { color: statusBadgeText }]}>
            {statusBadgeLabel}
          </Text>
        </View>

        <View style={styles.cardDivider} />

        {/* Stats Row (3 Columns) */}
        <View style={styles.statsRow}>
          {/* Jobs Done */}
          <View style={styles.statCol}>
            <Text style={styles.statValue}>{profile?.totalJobs ?? 0}</Text>
            <Text style={styles.statLabel}>Jobs Done</Text>
          </View>

          <View style={styles.statSeparator} />

          {/* Rating */}
          <View style={styles.statCol}>
            <View style={styles.ratingBox}>
              <Text style={styles.statValue}>
                {(profile?.rating ?? 5.0).toFixed(1)}
              </Text>
              <Ionicons
                name="star"
                size={14}
                color={COLORS.starGold}
                style={{ marginLeft: 3 }}
              />
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>

          <View style={styles.statSeparator} />

          {/* Earnings */}
          <View style={styles.statCol}>
            <Text style={[styles.statValue, styles.earningsText]}>
              ₹{Number(profile?.totalEarnings ?? 0).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
        </View>
      </View>

      {/* Specializations Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="construct-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Specializations</Text>
        </View>
        <View style={styles.tagWrap}>
          {specializations.map((spec, index) => (
            <View key={index} style={styles.tagPill}>
              <Text style={styles.tagPillText}>{spec}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Experience Section */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="ribbon-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.sectionTitle}>Experience</Text>
        </View>
        <View style={styles.experienceContent}>
          <View style={styles.expIconBox}>
            <Ionicons name="briefcase-outline" size={20} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.experienceText}>{experienceYears} Years of Verified Experience</Text>
            <Text style={styles.experienceSubtext}>Automotive diagnosis, maintenance & emergency repair</Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuCard}>
        {menuItems.map((item, index) => {
          const isLast = index === menuItems.length - 1;
          return (
            <View key={item.id}>
              <TouchableOpacity
                style={styles.menuRow}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconCircle}>
                  <Ionicons name={item.icon} size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.badge ? (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeText}>{item.badge}</Text>
                  </View>
                ) : null}
                <Ionicons name="chevron-forward" size={18} color={COLORS.gray400} />
              </TouchableOpacity>
              {!isLast && <View style={styles.menuDivider} />}
            </View>
          );
        })}
      </View>

      {/* Red Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Version Caption */}
      <Text style={styles.versionText}>Auto Pro Mechanic Partner v0.1.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: RADII.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarInitials: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADII.full,
    marginBottom: SPACING.sm,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardDivider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.black,
  },
  earningsText: {
    color: COLORS.primary,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
    fontWeight: '500',
  },
  statSeparator: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.full,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  experienceContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  expIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  experienceText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  experienceSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  menuRow: {
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
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  menuBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.full,
    marginRight: 6,
  },
  menuBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 62,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    paddingVertical: 14,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
});
