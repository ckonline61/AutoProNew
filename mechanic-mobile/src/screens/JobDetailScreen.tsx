/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Linking,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADII, SHADOWS } from '../theme';

export interface JobDetailScreenProps {
  job: any;
  kind: 'booking' | 'emergency';
  onAction: (action: string, data?: any) => Promise<void>;
  onBack: () => void;
  onShareLocation: () => Promise<void>;
  busy: boolean;
}

const STATUS_STEPS = [
  'ASSIGNED',
  'ACCEPTED',
  'EN_ROUTE',
  'ARRIVED',
  'IN_PROGRESS',
  'COMPLETED',
] as const;

const STEP_LABELS: Record<string, string> = {
  ASSIGNED: 'Job Assigned',
  ACCEPTED: 'Job Accepted',
  EN_ROUTE: 'En Route',
  ARRIVED: 'Arrived at Location',
  IN_PROGRESS: 'Work in Progress',
  COMPLETED: 'Job Completed',
};

export const JobDetailScreen: React.FC<JobDetailScreenProps> = ({
  job,
  kind,
  onAction,
  onBack,
  onShareLocation,
  busy,
}) => {
  const [notes, setNotes] = useState('');
  const [localBusy, setLocalBusy] = useState(false);

  const isBusy = busy || localBusy;

  if (!job) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No job selected</Text>
          <TouchableOpacity style={styles.backBtnFallback} onPress={onBack}>
            <Text style={styles.backBtnFallbackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatus = job.status || 'ASSIGNED';
  const currentStepIndex = STATUS_STEPS.indexOf(currentStatus as any);

  const handleAction = async (action: string) => {
    if (isBusy) return;
    setLocalBusy(true);
    try {
      await onAction(action, notes);
    } finally {
      setLocalBusy(false);
    }
  };

  const handleShareLocation = async () => {
    if (isBusy) return;
    setLocalBusy(true);
    try {
      await onShareLocation();
    } finally {
      setLocalBusy(false);
    }
  };

  const handleCallCustomer = () => {
    const phone = job.customerId?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {});
    }
  };

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

  const statusMeta = getStatusBadge(currentStatus);

  const getInitials = (name?: string) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  };

  const serviceName =
    job.problemType?.replaceAll('_', ' ') ||
    job.serviceIds?.map((s: any) => s.name || s).join(', ') ||
    'Standard Vehicle Service';

  const scheduledDateText = job.scheduledDate
    ? `${new Date(job.scheduledDate).toLocaleDateString()} ${job.scheduledTime || ''}`.trim()
    : 'Immediate / As Soon As Possible';

  const fullAddress =
    job.address ||
    [job.addressId?.addressLine1, job.addressId?.city, job.addressId?.pincode]
      .filter(Boolean)
      .join(', ') ||
    'Address not specified';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Job Details</Text>

        <View style={[styles.headerBadge, { backgroundColor: statusMeta.bg }]}>
          <Text style={[styles.headerBadgeText, { color: statusMeta.color }]}>
            {statusMeta.label}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Service Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.serviceIconWrap}>
              <Ionicons
                name={kind === 'emergency' ? 'flash' : 'construct'}
                size={22}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.serviceTitleGroup}>
              <Text style={styles.serviceName}>{serviceName}</Text>
              <Text style={styles.serviceRef}>
                Ref: {job.bookingNumber || job.requestNumber || job._id?.slice(-8)}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Schedule</Text>
              <Text style={styles.metaValue}>{scheduledDateText}</Text>
            </View>
            <View style={styles.metaItemRight}>
              <Text style={styles.metaLabel}>Estimated Price</Text>
              <Text style={styles.priceHighlight}>
                ₹{(job.estimatedPrice || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Customer Details</Text>
          <View style={styles.customerRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {getInitials(job.customerId?.name)}
              </Text>
            </View>

            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>
                {job.customerId?.name || 'Customer'}
              </Text>
              <Text style={styles.customerPhone}>
                {job.customerId?.phone || 'No phone provided'}
              </Text>
            </View>

            {!!job.customerId?.phone && (
              <TouchableOpacity
                style={styles.callButton}
                onPress={handleCallCustomer}
                activeOpacity={0.8}
                accessibilityLabel="Call Customer"
              >
                <Ionicons name="call" size={18} color={COLORS.white} />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Vehicle Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Vehicle Details</Text>
          <View style={styles.vehicleRow}>
            <View style={styles.vehicleIconCircle}>
              <Ionicons name="car-sport" size={24} color={COLORS.black} />
            </View>
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleTitle}>
                {[job.vehicleId?.brand, job.vehicleId?.model, job.vehicleId?.year]
                  .filter(Boolean)
                  .join(' ')}
              </Text>
              <View style={styles.vehicleBadgesRow}>
                {job.vehicleId?.registrationNumber ? (
                  <View style={styles.vehicleRegBadge}>
                    <Text style={styles.vehicleRegText}>
                      {job.vehicleId.registrationNumber}
                    </Text>
                  </View>
                ) : null}
                {job.vehicleId?.fuelType ? (
                  <View style={styles.fuelBadge}>
                    <Text style={styles.fuelBadgeText}>
                      {job.vehicleId.fuelType}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </View>

        {/* Address Card */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Service Location</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={22} color={COLORS.primary} style={styles.addressIcon} />
            <Text style={styles.addressText}>{fullAddress}</Text>
          </View>
        </View>

        {/* Notes Input / Display */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Work Notes & Updates</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add job notes, parts inspected, or decline reason..."
            placeholderTextColor={COLORS.gray400}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
            editable={!isBusy}
          />
        </View>

        {/* Status Timeline Stepper */}
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>Status Timeline</Text>
          <View style={styles.stepperContainer}>
            {STATUS_STEPS.map((step, index) => {
              const isDone = currentStepIndex > index;
              const isCurrent = currentStepIndex === index;
              const isPending = currentStepIndex < index;
              const isLast = index === STATUS_STEPS.length - 1;

              return (
                <View key={step} style={styles.stepItem}>
                  <View style={styles.stepVisual}>
                    <View
                      style={[
                        styles.stepDot,
                        isDone && styles.stepDotDone,
                        isCurrent && styles.stepDotCurrent,
                        isPending && styles.stepDotPending,
                      ]}
                    >
                      {isDone ? (
                        <Ionicons name="checkmark" size={12} color={COLORS.white} />
                      ) : isCurrent ? (
                        <View style={styles.innerDotCurrent} />
                      ) : null}
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.stepLine,
                          isDone ? styles.stepLineDone : styles.stepLinePending,
                        ]}
                      />
                    )}
                  </View>

                  <View style={styles.stepInfo}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent && styles.stepLabelCurrent,
                        isDone && styles.stepLabelDone,
                        isPending && styles.stepLabelPending,
                      ]}
                    >
                      {STEP_LABELS[step]}
                    </Text>
                    {isCurrent && (
                      <Text style={styles.stepStatusActiveText}>In Progress</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons at Bottom */}
      <View style={styles.bottomBar}>
        {isBusy ? (
          <View style={styles.busyContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.busyText}>Updating status...</Text>
          </View>
        ) : (
          <>
            {currentStatus === 'ASSIGNED' && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.declineBtn]}
                  onPress={() => handleAction('reject')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="close-circle-outline" size={18} color={COLORS.error} />
                  <Text style={styles.declineBtnText}>Decline</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.acceptBtn]}
                  onPress={() => handleAction('accept')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} />
                  <Text style={styles.acceptBtnText}>Accept Job</Text>
                </TouchableOpacity>
              </View>
            )}

            {currentStatus === 'ACCEPTED' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.journeyBtn]}
                onPress={() => handleAction('EN_ROUTE')}
                activeOpacity={0.8}
              >
                <Ionicons name="navigate-outline" size={20} color={COLORS.white} />
                <Text style={styles.journeyBtnText}>Start Journey →</Text>
              </TouchableOpacity>
            )}

            {currentStatus === 'EN_ROUTE' && (
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.shareLocationBtn]}
                  onPress={handleShareLocation}
                  activeOpacity={0.8}
                >
                  <Ionicons name="location-outline" size={18} color={COLORS.info} />
                  <Text style={styles.shareLocationText}>Share Location</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.arrivedBtn]}
                  onPress={() => handleAction('ARRIVED')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="flag-outline" size={18} color={COLORS.white} />
                  <Text style={styles.arrivedBtnText}>Mark Arrived</Text>
                </TouchableOpacity>
              </View>
            )}

            {currentStatus === 'ARRIVED' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.startWorkBtn]}
                onPress={() => handleAction('IN_PROGRESS')}
                activeOpacity={0.8}
              >
                <Ionicons name="construct-outline" size={20} color={COLORS.white} />
                <Text style={styles.startWorkBtnText}>Start Work</Text>
              </TouchableOpacity>
            )}

            {currentStatus === 'IN_PROGRESS' && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.completeBtn]}
                onPress={() => handleAction('COMPLETED')}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-done-outline" size={20} color={COLORS.white} />
                <Text style={styles.completeBtnText}>Complete Job ✓</Text>
              </TouchableOpacity>
            )}

            {currentStatus === 'COMPLETED' && (
              <View style={styles.completedNotice}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                <Text style={styles.completedNoticeText}>This assignment is completed.</Text>
              </View>
            )}
          </>
        )}
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: -0.3,
  },
  headerBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADII.full,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scrollContent: {
    padding: SPACING.xl,
    gap: SPACING.lg,
    backgroundColor: COLORS.background,
    paddingBottom: SPACING['3xl'],
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  serviceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceTitleGroup: {
    flex: 1,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.black,
  },
  serviceRef: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flex: 1,
  },
  metaItemRight: {
    alignItems: 'flex-end',
  },
  metaLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
  },
  priceHighlight: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  customerPhone: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.md,
    gap: SPACING.xs,
  },
  callButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  vehicleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  vehicleBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  vehicleRegBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADII.xs,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  vehicleRegText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.gray800,
  },
  fuelBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADII.xs,
  },
  fuelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  addressIcon: {
    marginTop: 2,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.gray700,
    lineHeight: 20,
    flex: 1,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  stepperContainer: {
    paddingLeft: SPACING.xs,
  },
  stepItem: {
    flexDirection: 'row',
    minHeight: 46,
  },
  stepVisual: {
    alignItems: 'center',
    width: 24,
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotDone: {
    backgroundColor: COLORS.success,
  },
  stepDotCurrent: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  innerDotCurrent: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  stepDotPending: {
    backgroundColor: COLORS.gray200,
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  stepLineDone: {
    backgroundColor: COLORS.success,
  },
  stepLinePending: {
    backgroundColor: COLORS.gray200,
  },
  stepInfo: {
    marginLeft: SPACING.md,
    justifyContent: 'flex-start',
    paddingTop: 1,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  stepLabelCurrent: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  stepLabelDone: {
    color: COLORS.black,
    fontWeight: '600',
  },
  stepLabelPending: {
    color: COLORS.gray400,
  },
  stepStatusActiveText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  bottomBar: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.md,
  },
  busyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  busyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: RADII.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  declineBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.error,
    backgroundColor: COLORS.white,
  },
  declineBtnText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '700',
  },
  acceptBtn: {
    backgroundColor: COLORS.success,
  },
  acceptBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  journeyBtn: {
    backgroundColor: '#2563EB',
    height: 50,
    borderRadius: RADII.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  journeyBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  shareLocationBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.info,
    backgroundColor: COLORS.white,
  },
  shareLocationText: {
    color: COLORS.info,
    fontSize: 14,
    fontWeight: '700',
  },
  arrivedBtn: {
    backgroundColor: '#D97706',
  },
  arrivedBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  startWorkBtn: {
    backgroundColor: '#CA8A04',
    height: 50,
    borderRadius: RADII.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  startWorkBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  completeBtn: {
    backgroundColor: COLORS.success,
    height: 50,
    borderRadius: RADII.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  completeBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },
  completedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  completedNoticeText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.success,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  backBtnFallback: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.md,
  },
  backBtnFallbackText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
