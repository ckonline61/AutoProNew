import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { requestError, useCustomerData } from '../contexts/CustomerDataContext';
import { Badge, RatingStars } from '../components/ui';
import { BookingStatus } from '../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'BookingDetail'>;

interface TimelineStep {
  title: string;
  subtitle: string;
  statuses: BookingStatus[];
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    title: 'Booking Confirmed',
    subtitle: 'Service request registered and scheduled',
    statuses: ['PENDING', 'CONFIRMED'],
  },
  {
    title: 'Mechanic Assigned',
    subtitle: 'Master technician allocated to your vehicle',
    statuses: ['MECHANIC_ASSIGNED', 'ASSIGNED', 'ACCEPTED'],
  },
  {
    title: 'On the Way',
    subtitle: 'Technician dispatched with toolkits & spares',
    statuses: ['EN_ROUTE', 'ARRIVED'],
  },
  {
    title: 'In Progress',
    subtitle: 'Multi-point inspection and servicing underway',
    statuses: ['IN_PROGRESS'],
  },
  {
    title: 'Completed',
    subtitle: 'Service finished, test drive passed & car sanitized',
    statuses: ['COMPLETED'],
  },
];

const getStepActiveIndex = (status: BookingStatus): number => {
  if (['PENDING', 'CONFIRMED'].includes(status)) return 0;
  if (['MECHANIC_ASSIGNED', 'ASSIGNED', 'ACCEPTED'].includes(status)) return 1;
  if (['EN_ROUTE', 'ARRIVED'].includes(status)) return 2;
  if (status === 'IN_PROGRESS') return 3;
  if (status === 'COMPLETED') return 4;
  return 0;
};

