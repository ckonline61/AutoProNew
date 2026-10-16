import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';

type TimelineStep = {
  title: string;
  subtitle: string;
  status: 'completed' | 'in-progress' | 'pending';
  icon: keyof typeof Ionicons.glyphMap;
  timestamp?: string;
};

const TIMELINE_STEPS: TimelineStep[] = [
  {
    title: 'Listing Submitted',
    subtitle: 'Your car listing has been submitted successfully.',
    status: 'completed',
    icon: 'checkmark-circle',
    timestamp: '15 Oct 2026, 10:30 AM',
  },
  {
    title: 'Under Verification',
    subtitle: 'Our team is reviewing your listing. This may take 24-48 hours.',
    status: 'in-progress',
    icon: 'time',
    timestamp: 'In Progress',
  },
  {
    title: 'Approved & Published',
    subtitle: 'Your listing will go live on the marketplace.',
    status: 'pending',
    icon: 'shield-checkmark',
  },
  {
    title: 'Leads & Inquiries',
    subtitle: 'Buyers will contact you with offers.',
    status: 'pending',
    icon: 'people',
  },
];

export const SellerListingStatusScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const getStatusColor = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'in-progress': return COLORS.warning;
      case 'pending': return COLORS.gray300;
    }
  };

  const getStatusBg = (status: TimelineStep['status']) => {
    switch (status) {
      case 'completed': return COLORS.successLight;
      case 'in-progress': return COLORS.warningLight;
      case 'pending': return COLORS.gray100;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation?.goBack?.()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Car Listing</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle Summary Card */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleImagePlaceholder}>
            <Ionicons name="car-sport" size={40} color={COLORS.gray400} />
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.vehicleName}>Maruti Swift VXI</Text>
            <Text style={styles.vehicleSpecs}>2021 · Petrol · 32,000 km</Text>
            <Text style={styles.vehiclePrice}>₹5,50,000</Text>
          </View>
        </View>

        {/* Status Badge */}
        <View style={styles.statusBadgeContainer}>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.warningLight }]}>
            <Ionicons name="time" size={16} color={COLORS.warning} />
            <Text style={[styles.statusBadgeText, { color: COLORS.warning }]}>
              Under Verification
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Listing Progress</Text>

          {TIMELINE_STEPS.map((step, index) => {
            const color = getStatusColor(step.status);
            const bgColor = getStatusBg(step.status);
            const isLast = index === TIMELINE_STEPS.length - 1;

            return (
              <View key={step.title} style={styles.timelineItem}>
                {/* Connector Line + Dot */}
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: bgColor, borderColor: color }]}>
                    <Ionicons
                      name={step.status === 'completed' ? 'checkmark' : step.status === 'in-progress' ? 'time-outline' : 'ellipse-outline'}
                      size={16}
                      color={color}
                    />
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineLine,
                        { backgroundColor: step.status === 'completed' ? COLORS.success : COLORS.gray200 },
                      ]}
                    />
                  )}
                </View>

                {/* Content */}
                <View style={[styles.timelineContent, !isLast && { paddingBottom: SPACING.xl }]}>
                  <View style={styles.timelineHeader}>
                    <Text
                      style={[
                        styles.timelineTitle,
                        step.status === 'pending' && { color: COLORS.textMuted },
                      ]}
                    >
                      {step.title}
                    </Text>
                    {step.status === 'completed' && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>Done</Text>
                      </View>
                    )}
                    {step.status === 'in-progress' && (
                      <View style={styles.progressBadge}>
                        <Text style={styles.progressBadgeText}>In Progress</Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.timelineSubtitle,
                      step.status === 'pending' && { color: COLORS.gray300 },
                    ]}
                  >
                    {step.subtitle}
                  </Text>
                  {step.timestamp && (
                    <View style={styles.timestampRow}>
                      <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                      <Text style={styles.timestampText}>{step.timestamp}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={22} color={COLORS.info} />
          <Text style={styles.infoBannerText}>
            You will be notified once your listing is approved and goes live on the marketplace.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            <Text style={styles.editBtnText}>Edit Listing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={styles.deleteBtnText}>Remove Listing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING['3xl'],
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
    marginBottom: SPACING.md,
  },
  vehicleImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: RADII.md,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: SPACING.md,
    justifyContent: 'center',
  },
  vehicleName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  vehicleSpecs: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  vehiclePrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 6,
  },
  statusBadgeContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineSection: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    ...SHADOWS.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 36,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    marginLeft: SPACING.md,
    paddingTop: 4,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  timelineSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  timestampText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  completedBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
  },
  progressBadge: {
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  progressBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.warning,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.infoLight,
    borderRadius: RADII.md,
    padding: SPACING.md,
    gap: 10,
    marginBottom: SPACING.lg,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.info,
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    borderRadius: RADII.md,
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
});
