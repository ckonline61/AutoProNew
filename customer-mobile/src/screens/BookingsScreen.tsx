import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LOGO_IMAGE = require('../../assets/logo.jpg');
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { Badge, Card, TabPills, TabPillItem, PriceText } from '../components/ui';
import { useCustomerData } from '../contexts/CustomerDataContext';
import { Booking, BookingStatus } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BookingsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<BookingsStackParamList, 'BookingsMain'>;

type BookingTab = 'upcoming' | 'completed' | 'cancelled';

const UPCOMING_STATUSES: BookingStatus[] = [
  'PENDING',
  'CONFIRMED',
  'MECHANIC_ASSIGNED',
  'ASSIGNED',
  'ACCEPTED',
  'EN_ROUTE',
  'ARRIVED',
  'IN_PROGRESS',
];

const CANCELLED_STATUSES: BookingStatus[] = [
  'CANCELLED',
  'REJECTED',
  'FAILED',
  'NO_SHOW',
];

export const BookingsScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const { bookings, notifications, loading, refresh } = useCustomerData();

  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  const upcomingBookings = useMemo(
    () => bookings.filter((b) => UPCOMING_STATUSES.includes(b.status)),
    [bookings]
  );

  const completedBookings = useMemo(
    () => bookings.filter((b) => b.status === 'COMPLETED'),
    [bookings]
  );

  const cancelledBookings = useMemo(
    () => bookings.filter((b) => CANCELLED_STATUSES.includes(b.status)),
    [bookings]
  );

  const tabs: TabPillItem[] = [
    { key: 'upcoming', label: 'Upcoming', count: upcomingBookings.length },
    { key: 'completed', label: 'Completed', count: completedBookings.length },
    { key: 'cancelled', label: 'Cancelled', count: cancelledBookings.length },
  ];

  const currentList = useMemo(() => {
    switch (activeTab) {
      case 'completed':
        return completedBookings;
      case 'cancelled':
        return cancelledBookings;
      case 'upcoming':
      default:
        return upcomingBookings;
    }
  }, [activeTab, upcomingBookings, completedBookings, cancelledBookings]);

  const handleBookingPress = (booking: Booking) => {
    navigation.navigate('BookingDetail', { bookingId: booking.id, booking });
  };

  const getStatusBadgeConfig = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return { variant: 'success' as const, label: 'Confirmed' };
      case 'MECHANIC_ASSIGNED':
      case 'ASSIGNED':
      case 'ACCEPTED':
      case 'EN_ROUTE':
      case 'ARRIVED':
        return { variant: 'info' as const, label: 'Assigned' };
      case 'IN_PROGRESS':
        return { variant: 'warning' as const, label: 'In Progress' };
      case 'COMPLETED':
        return { variant: 'default' as const, label: 'Completed' };
      case 'CANCELLED':
      case 'REJECTED':
      case 'FAILED':
      case 'NO_SHOW':
        return { variant: 'error' as const, label: 'Cancelled' };
      case 'PENDING':
      default:
        return { variant: 'warning' as const, label: 'Pending' };
    }
  };

  const renderEmptyState = () => {
    let iconName: keyof typeof Ionicons.glyphMap = 'calendar-outline';
    let title = 'No upcoming bookings';
    let subtitle = 'Explore our car services from Home to book an appointment.';

    if (activeTab === 'completed') {
      iconName = 'checkmark-circle-outline';
      title = 'No completed bookings';
      subtitle = 'Past and completed car service history will appear here.';
    } else if (activeTab === 'cancelled') {
      iconName = 'close-circle-outline';
      title = 'No cancelled bookings';
      subtitle = 'You have no cancelled service appointments.';
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name={iconName} size={42} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptySubtitle}>{subtitle}</Text>
      </View>
    );
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const badgeConfig = getStatusBadgeConfig(item.status);

    const locationText =
      item.address?.street
        ? `${item.address.street}, ${item.address.city}`
        : item.serviceType === 'DOORSTEP'
        ? 'Doorstep Service'
        : 'Auto Pro Certified Workshop';

    return (
      <Card
        style={styles.card}
        padding="lg"
        elevation="md"
        onPress={() => handleBookingPress(item)}
      >
        {/* Top Header: Service Icon + Name + Status Badge */}
        <View style={styles.cardHeader}>
          <View style={styles.serviceIconContainer}>
            <Ionicons
              name={item.serviceType === 'DOORSTEP' ? 'home-outline' : 'car-sport-outline'}
              size={20}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.cardTitleBox}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {item.serviceName}
            </Text>
            <Text style={styles.bookingId}>Booking ID: #{item.id}</Text>
          </View>
          <Badge
            text={badgeConfig.label}
            variant={badgeConfig.variant}
            size="sm"
          />
        </View>

        <View style={styles.cardDivider} />

        {/* Vehicle Row (if available) */}
        {item.vehicleDetails ? (
          <View style={styles.infoRow}>
            <Ionicons name="car-outline" size={15} color={COLORS.textSecondary} style={styles.rowIcon} />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.vehicleDetails.brand} {item.vehicleDetails.model}
              {item.vehicleDetails.registrationNumber
                ? ` • ${item.vehicleDetails.registrationNumber}`
                : ''}
            </Text>
          </View>
        ) : null}

        {/* Date & Time Row */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={15} color={COLORS.textSecondary} style={styles.rowIcon} />
          <Text style={styles.infoText}>
            {item.scheduledDate}
            {item.scheduledTime ? `  •  ${item.scheduledTime}` : ''}
          </Text>
        </View>

        {/* Location Row with Pin */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={15} color={COLORS.textSecondary} style={styles.rowIcon} />
          <Text style={styles.infoText} numberOfLines={1}>
            {locationText}
          </Text>
        </View>

        <View style={styles.cardFooterDivider} />

        {/* Bottom Row: Total Amount & Chevron */}
        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.totalLabel}>Total: </Text>
            <PriceText price={item.totalAmount} size="sm" color={COLORS.primary} />
          </View>
          <View style={styles.viewDetailsRow}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Screen Header */}
      <View style={styles.header}>
        {/* Left: AP Logo */}
        <Image source={LOGO_IMAGE} style={styles.logoImage} resizeMode="contain" />

        {/* Center: Title */}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Bookings</Text>
        </View>

        {/* Right: Notification Bell */}
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => {
            // Check if navigation can reach Notifications in parent or same stack
            const nav = navigation as unknown as { navigate: (route: string) => void };
            nav.navigate('Notifications');
          }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
          {unreadNotifCount > 0 && <View style={styles.notificationDot} />}
        </TouchableOpacity>
      </View>

      {/* Tab Pills */}
      <View style={styles.tabSection}>
        <TabPills
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as BookingTab)}
        />
      </View>

      {/* Bookings List */}
      <FlatList
        data={currentList}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => void refresh()}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  logoImage: {
    width: 42,
    height: 42,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  tabSection: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  card: {
    marginBottom: SPACING.md,
    borderRadius: RADII.md,
    backgroundColor: COLORS.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serviceIconContainer: {
    width: 38,
    height: 38,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  cardTitleBox: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  serviceName: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  bookingId: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.sm + 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2,
  },
  rowIcon: {
    marginRight: SPACING.sm,
    width: 16,
  },
  infoText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
  },
  cardFooterDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.primary,
    marginRight: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['4xl'],
    paddingHorizontal: SPACING.xl,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
