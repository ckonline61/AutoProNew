/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADII, SHADOWS } from '../theme';

export interface JobsListScreenProps {
  jobs: any[];
  onSelectJob: (job: any) => void;
  onRefresh: () => Promise<void>;
  loading: boolean;
  onBack?: () => void;
}

type TabType = 'Active' | 'Completed' | 'All';

export const JobsListScreen: React.FC<JobsListScreenProps> = ({
  jobs = [],
  onSelectJob,
  onRefresh,
  loading,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('Active');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === 'Active') {
      return job.status !== 'COMPLETED' && job.status !== 'CANCELLED';
    }
    if (activeTab === 'Completed') {
      return job.status === 'COMPLETED';
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return { label: 'Assigned', color: '#2563EB', bg: '#EFF6FF' };
      case 'ACCEPTED':
        return { label: 'Accepted', color: '#0284C7', bg: '#E0F2FE' };
      case 'EN_ROUTE':
        return { label: 'En Route', color: '#D97706', bg: '#FEF3C7' };
      case 'ARRIVED':
        return { label: 'Arrived', color: '#CA8A04', bg: '#FEF9C3' };
      case 'IN_PROGRESS':
        return { label: 'In Progress', color: COLORS.primary, bg: COLORS.primaryLight };
      case 'COMPLETED':
        return { label: 'Completed', color: COLORS.success, bg: COLORS.successLight };
      default:
        return { label: status.replaceAll('_', ' '), color: COLORS.gray600, bg: COLORS.gray100 };
    }
  };

  const getJobTitle = (job: any) => {
    if (job?.problemType) {
      return job.problemType.replaceAll('_', ' ');
    }
    if (job?.serviceIds && job.serviceIds.length > 0) {
      return job.serviceIds.map((s: any) => s.name || s).join(', ');
    }
    return job?.bookingNumber || job?.requestNumber || 'Standard Service';
  };

  const renderJobItem = ({ item }: { item: any }) => {
    const statusMeta = getStatusBadge(item.status);
    const vehicleText = [
      item.vehicleId?.brand,
      item.vehicleId?.model,
      item.vehicleId?.registrationNumber ? `(${item.vehicleId.registrationNumber})` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const addressText =
      item.address ||
      [item.addressId?.addressLine1, item.addressId?.city, item.addressId?.pincode]
        .filter(Boolean)
        .join(', ');

    const dateText = item.scheduledDate
      ? `${new Date(item.scheduledDate).toLocaleDateString()} ${item.scheduledTime || ''}`.trim()
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onSelectJob(item)}
        activeOpacity={0.7}
      >
        {/* Header Row: Service title + Status Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.serviceRow}>
            <View style={styles.serviceIconWrap}>
              <Ionicons name="construct" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.serviceTitle} numberOfLines={1}>
              {getJobTitle(item)}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusMeta.bg }]}>
            <Text style={[styles.badgeText, { color: statusMeta.color }]}>
              {statusMeta.label}
            </Text>
          </View>
        </View>

        {/* Customer Info */}
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={15} color={COLORS.gray500} />
          <Text style={styles.infoText}>
            {item.customerId?.name || 'Customer'}
            {item.customerId?.phone ? `  •  ${item.customerId.phone}` : ''}
          </Text>
        </View>

        {/* Vehicle Info */}
        {!!vehicleText && (
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={15} color={COLORS.gray500} />
            <Text style={styles.infoText}>{vehicleText}</Text>
          </View>
        )}

        {/* Date / Time */}
        {!!dateText && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={15} color={COLORS.gray500} />
            <Text style={styles.infoText}>{dateText}</Text>
          </View>
        )}

        {/* Address */}
        {!!addressText && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={15} color={COLORS.gray500} />
            <Text style={styles.infoText} numberOfLines={1}>
              {addressText}
            </Text>
          </View>
        )}

        {/* Footer: Price & Chevron */}
        <View style={styles.cardFooter}>
          <Text style={styles.priceLabel}>
            Est. Value:{' '}
            <Text style={styles.priceValue}>
              ₹{(item.estimatedPrice || 0).toLocaleString('en-IN')}
            </Text>
          </Text>
          <View style={styles.detailLink}>
            <Text style={styles.detailLinkText}>Details</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="construct-outline" size={44} color={COLORS.gray400} />
      </View>
      <Text style={styles.emptyTitle}>No assignments found</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'Active'
          ? 'You have no active jobs assigned right now.'
          : activeTab === 'Completed'
          ? 'You have not completed any jobs yet.'
          : 'No jobs are currently registered under your account.'}
      </Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={16} color={COLORS.white} />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        {onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <Text style={styles.headerTitle}>My Assignments</Text>
        <View style={styles.backPlaceholder} />
      </View>

      {/* Tab Pills */}
      <View style={styles.tabsContainer}>
        {(['Active', 'Completed', 'All'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabPill, isActive && styles.tabPillActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Jobs FlatList */}
      <FlatList
        data={filteredJobs}
        renderItem={renderJobItem}
        keyExtractor={(item) => item._id || String(Math.random())}
        contentContainerStyle={[
          styles.listContent,
          filteredJobs.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || loading}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
  },
  backButton: {
    padding: SPACING.xs,
  },
  backPlaceholder: {
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: -0.3,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    gap: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabPill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.full,
    backgroundColor: COLORS.gray100,
  },
  tabPillActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  tabTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContent: {
    padding: SPACING.xl,
    gap: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
    gap: SPACING.sm,
  },
  serviceIconWrap: {
    width: 32,
    height: 32,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    flex: 1,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.gray600,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  priceLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING['4xl'],
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
    gap: SPACING.xs,
  },
  refreshButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
