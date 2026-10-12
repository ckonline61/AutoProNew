import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants';
import { Booking, BookingStatus } from '../types';

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
}

const getStatusBadgeConfig = (status: BookingStatus) => {
  switch (status) {
    case 'PENDING':
      return { bg: '#FEF3C7', text: '#92400E', label: 'Pending' };
    case 'CONFIRMED':
      return { bg: '#DBEAFE', text: '#1D4ED8', label: 'Confirmed' };
    case 'MECHANIC_ASSIGNED':
      return { bg: '#E0E7FF', text: '#4338CA', label: 'Mechanic Assigned' };
    case 'IN_PROGRESS':
      return { bg: '#FEF9C3', text: '#A16207', label: 'In Progress' };
    case 'COMPLETED':
      return { bg: '#D1FAE5', text: '#065F46', label: 'Completed' };
    case 'CANCELLED':
      return { bg: '#FEE2E2', text: '#991B1B', label: 'Cancelled' };
    default:
      return { bg: COLORS.gray100, text: COLORS.textSecondary, label: status };
  }
};

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const badge = getStatusBadgeConfig(booking.status);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Booking for ${booking.serviceName}`}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {booking.serviceName}
          </Text>
          <Text style={styles.bookingId}>ID: #{booking.id.slice(-6).toUpperCase()}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusText, { color: badge.text }]}>{badge.label}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Scheduled Date</Text>
          <Text style={styles.detailValue}>
            📅 {booking.scheduledDate} {booking.scheduledTime ? `• ${booking.scheduledTime}` : ''}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>
            {booking.serviceType === 'DOORSTEP' ? '🏠 Doorstep' : '🏬 Workshop'}
          </Text>
        </View>
      </View>

      {booking.vehicleDetails ? (
        <View style={styles.vehicleRow}>
          <Text style={styles.vehicleText}>
            🚘 {booking.vehicleDetails.brand} {booking.vehicleDetails.model} ({booking.vehicleDetails.registrationNumber})
          </Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.amount}>₹{booking.totalAmount}</Text>
        </View>
        <View style={styles.viewDetailBtn}>
          <Text style={styles.viewDetailText}>View Details →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  bookingId: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.text,
  },
  vehicleRow: {
    backgroundColor: COLORS.gray100,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginVertical: 6,
  },
  vehicleText: {
    fontSize: 12,
    color: COLORS.gray700,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  totalLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  viewDetailBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewDetailText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