export const BookingDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId, booking: initialBooking } = route.params;
  const { bookings, cancelBooking } = useCustomerData();

  const booking = bookings.find((b) => b.id === bookingId) || initialBooking;

  if (!booking) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>Booking Not Found</Text>
        <Text style={styles.errorSubtitle}>
          Could not locate booking details. Please refresh your bookings list.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const canCancel = ['PENDING', 'CONFIRMED', 'ASSIGNED', 'ACCEPTED'].includes(booking.status);
  const activeStepIndex = getStepActiveIndex(booking.status);
  const isCancelled = booking.status === 'CANCELLED';

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? Free cancellation is available up to 2 hours before schedule.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(booking.id, 'Cancelled by customer in app');
            } catch (error) {
              Alert.alert('Cancellation Failed', requestError(error));
            }
          },
        },
      ]
    );
  };

  const handleCallMechanic = () => {
    const phone = booking.mechanic?.phone || '+919876543210';
    void Linking.openURL(`tel:${phone}`).catch((err) =>
      Alert.alert('Cannot make call', requestError(err))
    );
  };

  const handleMessageMechanic = () => {
    const phone = booking.mechanic?.phone || '+919876543210';
    void Linking.openURL(`sms:${phone}`).catch((err) =>
      Alert.alert('Cannot open messages', requestError(err))
    );
  };

  // Itemized breakdown calculations
  const subtotal = Math.round(booking.totalAmount * 0.82);
  const gst = booking.totalAmount - subtotal;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Top Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.circleBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Booking Details</Text>
        <TouchableOpacity
          style={styles.circleBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => (navigation as any).navigate('Home', { screen: 'HomeMain' })}
        >
          <Ionicons name="home-outline" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Banner Area (Placeholder with service icon) */}
        <View style={styles.serviceBanner}>
          <LinearGradient
            colors={['#1E293B', '#0F172A']}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerIconCircle}>
                <MaterialCommunityIcons name="car-wrench" size={32} color={COLORS.white} />
              </View>
              <View style={styles.bannerTextCol}>
                <Text style={styles.bannerCategory}>
                  {booking.serviceType === 'DOORSTEP' ? 'DOORSTEP SERVICE' : 'WORKSHOP VISIT'}
                </Text>
                <Text style={styles.bannerTitle} numberOfLines={2}>
                  {booking.serviceName}
                </Text>
              </View>
            </View>

            <View style={styles.bannerFooter}>
              <View style={styles.bannerDatePill}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.white} />
                <Text style={styles.bannerDateText}>
                  {booking.scheduledDate} • {booking.scheduledTime}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Booking ID + Status Badge Row */}
        <View style={styles.idStatusCard}>
          <View>
            <Text style={styles.bookingIdLabel}>BOOKING ID</Text>
            <Text style={styles.bookingIdValue}>
              #{booking.id.slice(-6).toUpperCase()}
            </Text>
          </View>
          <Badge
            text={booking.status.replace(/_/g, ' ')}
            variant={
              isCancelled
                ? 'error'
                : booking.status === 'COMPLETED'
                ? 'success'
                : ['IN_PROGRESS', 'EN_ROUTE'].includes(booking.status)
                ? 'warning'
                : 'info'
            }
            size="md"
          />
        </View>

        {/* Vertical Stepper Status Timeline */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Service Timeline</Text>
            <Text style={styles.sectionMeta}>
              Updated {new Date(booking.updatedAt || booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {isCancelled ? (
            <View style={styles.cancelledBox}>
              <Ionicons name="close-circle" size={24} color={COLORS.error} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cancelledTitle}>Booking Cancelled</Text>
                <Text style={styles.cancelledSubtitle}>
                  This service appointment was cancelled. No charges applied.
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.timelineContainer}>
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = idx < activeStepIndex;
                const isCurrent = idx === activeStepIndex;
                const isPending = idx > activeStepIndex;

                return (
                  <View key={step.title} style={styles.timelineRow}>
                    {/* Stepper Dot + Connector Line */}
                    <View style={styles.stepperIndicatorCol}>
                      <View
                        style={[
                          styles.stepperDot,
                          isCompleted && styles.stepperDotGreen,
                          isCurrent && styles.stepperDotRed,
                          isPending && styles.stepperDotGray,
                        ]}
                      >
                        {isCompleted ? (
                          <Ionicons name="checkmark" size={12} color={COLORS.white} />
                        ) : isCurrent ? (
                          <View style={styles.stepperInnerDot} />
                        ) : null}
                      </View>
                      {idx < TIMELINE_STEPS.length - 1 && (
                        <View
                          style={[
                            styles.stepperLine,
                            isCompleted ? styles.stepperLineDone : styles.stepperLinePending,
                          ]}
                        />
                      )}
                    </View>

                    {/* Step Title & Description */}
                    <View style={styles.stepperContentCol}>
                      <Text
                        style={[
                          styles.stepTitle,
                          isCurrent && styles.stepTitleCurrent,
                          isCompleted && styles.stepTitleCompleted,
                        ]}
                      >
                        {step.title}
                      </Text>
                      <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Quick Track Button if Mechanic is En Route or In Progress */}
          {['ASSIGNED', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED'].includes(booking.status) && (
            <TouchableOpacity
              style={styles.liveTrackBtn}
              onPress={() =>
                (navigation as any).navigate('LiveTracking', {
                  bookingId: booking.id,
                  mechanicName: booking.mechanic?.name || 'Master Mechanic',
                  mechanicRating: booking.mechanic?.rating || 4.9,
                })
              }
              activeOpacity={0.8}
            >
              <Ionicons name="navigate-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.liveTrackBtnText}>Track Mechanic Live</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Assigned Mechanic Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Assigned Service Specialist</Text>
          <View style={styles.mechanicBox}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.mechanicInfo}>
              <Text style={styles.mechanicName}>
                {booking.mechanic?.name || 'Vikramaditya Shinde'}
              </Text>
              <View style={styles.ratingRow}>
                <RatingStars rating={booking.mechanic?.rating || 4.9} size="sm" />
                <Text style={styles.mechanicExp}>• 6+ yrs exp</Text>
              </View>
              <Text style={styles.mechanicCert}>Auto Pro Certified Master Tech</Text>
            </View>

            {/* Call + Message icon buttons */}
            <View style={styles.actionIconButtons}>
              <TouchableOpacity
                style={styles.iconCircleBtn}
                onPress={handleCallMechanic}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconCircleBtn}
                onPress={handleMessageMechanic}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Vehicle & Address Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Vehicle & Location</Text>

          {booking.vehicleDetails && (
            <View style={styles.detailRow}>
              <View style={styles.detailIconCircle}>
                <Ionicons name="car-sport" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Vehicle</Text>
                <Text style={styles.detailValue}>
                  {booking.vehicleDetails.brand} {booking.vehicleDetails.model}
                </Text>
                <Text style={styles.detailSubValue}>
                  Reg No: {booking.vehicleDetails.registrationNumber}
                </Text>
              </View>
            </View>
          )}

          {booking.address && (
            <View style={[styles.detailRow, { marginTop: 14 }]}>
              <View style={styles.detailIconCircle}>
                <Ionicons name="location" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>
                  Service Address ({booking.address.title})
                </Text>
                <Text style={styles.detailValue}>
                  {booking.address.street}, {booking.address.city} - {booking.address.zipCode}
                </Text>
              </View>
            </View>
          )}

          {booking.notes && (
            <View style={[styles.detailRow, { marginTop: 14 }]}>
              <View style={styles.detailIconCircle}>
                <Ionicons name="document-text" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Customer Note</Text>
                <Text style={styles.detailValue}>{booking.notes}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Payment Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Service Charges</Text>
            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Doorstep Convenience Fee</Text>
            <Text style={styles.freeGreenText}>FREE</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Applicable GST (18%)</Text>
            <Text style={styles.billValue}>₹{gst}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{booking.totalAmount}</Text>
          </View>

          {/* Action to proceed to Payment or view Invoice */}
          <View style={styles.invoiceActionsRow}>
            <TouchableOpacity
              style={styles.payNowBtn}
              onPress={() =>
                (navigation as any).navigate('PaymentCheckout', {
                  bookingId: booking.id,
                  amount: booking.totalAmount,
                  serviceName: booking.serviceName,
                })
              }
              activeOpacity={0.85}
            >
              <Ionicons name="card-outline" size={16} color={COLORS.white} />
              <Text style={styles.payNowBtnText}>Pay Online</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.viewInvoiceBtn}
              onPress={() =>
                (navigation as any).navigate('InvoiceDetail', {
                  bookingId: booking.id,
                })
              }
              activeOpacity={0.85}
            >
              <Ionicons name="receipt-outline" size={16} color={COLORS.textPrimary} />
              <Text style={styles.viewInvoiceBtnText}>Tax Invoice</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cancel Button */}
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelBookingBtn}
            onPress={handleCancelBooking}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle-outline" size={18} color={COLORS.emergencyRed} />
            <Text style={styles.cancelBookingText}>Cancel Service Booking</Text>
          </TouchableOpacity>
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
  topBar: {
    height: 54,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  serviceBanner: {
    borderRadius: RADII.lg,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  bannerGradient: {
    padding: SPACING.lg,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  bannerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerCategory: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryLight,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.white,
    fontWeight: '700',
    marginTop: 2,
  },
  bannerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerDatePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.full,
    gap: 6,
  },
  bannerDateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '600',
  },
  idStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  bookingIdLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bookingIdValue: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  sectionMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    padding: SPACING.md,
    borderRadius: RADII.sm,
    gap: 12,
  },
  cancelledTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.error,
    fontWeight: '700',
  },
  cancelledSubtitle: {
    ...TYPOGRAPHY.caption,
    color: '#991B1B',
    marginTop: 2,
  },
  timelineContainer: {
    paddingVertical: SPACING.xs,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  stepperIndicatorCol: {
    alignItems: 'center',
    width: 28,
    marginRight: 12,
  },
  stepperDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperDotGreen: {
    backgroundColor: COLORS.success,
  },
  stepperDotRed: {
    backgroundColor: COLORS.primary,
  },
  stepperDotGray: {
    backgroundColor: COLORS.gray300,
  },
  stepperInnerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  stepperLine: {
    width: 2,
    minHeight: 32,
    flex: 1,
    marginVertical: 2,
  },
  stepperLineDone: {
    backgroundColor: COLORS.success,
  },
  stepperLinePending: {
    backgroundColor: COLORS.gray200,
  },
  stepperContentCol: {
    flex: 1,
    paddingBottom: 20,
    paddingTop: 1,
  },
  stepTitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  stepTitleCompleted: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  stepTitleCurrent: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  stepSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 14,
  },
  liveTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    borderRadius: RADII.sm,
    gap: 6,
    marginTop: SPACING.xs,
  },
  liveTrackBtnText: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    fontWeight: '700',
  },
  mechanicBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  mechanicInfo: {
    flex: 1,
  },
  mechanicName: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  mechanicExp: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  mechanicCert: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 2,
  },
  actionIconButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  detailValue: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginTop: 1,
  },
  detailSubValue: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  billValue: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  freeGreenText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.sm,
  },
  totalLabel: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    ...TYPOGRAPHY.price,
    color: COLORS.primary,
  },
  invoiceActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SPACING.md,
  },
  payNowBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADII.sm,
    gap: 6,
  },
  payNowBtnText: {
    ...TYPOGRAPHY.buttonSmall,
    color: COLORS.white,
    fontWeight: '700',
  },
  viewInvoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray100,
    paddingVertical: 12,
    borderRadius: RADII.sm,
    gap: 6,
  },
  viewInvoiceBtnText: {
    ...TYPOGRAPHY.buttonSmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  cancelBookingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorLight,
    paddingVertical: 14,
    borderRadius: RADII.md,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: SPACING.xs,
  },
  cancelBookingText: {
    ...TYPOGRAPHY.buttonSmall,
    color: COLORS.emergencyRed,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  errorSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  backBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
  },
  backBtnText: {
    ...TYPOGRAPHY.buttonMedium,
    color: COLORS.white,
  },
});
