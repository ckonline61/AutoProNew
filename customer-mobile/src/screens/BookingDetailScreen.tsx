import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { COLORS } from '../constants';
import { StatusTimeline } from '../components/StatusTimeline';
import { INITIAL_BOOKINGS } from '../data/mockData';
import { Booking } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'BookingDetail'>;

export const BookingDetailScreen: React.FC<Props> = ({ route }) => {
  const { bookingId, booking: initialBooking } = route.params;

  const foundBooking =
    initialBooking ||
    INITIAL_BOOKINGS.find((b) => b.id === bookingId) ||
    INITIAL_BOOKINGS[0];

  const [booking, setBooking] = useState<Booking>(foundBooking);

  const canCancel = booking.status === 'PENDING' || booking.status === 'CONFIRMED';

  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? Cancellation charges may apply if cancelled within 2 hours of schedule.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setBooking((prev) => ({
              ...prev,
              status: 'CANCELLED',
              updatedAt: new Date().toISOString(),
            }));
            Alert.alert('Booking Cancelled', 'Your booking has been cancelled.');
          },
        },
      ]
    );
  };

  const handleCallMechanic = () => {
    if (booking.mechanic) {
      Alert.alert(
        'Call Assigned Mechanic',
        `Dialing ${booking.mechanic.name} at ${booking.mechanic.phone}...`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Summary Card */}
        <View style={styles.headerCard}>
          <View style={styles.bookingIdRow}>
            <Text style={styles.bookingId}>Booking ID: #{booking.id.slice(-6).toUpperCase()}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>
                {booking.serviceType === 'DOORSTEP' ? '🏠 Doorstep' : '🏬 Workshop'}
              </Text>
            </View>
          </View>
          <Text style={styles.serviceTitle}>{booking.serviceName}</Text>
          <Text style={styles.scheduleText}>
            📅 {booking.scheduledDate} • {booking.scheduledTime}
          </Text>
        </View>

        {/* Live Status Progress Timeline */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Service Status Progression</Text>
          <StatusTimeline
            currentStatus={booking.status}
            createdAt={booking.createdAt}
            updatedAt={booking.updatedAt}
          />
        </View>

        {/* Mechanic Info Card */}
        {booking.mechanic ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionHeading}>Assigned Service Specialist</Text>
            <View style={styles.mechanicRow}>
              <View style={styles.mechanicAvatar}>
                <Text style={styles.mechanicAvatarText}>👨‍🔧</Text>
              </View>
              <View style={styles.mechanicDetails}>
                <Text style={styles.mechanicName}>{booking.mechanic.name}</Text>
                <Text style={styles.mechanicRating}>
                  ⭐ {booking.mechanic.rating} Rating • Certified Master Tech
                </Text>
              </View>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={handleCallMechanic}
                activeOpacity={0.8}
              >
                <Text style={styles.callBtnText}>📞 Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Vehicle & Address Info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Service & Location Details</Text>

          {booking.vehicleDetails ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailIcon}>🚗</Text>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Vehicle</Text>
                <Text style={styles.detailValue}>
                  {booking.vehicleDetails.brand} {booking.vehicleDetails.model} (
                  {booking.vehicleDetails.registrationNumber})
                </Text>
              </View>
            </View>
          ) : null}

          {booking.address ? (
            <View style={[styles.detailRow, { marginTop: 12 }]}>
              <Text style={styles.detailIcon}>📍</Text>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Address ({booking.address.title})</Text>
                <Text style={styles.detailValue}>
                  {booking.address.street}, {booking.address.city} - {booking.address.zipCode}
                </Text>
              </View>
            </View>
          ) : null}

          {booking.notes ? (
            <View style={[styles.detailRow, { marginTop: 12 }]}>
              <Text style={styles.detailIcon}>📝</Text>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Special Instructions</Text>
                <Text style={styles.detailValue}>{booking.notes}</Text>
              </View>
            </View>
          ) : null}
        </View>

        {/* Payment Summary */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>Payment Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Service Charges</Text>
            <Text style={styles.billValue}>₹{booking.totalAmount}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Doorstep Convenience Fee</Text>
            <Text style={styles.freeText}>FREE</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{booking.totalAmount}</Text>
          </View>
        </View>

        {/* Cancel Button if applicable */}
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancelBooking}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookingIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingId: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  scheduleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  mechanicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  mechanicAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mechanicAvatarText: {
    fontSize: 22,
  },
  mechanicDetails: {
    flex: 1,
  },
  mechanicName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  mechanicRating: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  callBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  callBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  detailIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 18,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  billValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  freeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  cancelBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  cancelBtnText: {
    color: COLORS.emergency,
    fontSize: 14,
    fontWeight: '700',
  },
});
