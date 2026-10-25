/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADII, SHADOWS } from '../theme';

const LOGO_IMAGE = require('../../assets/logo.jpg');

export interface DashboardScreenProps {
  profile: any;
  jobs: any[];
  emergencies: any[];
  onToggleDuty: () => Promise<void>;
  onNavigate?: (screen: string) => void;
  user?: any;
  loading?: boolean;
  busy?: boolean;
  onRefresh?: () => Promise<void>;
  onSelectJob?: (job: any, kind?: any) => void;
  onNavigateTab?: (tab: any) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  profile,
  jobs = [],
  emergencies = [],
  onToggleDuty,
  onNavigate,
  user,
  loading = false,
  busy = false,
  onRefresh,
  onSelectJob,
  onNavigateTab,
}) => {
  const [toggling, setToggling] = useState(false);

  const isOnline = Boolean(profile?.isOnline);

  const handleToggleDuty = async () => {
    if (toggling || busy) return;
    setToggling(true);
    try {
      await onToggleDuty();
    } finally {
      setToggling(false);
    }
  };

  const handleNavigate = (screen: string) => {
    if (onNavigate) {
      onNavigate(screen);
    }
    if (onNavigateTab) {
      if (screen === 'assignments' || screen === 'jobs') onNavigateTab('Jobs');
      else if (screen === 'emergencies' || screen === 'sos') onNavigateTab('SOS');
      else if (screen === 'profile') onNavigateTab('Profile');
    }
  };

  // Find active job (emergency or booking with active status)
  const activeJob =
    emergencies.find((e) =>
      ['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(e.status)
    ) ||
    jobs.find((j) =>
      ['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(j.status)
    );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return { bg: COLORS.infoLight, text: COLORS.info };
      case 'ACCEPTED':
        return { bg: '#E0F2FE', text: '#0284C7' };
      case 'EN_ROUTE':
        return { bg: COLORS.warningLight, text: COLORS.warning };
      case 'ARRIVED':
        return { bg: '#FEF9C3', text: '#CA8A04' };
      case 'IN_PROGRESS':
        return { bg: COLORS.primaryLight, text: COLORS.primary };
      case 'COMPLETED':
        return { bg: COLORS.successLight, text: COLORS.success };
      default:
        return { bg: COLORS.gray100, text: COLORS.gray600 };
    }
  };

  const getJobTitle = (job: any) => {
    if (job?.problemType) {
      return job.problemType.replaceAll('_', ' ');
    }
    if (job?.serviceIds && job.serviceIds.length > 0) {
      return job.serviceIds.map((s: any) => s.name || s).join(', ');
    }
    return job?.bookingNumber || job?.requestNumber || 'Standard Inspection';
  };

  const todayCompletedCount =
    jobs.filter((j) => j.status === 'COMPLETED').length +
    emergencies.filter((e) => e.status === 'COMPLETED').length;

  const totalEarnings = profile?.totalEarnings ?? 0;
  const ratingValue = (profile?.rating ?? 5.0).toFixed(1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerBrand}>
          <Image source={LOGO_IMAGE} style={styles.logo} resizeMode="contain" />
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>Auto Pro</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.headerSubtitle}>
              {user?.name ? `Hello, ${user.name}` : profile?.approvalStatus === 'APPROVED' ? 'Verified Mechanic' : 'Partner Dashboard'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => handleNavigate('notifications')}
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={24} color={COLORS.black} />
          {emergencies.length > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          ) : undefined
        }
      >
        {/* Duty Toggle Card */}
        <View style={styles.dutyCard}>
          <View style={styles.dutyInfo}>
            <View style={styles.dutyStatusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOnline ? COLORS.online : COLORS.offline },
                ]}
              />
              <Text style={styles.dutyTitle}>{isOnline ? 'On Duty' : 'Off Duty'}</Text>
            </View>
            <Text style={styles.dutySubtitle}>
              {isOnline
                ? 'Ready to receive and accept assignments'
                : 'You are currently offline. Switch on to accept work.'}
            </Text>
          </View>

          {toggling || busy ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={styles.dutySwitch} />
          ) : (
            <Switch
              value={isOnline}
              onValueChange={handleToggleDuty}
              trackColor={{ false: COLORS.gray300, true: '#86EFAC' }}
              thumbColor={isOnline ? COLORS.online : COLORS.gray100}
              ios_backgroundColor={COLORS.gray300}
              style={styles.dutySwitch}
            />
          )}
        </View>

        {/* Stats Row: 3 cards */}
        <View style={styles.statsRow}>
          {/* Today's Jobs */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="briefcase-outline" size={20} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>
              {profile?.totalJobs !== undefined ? profile.totalJobs : todayCompletedCount}
            </Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>

          {/* Rating */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="star" size={20} color={COLORS.starGold} />
            </View>
            <Text style={styles.statValue}>{ratingValue}</Text>
            <Text style={styles.statLabel}>Rating / 5</Text>
          </View>

          {/* Earnings */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: COLORS.successLight }]}>
              <Ionicons name="wallet-outline" size={20} color={COLORS.success} />
            </View>
            <Text style={styles.statValue} numberOfLines={1}>
              ₹{totalEarnings > 9999 ? `${(totalEarnings / 1000).toFixed(1)}k` : totalEarnings}
            </Text>
            <Text style={styles.statLabel}>Earnings</Text>
          </View>
        </View>

        {/* Active Job Card */}
        {activeJob && (
          <View style={styles.activeJobSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Current Assignment</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: getStatusBadgeColor(activeJob.status).bg },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: getStatusBadgeColor(activeJob.status).text },
                  ]}
                >
                  {activeJob.status.replaceAll('_', ' ')}
                </Text>
              </View>
            </View>

            <View style={styles.activeJobCard}>
              <View style={styles.jobMainInfo}>
                <View style={styles.jobServiceRow}>
                  <Ionicons name="construct" size={22} color={COLORS.primary} />
                  <Text style={styles.jobServiceName} numberOfLines={1}>
                    {getJobTitle(activeJob)}
                  </Text>
                </View>

                <View style={styles.jobDetailRow}>
                  <Ionicons name="person-outline" size={16} color={COLORS.gray500} />
                  <Text style={styles.jobDetailText}>
                    {activeJob.customerId?.name || 'Customer'}
                    {activeJob.customerId?.phone ? ` • ${activeJob.customerId.phone}` : ''}
                  </Text>
                </View>

                {activeJob.vehicleId && (
                  <View style={styles.jobDetailRow}>
                    <Ionicons name="car-outline" size={16} color={COLORS.gray500} />
                    <Text style={styles.jobDetailText}>
                      {[
                        activeJob.vehicleId.brand,
                        activeJob.vehicleId.model,
                        activeJob.vehicleId.registrationNumber,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    </Text>
                  </View>
                )}

                {(activeJob.address || activeJob.addressId) && (
                  <View style={styles.jobDetailRow}>
                    <Ionicons name="location-outline" size={16} color={COLORS.gray500} />
                    <Text style={styles.jobDetailText} numberOfLines={1}>
                      {activeJob.address ||
                        [
                          activeJob.addressId?.addressLine1,
                          activeJob.addressId?.city,
                          activeJob.addressId?.pincode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.viewJobBtn}
                onPress={() => {
                  if (onSelectJob) {
                    const kind = emergencies.some((e) => e._id === activeJob._id)
                      ? 'emergency'
                      : 'booking';
                    onSelectJob(activeJob, kind);
                  }
                  handleNavigate('job-detail');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.viewJobBtnText}>View Details →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Actions 2x2 Grid */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <View style={styles.grid}>
            {/* View Assignments */}
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => handleNavigate('assignments')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="calendar" size={26} color="#2563EB" />
              </View>
              <Text style={styles.actionTitle}>Assignments</Text>
              <Text style={styles.actionSubtitle}>{jobs.length} total jobs</Text>
            </TouchableOpacity>

            {/* Emergency SOS */}
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => handleNavigate('emergencies')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: COLORS.errorLight }]}>
                <Ionicons name="flash" size={26} color={COLORS.primary} />
              </View>
              <Text style={styles.actionTitle}>Emergency SOS</Text>
              <Text style={styles.actionSubtitle}>
                {emergencies.length > 0 ? `${emergencies.length} active` : 'Roadside requests'}
              </Text>
            </TouchableOpacity>

            {/* My Profile */}
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => handleNavigate('profile')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="person" size={26} color={COLORS.black} />
              </View>
              <Text style={styles.actionTitle}>My Profile</Text>
              <Text style={styles.actionSubtitle}>Skills & status</Text>
            </TouchableOpacity>

            {/* Earnings */}
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => handleNavigate('earnings')}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconBox, { backgroundColor: COLORS.successLight }]}>
                <Ionicons name="cash" size={26} color={COLORS.success} />
              </View>
              <Text style={styles.actionTitle}>Earnings</Text>
              <Text style={styles.actionSubtitle}>
                ₹{totalEarnings.toLocaleString('en-IN')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: RADII.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: -0.3,
  },
  proBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADII.xs,
  },
  proBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  notificationBtn: {
    padding: SPACING.xs,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    padding: SPACING.xl,
    gap: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  dutyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  dutyInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  dutyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dutyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.black,
  },
  dutySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  dutySwitch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADII.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.black,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  activeJobSection: {
    gap: SPACING.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.black,
  },
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADII.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  activeJobCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  jobMainInfo: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  jobServiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  jobServiceName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.black,
    flex: 1,
  },
  jobDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  jobDetailText: {
    fontSize: 13,
    color: COLORS.gray600,
    flex: 1,
  },
  viewJobBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md - 2,
    borderRadius: RADII.md,
    gap: SPACING.xs,
  },
  viewJobBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  actionsSection: {
    gap: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  gridItem: {
    width: '47.5%',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  actionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
