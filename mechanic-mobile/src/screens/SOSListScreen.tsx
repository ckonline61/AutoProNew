/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SHADOWS, SPACING } from '../theme';

export interface SOSListScreenProps {
  emergencies: any[];
  onSelectSOS: (sos: any) => void;
  onRefresh: () => Promise<void>;
  loading: boolean;
}

function getEmergencyIcon(type?: string): keyof typeof Ionicons.glyphMap {
  const t = (type || '').toLowerCase();
  if (t.includes('battery')) return 'battery-dead';
  if (t.includes('tire') || t.includes('tyre') || t.includes('puncture') || t.includes('wheel')) return 'car-sport';
  if (t.includes('engine') || t.includes('breakdown') || t.includes('mechanical') || t.includes('repair')) return 'build';
  if (t.includes('tow') || t.includes('accident')) return 'car';
  return 'flash';
}

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Just now';
  const diff = Date.now() - new Date(dateString).getTime();
  if (isNaN(diff) || diff < 0) return 'Just now';
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const SOSListScreen: React.FC<SOSListScreenProps> = ({
  emergencies,
  onSelectSOS,
  onRefresh,
  loading,
}) => {
  const renderHeader = () => (
    <View>
      {/* Screen Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Emergency SOS</Text>
          <View style={styles.warningIconWrapper}>
            <Ionicons name="warning" size={22} color={COLORS.primary} />
          </View>
        </View>
        <Text style={styles.headerSubtitle}>
          Real-time roadside assistance requests
        </Text>
      </View>

      {/* Red Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroContent}>
          <View style={styles.heroIconCircle}>
            <Ionicons name="flash" size={26} color={COLORS.white} />
          </View>
          <View style={styles.heroTextContainer}>
            <View style={styles.heroTopRow}>
              <Text style={styles.heroTitle}>Urgent Requests</Text>
              <View style={styles.liveBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.liveBadgeText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.heroDescription}>
              {emergencies.length > 0
                ? `${emergencies.length} active emergency callout${emergencies.length > 1 ? 's' : ''} nearby`
                : 'Immediate roadside assistance broadcast dispatch'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="shield-checkmark-outline" size={48} color={COLORS.success} />
      </View>
      <Text style={styles.emptyTitle}>No emergency requests</Text>
      <Text style={styles.emptySubtitle}>
        There are currently no urgent breakdown or SOS calls in your area. New dispatch alerts will appear here instantly.
      </Text>
      <TouchableOpacity
        style={styles.emptyRefreshBtn}
        onPress={() => void onRefresh()}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh-outline" size={18} color={COLORS.white} style={{ marginRight: 6 }} />
        <Text style={styles.emptyRefreshText}>Check for Updates</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => {
    const iconName = getEmergencyIcon(item.problemType);
    const issueText =
      item.problemType?.replaceAll('_', ' ') ||
      item.serviceIds?.[0]?.name ||
      'Emergency Vehicle Breakdown';
    const customerName = item.customerId?.name || 'Customer';
    const customerPhone = item.customerId?.phone || '';
    const address =
      item.address ||
      [item.addressId?.addressLine1, item.addressId?.city, item.addressId?.pincode]
        .filter(Boolean)
        .join(', ') ||
      'Live Location Shared via GPS';
    const timeAgo = formatTimeAgo(item.createdAt || item.scheduledDate);
    const vehicleText = [
      item.vehicleId?.brand,
      item.vehicleId?.model,
      item.vehicleId?.registrationNumber,
    ]
      .filter(Boolean)
      .join(' · ');

    const status = item.status || 'ASSIGNED';
    const isEnRoute = status === 'EN_ROUTE';
    const isArrived = status === 'ARRIVED';
    const isInProgress = status === 'IN_PROGRESS';

    let badgeBg: string = COLORS.warningLight;
    let badgeColor: string = COLORS.warning;
    if (status === 'ASSIGNED') {
      badgeBg = COLORS.errorLight;
      badgeColor = COLORS.error;
    } else if (isEnRoute || isArrived || isInProgress) {
      badgeBg = COLORS.infoLight;
      badgeColor = COLORS.info;
    } else if (status === 'COMPLETED') {
      badgeBg = COLORS.successLight;
      badgeColor = COLORS.success;
    }

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardIconBox}>
            <Ionicons name={iconName} size={22} color={COLORS.primary} />
          </View>
          <View style={styles.cardTitleBox}>
            <Text style={styles.issueTitle} numberOfLines={1}>
              {issueText}
            </Text>
            <Text style={styles.referenceText}>
              {item.requestNumber || item.bookingNumber || `#SOS-${item._id?.slice(-6)?.toUpperCase()}`}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.statusBadgeText, { color: badgeColor }]}>
              {status.replaceAll('_', ' ')}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* Customer & Vehicle Info */}
        <View style={styles.infoRow}>
          <Ionicons name="person-circle-outline" size={18} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>
            <Text style={styles.infoBold}>{customerName}</Text>
            {customerPhone ? ` · ${customerPhone}` : ''}
          </Text>
        </View>

        {vehicleText ? (
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={18} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>{vehicleText}</Text>
          </View>
        ) : null}

        {/* Location Row */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={COLORS.primary} />
          <Text style={[styles.infoText, styles.locationText]} numberOfLines={2}>
            {address}
          </Text>
        </View>

        {/* Time and Price Row */}
        <View style={styles.metaRow}>
          <View style={styles.timeTag}>
            <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
            <Text style={styles.timeText}>{timeAgo}</Text>
          </View>
          {item.estimatedPrice ? (
            <Text style={styles.estimatedPrice}>
              ₹{Number(item.estimatedPrice).toLocaleString('en-IN')}
            </Text>
          ) : null}
        </View>

        {/* Respond CTA Button */}
        <TouchableOpacity
          style={styles.respondButton}
          onPress={() => onSelectSOS(item)}
          activeOpacity={0.85}
        >
          <Text style={styles.respondButtonText}>Respond →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={emergencies}
        keyExtractor={(item) => item._id || String(Math.random())}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
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
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },
  headerBar: {
    marginBottom: SPACING.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  warningIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: RADII.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  heroBanner: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.full,
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
  },
  liveBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardTitleBox: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
    textTransform: 'capitalize',
  },
  referenceText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.sm,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  infoBold: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  locationText: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  estimatedPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  respondButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  respondButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING['3xl'],
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: SPACING.xl,
    maxWidth: 280,
  },
  emptyRefreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 12,
    borderRadius: RADII.md,
    ...SHADOWS.sm,
  },
  emptyRefreshText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
