import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { useCustomerData } from '../contexts/CustomerDataContext';
import { ServiceCategory } from '../types';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

const { width } = Dimensions.get('window');

// Service icons mapping for the grid
const SERVICE_ICONS: Record<string, { icon: string; family: 'ionicon' | 'material' }> = {
  'Car Service':      { icon: 'car-sport', family: 'ionicon' },
  'Mechanic at Home': { icon: 'construct', family: 'ionicon' },
  'Spare Parts':      { icon: 'cog', family: 'ionicon' },
  'Used Cars':        { icon: 'car', family: 'ionicon' },
  'Car Inspection':   { icon: 'clipboard-check', family: 'material' },
  'More':             { icon: 'grid', family: 'ionicon' },
};

const getServiceIcon = (name: string) => {
  return SERVICE_ICONS[name] || { icon: 'build', family: 'ionicon' as const };
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { categories, services, bookings, vehicles } = useCustomerData();
  const activeBooking = bookings.find(
    (b) => !['COMPLETED', 'CANCELLED', 'REJECTED', 'FAILED', 'NO_SHOW'].includes(b.status)
  );
  const defaultVehicle = vehicles?.[0];

  const handleCategoryPress = (category: ServiceCategory) => {
    const matched = services.find((s) => s.categoryId === category.id);
    if (!matched) {
      Alert.alert('No services available', 'This category currently has no bookable services.');
      return;
    }
    navigation.navigate('ServiceDetail', { service: matched });
  };

  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header: Location + Logo + Notifications ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.locationRow}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text style={styles.locationText}>Raipur, Chhattisgarh</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCenter}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>AP</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.headerRight}
            onPress={() => navigation.navigate('Emergency')}
          >
            <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* ── Greeting + Vehicle Card ── */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingLeft}>
            <Text style={styles.greetingHi}>Hi {firstName},</Text>
            <Text style={styles.greetingSubtitle}>Your car, our care</Text>
          </View>
          {defaultVehicle && (
            <View style={styles.vehiclePill}>
              <Ionicons name="car-sport" size={16} color={COLORS.primary} />
              <View style={styles.vehiclePillText}>
                <Text style={styles.vehicleName}>
                  {defaultVehicle.brand} {defaultVehicle.model}
                </Text>
                <Text style={styles.vehicleReg}>{defaultVehicle.registrationNumber}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Emergency Assistance Banner ── */}
        <TouchableOpacity
          style={styles.emergencyBanner}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Emergency')}
        >
          <View style={styles.emergencyContent}>
            <View style={styles.emergencyIconCircle}>
              <Ionicons name="warning" size={20} color={COLORS.white} />
            </View>
            <View style={styles.emergencyTextBlock}>
              <Text style={styles.emergencyTitle}>Emergency Assistance</Text>
              <Text style={styles.emergencySubtitle}>Get help on road, 24x7</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
        </TouchableOpacity>

        {/* ── Active Booking Card ── */}
        {activeBooking && (
          <TouchableOpacity
            style={styles.activeBookingCard}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('BookingDetail', {
                bookingId: activeBooking.id,
                booking: activeBooking,
              })
            }
          >
            <View style={styles.activeBookingHeader}>
              <View style={styles.activeBookingBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.activeBookingBadgeText}>{activeBooking.status.replace(/_/g, ' ')}</Text>
              </View>
              <Text style={styles.activeBookingId}>#{activeBooking.id.slice(-6)}</Text>
            </View>
            <Text style={styles.activeBookingService}>{activeBooking.serviceName}</Text>
            <View style={styles.activeBookingFooter}>
              <Text style={styles.activeBookingDate}>
                {activeBooking.scheduledDate} • {activeBooking.scheduledTime}
              </Text>
              <Text style={styles.trackLiveText}>Track Live →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── Our Services ── */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.servicesGrid}>
            {categories.slice(0, 6).map((cat) => {
              const iconInfo = getServiceIcon(cat.name);
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.serviceGridItem}
                  activeOpacity={0.7}
                  onPress={() => handleCategoryPress(cat)}
                >
                  <View style={styles.serviceIconCircle}>
                    {iconInfo.family === 'material' ? (
                      <MaterialCommunityIcons
                        name={iconInfo.icon as any}
                        size={24}
                        color={COLORS.primary}
                      />
                    ) : (
                      <Ionicons name={iconInfo.icon as any} size={24} color={COLORS.primary} />
                    )}
                  </View>
                  <Text style={styles.serviceGridLabel} numberOfLines={2}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Special Offer Banner ── */}
        <View style={styles.offerBanner}>
          <View style={styles.offerBannerLeft}>
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>Special Offer</Text>
            </View>
            <Text style={styles.offerTitle}>
              Flat <Text style={styles.offerHighlight}>20% OFF</Text>
            </Text>
            <Text style={styles.offerSubtitle}>on Car Service</Text>
          </View>
          <View style={styles.offerRight}>
            <TouchableOpacity style={styles.bookNowBtn}>
              <Text style={styles.bookNowText}>Book Now →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── No Services Fallback ── */}
        {services.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="construct-outline" size={48} color={COLORS.gray300} />
            <Text style={styles.emptyText}>
              No services available yet. Pull down to refresh.
            </Text>
          </View>
        )}
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
    paddingBottom: 32,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  headerCenter: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  notifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  // ── Greeting ──
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  greetingLeft: {
    flex: 1,
  },
  greetingHi: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  greetingSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.md,
    gap: 8,
  },
  vehiclePillText: {},
  vehicleName: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
  },
  vehicleReg: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },

  // ── Emergency Banner ──
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderRadius: RADII.md,
  },
  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emergencyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTextBlock: {},
  emergencyTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.white,
  },
  emergencySubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },

  // ── Active Booking ──
  activeBookingCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADII.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.md,
  },
  activeBookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeBookingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.full,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  activeBookingBadgeText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.success,
    textTransform: 'capitalize',
  },
  activeBookingId: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  activeBookingService: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  activeBookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeBookingDate: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  trackLiveText: {
    ...TYPOGRAPHY.buttonSmall,
    color: COLORS.primary,
  },

  // ── Services Grid ──
  sectionContainer: {
    marginTop: SPACING['2xl'],
    paddingHorizontal: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  viewAllText: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.primary,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceGridItem: {
    width: (width - SPACING.lg * 2 - SPACING.md * 2) / 3,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  serviceIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  serviceGridLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // ── Offer Banner ──
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    padding: SPACING.lg,
    borderRadius: RADII.md,
  },
  offerBannerLeft: {
    flex: 1,
  },
  offerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.full,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  offerBadgeText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.white,
  },
  offerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
  },
  offerHighlight: {
    fontWeight: '800',
  },
  offerSubtitle: {
    ...TYPOGRAPHY.body,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  offerRight: {
    marginLeft: SPACING.md,
  },
  bookNowBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADII.sm,
  },
  bookNowText: {
    ...TYPOGRAPHY.buttonSmall,
    color: COLORS.primary,
  },

  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['4xl'],
    gap: SPACING.md,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
