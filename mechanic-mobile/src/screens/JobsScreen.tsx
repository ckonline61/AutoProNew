import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SHADOWS, SPACING } from '../theme';
import { canShareLocation, Job, JobKind, nextStatus, statusLabel } from '../services/mechanic-api';

export interface JobsScreenProps {
  jobs: Job[];
  selectedJob: { job: Job; kind: JobKind } | null;
  onSelectJob: (job: Job | null, kind?: JobKind) => void;
  onUpdateJobStatus: (action: string, notes: string) => Promise<void>;
  onShareLocation: () => Promise<void>;
  onRefresh: () => Promise<void>;
  loading: boolean;
  busy: boolean;
  isOnline: boolean;
}

type FilterType = 'All' | 'Assigned' | 'Active' | 'Completed';

export const JobsScreen: React.FC<JobsScreenProps> = ({
  jobs,
  selectedJob,
  onSelectJob,
  onUpdateJobStatus,
  onShareLocation,
  onRefresh,
  loading,
  busy,
  isOnline,
}) => {
  const [filter, setFilter] = useState<FilterType>('All');
  const [workNotes, setWorkNotes] = useState('');

  const filteredJobs = jobs.filter((j) => {
    if (filter === 'All') return true;
    if (filter === 'Assigned') return j.status === 'ASSIGNED';
    if (filter === 'Active')
      return ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'IN_PROGRESS'].includes(j.status);
    if (filter === 'Completed') return j.status === 'COMPLETED';
    return true;
  });

  const handleCallCustomer = (phone?: string) => {
    if (phone) {
      void Linking.openURL(`tel:${phone}`);
    }
  };

  // If a job is selected, render the detailed assignment workspace
  if (selectedJob) {
    const { job, kind } = selectedJob;
    const isAssigned = job.status === 'ASSIGNED';
    const next = nextStatus[job.status];
    const canShare = canShareLocation(job.status);

    const vehicleText = [
      job.vehicleId?.brand,
      job.vehicleId?.model,
      job.vehicleId?.registrationNumber,
    ]
      .filter(Boolean)
      .join(' · ');

    const addressText =
      job.address ||
      [job.addressId?.addressLine1, job.addressId?.city, job.addressId?.pincode]
        .filter(Boolean)
        .join(', ') ||
      'Address provided via customer coordination';

    const serviceTitle =
      job.problemType?.replaceAll('_', ' ') ||
      job.serviceIds?.map((s) => s.name).join(', ') ||
      'Scheduled Vehicle Service';

    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.detailScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button Bar */}
        <View style={styles.detailHeaderBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => onSelectJob(null)}
            disabled={busy}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.black} />
            <Text style={styles.backButtonText}>Assignments</Text>
          </TouchableOpacity>

          <View style={styles.detailStatusBadge}>
            <Text style={styles.detailStatusBadgeText}>
              {job.status.replaceAll('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Job Identity Card */}
        <View style={styles.detailCard}>
          <Text style={styles.detailJobNumber}>
            {job.bookingNumber || job.requestNumber || 'Job Assignment'}
          </Text>
          <Text style={styles.detailJobType}>{serviceTitle}</Text>

          <View style={styles.detailDivider} />

          {/* Customer Row with Call Action */}
          <View style={styles.detailCustomerRow}>
            <View style={styles.customerAvatarBox}>
              <Ionicons name="person" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.customerTextBox}>
              <Text style={styles.customerName}>
                {job.customerId?.name || 'Customer'}
              </Text>
              <Text style={styles.customerPhone}>
                {job.customerId?.phone || 'No phone number'}
              </Text>
            </View>
            {job.customerId?.phone ? (
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCallCustomer(job.customerId?.phone)}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={18} color={COLORS.white} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Vehicle info */}
          {vehicleText ? (
            <View style={styles.detailRow}>
              <Ionicons name="car-sport-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.detailRowText}>{vehicleText}</Text>
            </View>
          ) : null}

          {/* Location info */}
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color={COLORS.primary} />
            <Text style={[styles.detailRowText, styles.detailAddressText]}>
              {addressText}
            </Text>
          </View>

          {/* Scheduled Date */}
          {job.scheduledDate ? (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.detailRowText}>
                {new Date(job.scheduledDate).toLocaleDateString()} {job.scheduledTime || ''}
              </Text>
            </View>
          ) : null}

          {/* Estimated Value */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Estimated Service Value</Text>
            <Text style={styles.priceValue}>
              ₹{Number(job.estimatedPrice).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Work Notes / Reason Input */}
        <View style={styles.detailCard}>
          <Text style={styles.notesLabel}>Work Notes / Reason (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add update notes, parts replaced, or decline reason..."
            placeholderTextColor={COLORS.textMuted}
            value={workNotes}
            onChangeText={setWorkNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Status Actions */}
        <View style={styles.actionsContainer}>
          {isAssigned ? (
            <>
              <TouchableOpacity
                style={[styles.primaryActionBtn, (!isOnline || busy) && styles.actionDisabled]}
                disabled={!isOnline || busy}
                onPress={() => void onUpdateJobStatus('accept', workNotes)}
                activeOpacity={0.85}
              >
                {busy ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.white} style={{ marginRight: 6 }} />
                    <Text style={styles.primaryActionText}>Accept Assignment</Text>
                  </>
                )}
              </TouchableOpacity>

              {kind === 'booking' && (
                <TouchableOpacity
                  style={[styles.declineActionBtn, busy && styles.actionDisabled]}
                  disabled={busy}
                  onPress={() => void onUpdateJobStatus('reject', workNotes)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.declineActionText}>Decline Assignment</Text>
                </TouchableOpacity>
              )}
            </>
          ) : next ? (
            <TouchableOpacity
              style={[styles.primaryActionBtn, busy && styles.actionDisabled]}
              disabled={busy}
              onPress={() => void onUpdateJobStatus(next, workNotes)}
              activeOpacity={0.85}
            >
              {busy ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="arrow-forward-circle" size={20} color={COLORS.white} style={{ marginRight: 6 }} />
                  <Text style={styles.primaryActionText}>
                    {statusLabel[next] || `Mark ${next.replaceAll('_', ' ')}`}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.completedTagBox}>
              <Ionicons name="checkmark-done-circle" size={24} color={COLORS.success} />
              <Text style={styles.completedTagText}>Assignment Completed</Text>
            </View>
          )}

          {/* Location Sharing Option */}
          {canShare && (
            <TouchableOpacity
              style={[styles.shareLocationBtn, busy && styles.actionDisabled]}
              disabled={busy}
              onPress={() => void onShareLocation()}
              activeOpacity={0.85}
            >
              <Ionicons name="navigate" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.shareLocationText}>Share Current Location Once</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    );
  }

  // Jobs List View
  const renderItem = ({ item }: { item: Job }) => {
    const isAssigned = item.status === 'ASSIGNED';
    const isInTransit = ['EN_ROUTE', 'ARRIVED'].includes(item.status);
    const isInProgress = item.status === 'IN_PROGRESS';
    const isCompleted = item.status === 'COMPLETED';

    let badgeBg: string = COLORS.warningLight;
    let badgeColor: string = COLORS.warning;
    if (isAssigned) {
      badgeBg = COLORS.errorLight;
      badgeColor = COLORS.error;
    } else if (isInTransit || isInProgress) {
      badgeBg = COLORS.infoLight;
      badgeColor = COLORS.info;
    } else if (isCompleted) {
      badgeBg = COLORS.successLight;
      badgeColor = COLORS.success;
    }

    const vehicleText = [
      item.vehicleId?.brand,
      item.vehicleId?.model,
      item.vehicleId?.registrationNumber,
    ]
      .filter(Boolean)
      .join(' · ');

    const addressText =
      item.address ||
      [item.addressId?.addressLine1, item.addressId?.city].filter(Boolean).join(', ') ||
      'Address provided on dispatch';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          onSelectJob(item, 'booking');
          setWorkNotes('');
        }}
        activeOpacity={0.85}
      >
        <View style={styles.cardTopRow}>
          <View>
            <Text style={styles.jobBookingNumber}>
              {item.bookingNumber || item.requestNumber || 'Service Job'}
            </Text>
            <Text style={styles.jobProblemType} numberOfLines={1}>
              {item.problemType?.replaceAll('_', ' ') ||
                item.serviceIds?.map((s) => s.name).join(', ') ||
                'Scheduled Maintenance'}
            </Text>
          </View>
          <View style={[styles.jobBadge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.jobBadgeText, { color: badgeColor }]}>
              {item.status.replaceAll('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardRow}>
          <Ionicons name="person-circle-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.cardRowText}>
            {item.customerId?.name || 'Customer'} {item.customerId?.phone ? `· ${item.customerId.phone}` : ''}
          </Text>
        </View>

        {vehicleText ? (
          <View style={styles.cardRow}>
            <Ionicons name="car-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.cardRowText}>{vehicleText}</Text>
          </View>
        ) : null}

        <View style={styles.cardRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.primary} />
          <Text style={[styles.cardRowText, { color: COLORS.textPrimary }]} numberOfLines={1}>
            {addressText}
          </Text>
        </View>

        <View style={styles.cardBottomRow}>
          <Text style={styles.cardPrice}>
            ₹{Number(item.estimatedPrice).toLocaleString('en-IN')}
          </Text>
          <View style={styles.manageBtn}>
            <Text style={styles.manageBtnText}>Manage Job →</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconBox}>
        <Ionicons name="briefcase-outline" size={44} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No assignments found</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'All'
          ? 'You currently have no assigned service bookings. Check back or refresh for incoming dispatches.'
          : `No jobs found matching the "${filter}" filter.`}
      </Text>
      <TouchableOpacity
        style={styles.emptyRefreshBtn}
        onPress={() => void onRefresh()}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh-outline" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
        <Text style={styles.emptyRefreshText}>Refresh Jobs</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Bar */}
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>My Jobs</Text>
        <Text style={styles.listHeaderCount}>{filteredJobs.length} assignments</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsRow}>
        {(['All', 'Assigned', 'Active', 'Completed'] as FilterType[]).map((tabKey) => {
          const isActive = filter === tabKey;
          return (
            <TouchableOpacity
              key={tabKey}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => setFilter(tabKey)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                {tabKey}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Jobs FlatList */}
      <FlatList
        data={filteredJobs}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  listHeaderTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  listHeaderCount: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  filterTabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADII.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  jobBookingNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.black,
  },
  jobProblemType: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  jobBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.sm,
  },
  jobBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardRowText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manageBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING['3xl'],
    alignItems: 'center',
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.lg,
    maxWidth: 260,
  },
  emptyRefreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: RADII.md,
  },
  emptyRefreshText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  // Detail View Styles
  detailScrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },
  detailHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
  },
  detailStatusBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.full,
  },
  detailStatusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  detailJobNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.black,
  },
  detailJobType: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  detailDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  detailCustomerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  customerAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  customerTextBox: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },
  customerPhone: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  detailRowText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },
  detailAddressText: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  priceLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.black,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  actionsContainer: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  primaryActionText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  declineActionBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineActionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionDisabled: {
    opacity: 0.5,
  },
  completedTagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.successLight,
    paddingVertical: 14,
    borderRadius: RADII.md,
    gap: 8,
  },
  completedTagText: {
    color: COLORS.success,
    fontSize: 15,
    fontWeight: '700',
  },
  shareLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 12,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
  },
  shareLocationText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
