/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SHADOWS, SPACING } from '../theme';
import api from '../config/api';

export interface EarningsScreenProps {
  profile: any;
  onBack: () => void;
}

type PeriodType = 'Today' | 'This Week' | 'This Month' | 'All Time';

interface EarningItem {
  id: string;
  serviceName: string;
  customerName: string;
  vehicle: string;
  date: string;
  amount: number;
  _rawDate: Date;
}

interface RawJob {
  _id: string;
  status: string;
  bookingNumber?: string;
  requestNumber?: string;
  estimatedPrice: number;
  updatedAt: string;
  scheduledDate?: string;
  customerId?: { name?: string };
  vehicleId?: { brand?: string; model?: string };
  serviceIds?: { name: string }[];
}

/** Formats an ISO date string into "Today, 2:30 PM" or "14 Oct 2026" */
function formatDate(isoString?: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const timeStr = date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return `Today, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function filterByPeriod(jobs: EarningItem[], period: PeriodType): EarningItem[] {
  const now = new Date();
  if (period === 'All Time') return jobs;

  if (period === 'Today') {
    const todayStart = startOfDay(now);
    return jobs.filter((j) => j._rawDate >= todayStart);
  }

  if (period === 'This Week') {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);
    return jobs.filter((j) => j._rawDate >= weekAgo);
  }

  if (period === 'This Month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return jobs.filter((j) => j._rawDate >= monthStart);
  }

  return jobs;
}

export const EarningsScreen: React.FC<EarningsScreenProps> = ({
  profile,
  onBack,
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('This Week');
  const [allJobs, setAllJobs] = useState<EarningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/mechanics/jobs');
      const rawJobs: RawJob[] = response.data?.data ?? response.data ?? [];

      const completed = rawJobs.filter((job) => job.status === 'COMPLETED');

      const mapped: EarningItem[] = completed.map((job) => {
        const rawDateStr = job.updatedAt || job.scheduledDate || '';
        const rawDate = new Date(rawDateStr);
        return {
          id: job._id,
          serviceName: job.serviceIds?.[0]?.name ?? 'Service',
          customerName: job.customerId?.name ?? 'Customer',
          vehicle:
            [job.vehicleId?.brand, job.vehicleId?.model]
              .filter(Boolean)
              .join(' ') || 'Vehicle',
          date: formatDate(rawDateStr),
          amount: job.estimatedPrice,
          _rawDate: isNaN(rawDate.getTime()) ? new Date(0) : rawDate,
        };
      });

      // Sort newest first
      mapped.sort((a, b) => b._rawDate.getTime() - a._rawDate.getTime());
      setAllJobs(mapped);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load earnings. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const periods: PeriodType[] = ['Today', 'This Week', 'This Month', 'All Time'];

  const periodItems = filterByPeriod(allJobs, selectedPeriod);
  const periodTotal = periodItems.reduce((sum, j) => sum + j.amount, 0);
  const periodJobsCount = periodItems.length;

  // If profile has total earnings recorded in backend, use it for 'All Time'
  const displayTotal =
    selectedPeriod === 'All Time' && profile?.totalEarnings
      ? profile.totalEarnings
      : periodTotal;

  const displayJobsCount =
    selectedPeriod === 'All Time' && profile?.totalJobs
      ? profile.totalJobs
      : periodJobsCount;

  const avgPerJob =
    displayJobsCount > 0 ? Math.round(displayTotal / displayJobsCount) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Bar with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Earnings</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      {/* Loading State */}
      {loading && (
        <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: SPACING.sm, color: COLORS.textSecondary, fontSize: 14 }}>
            Loading earnings…
          </Text>
        </View>
      )}

      {/* Error State */}
      {!loading && error && (
        <View style={{ alignItems: 'center', paddingVertical: SPACING.xl, paddingHorizontal: SPACING.lg }}>
          <Ionicons name="alert-circle-outline" size={36} color={COLORS.error ?? '#ef4444'} />
          <Text style={{ marginTop: SPACING.sm, color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchJobs}
            style={{ marginTop: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: 10, backgroundColor: COLORS.primary, borderRadius: RADII.md }}
            activeOpacity={0.7}
          >
            <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 14 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content — shown only after loading */}
      {!loading && !error && (
        <>
          {/* Total Earnings Card */}
          <View style={styles.totalCard}>
            <View style={styles.totalHeaderRow}>
              <Text style={styles.totalSubtitle}>Total earned ({selectedPeriod.toLowerCase()})</Text>
              <View style={styles.currencyBadge}>
                <Text style={styles.currencyBadgeText}>INR</Text>
              </View>
            </View>
            <Text style={styles.totalAmount}>
              ₹{Number(displayTotal).toLocaleString('en-IN')}
            </Text>
            <Text style={styles.totalFootnote}>
              Includes completed bookings, emergency dispatches &amp; parts margin
            </Text>
          </View>

          {/* Period Tabs */}
          <View style={styles.periodTabsWrapper}>
            {periods.map((period) => {
              const isActive = selectedPeriod === period;
              return (
                <TouchableOpacity
                  key={period}
                  style={[styles.periodTab, isActive && styles.periodTabActive]}
                  onPress={() => setSelectedPeriod(period)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.periodTabText,
                      isActive && styles.periodTabTextActive,
                    ]}
                  >
                    {period}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Stats Row (Jobs Done & Average per Job) */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={styles.statIconCircle}>
                <Ionicons name="checkmark-done" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statNumber}>{displayJobsCount}</Text>
              <Text style={styles.statLabel}>Jobs Completed</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statIconCircle}>
                <Ionicons name="calculator-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statNumber}>₹{avgPerJob.toLocaleString('en-IN')}</Text>
              <Text style={styles.statLabel}>Average per Job</Text>
            </View>
          </View>

          {/* Recent Earnings List Section */}
          <View style={styles.listSection}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Recent Earnings</Text>
              <Text style={styles.sectionCount}>{periodItems.length} entries</Text>
            </View>

            {periodItems.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: SPACING.xl }}>
                <Ionicons name="receipt-outline" size={36} color={COLORS.textMuted} />
                <Text style={{ marginTop: SPACING.sm, color: COLORS.textMuted, fontSize: 14 }}>
                  No earnings for this period
                </Text>
              </View>
            ) : (
              <View style={styles.earningsListCard}>
                {periodItems.map((item, index) => {
                  const isLast = index === periodItems.length - 1;
                  return (
                    <View key={item.id}>
                      <View style={styles.earningItemRow}>
                        <View style={styles.itemLeft}>
                          <Text style={styles.serviceName}>{item.serviceName}</Text>
                          <Text style={styles.customerCaption}>
                            {item.customerName} · {item.vehicle}
                          </Text>
                          <View style={styles.dateRow}>
                            <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                            <Text style={styles.dateText}>{item.date}</Text>
                          </View>
                        </View>

                        <View style={styles.itemRight}>
                          <Text style={styles.amountGreen}>
                            +₹{item.amount.toLocaleString('en-IN')}
                          </Text>
                          <View style={styles.settledBadge}>
                            <Text style={styles.settledBadgeText}>Settled</Text>
                          </View>
                        </View>
                      </View>
                      {!isLast && <View style={styles.itemDivider} />}
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Request Payout CTA Card */}
          <View style={styles.payoutCard}>
            <View style={styles.payoutHeaderRow}>
              <View style={styles.payoutIconBox}>
                <Ionicons name="wallet-outline" size={22} color={COLORS.black} />
              </View>
              <View style={styles.payoutHeaderTextBox}>
                <Text style={styles.payoutTitle}>Direct Payouts</Text>
                <Text style={styles.payoutSubtext}>
                  Automated weekly settlement to your primary bank account
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.payoutButton}
              disabled={true}
              activeOpacity={0.7}
            >
              <Text style={styles.payoutButtonText}>Request Immediate Payout</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.payoutFootnote}>
              Weekly payouts are credited automatically every Monday at 10:00 AM IST.
            </Text>
          </View>
        </>
      )}
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
    marginBottom: SPACING.lg,
  },
  backBtn: {
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.black,
  },
  headerRightSpacer: {
    width: 40,
  },
  totalCard: {
    backgroundColor: COLORS.black,
    borderRadius: RADII.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  totalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalSubtitle: {
    fontSize: 13,
    color: COLORS.gray400,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  currencyBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.sm,
  },
  currencyBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -1,
    marginBottom: 8,
  },
  totalFootnote: {
    fontSize: 12,
    color: COLORS.gray400,
    lineHeight: 16,
  },
  periodTabsWrapper: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray200,
    borderRadius: RADII.md,
    padding: 3,
    marginBottom: SPACING.lg,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADII.sm,
  },
  periodTabActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  periodTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  periodTabTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  statIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  listSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },
  sectionCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  earningsListCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  earningItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  itemLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 2,
  },
  customerCaption: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  amountGreen: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.success,
    marginBottom: 4,
  },
  settledBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADII.xs,
  },
  settledBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.success,
  },
  itemDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: SPACING.md,
  },
  payoutCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm,
  },
  payoutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  payoutIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADII.md,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  payoutHeaderTextBox: {
    flex: 1,
  },
  payoutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  payoutSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  payoutButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    opacity: 0.6,
    borderRadius: RADII.md,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payoutButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.full,
  },
  comingSoonText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  payoutFootnote: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});
