import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { useCustomerData } from '../contexts/CustomerDataContext';

export const BookingConfirmationScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { bookingId } = route.params || {};
  const { bookings } = useCustomerData();
  const booking = bookings.find(b => b.id === bookingId) || bookings[0];

  const steps = ['Assigned', 'En Route', 'On Service', 'Completed'];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Success Icon */}
        <View style={s.successCircle}>
          <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
        </View>
        <Text style={s.title}>Booking Confirmed!</Text>
        <Text style={s.subtitle}>Your service request has been assigned.</Text>

        {/* Booking Details Card */}
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.label}>Booking ID</Text>
            <Text style={s.value}>#{booking?.id?.slice(-8) || 'AP20261100'}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <View style={s.rowLeft}>
              <Ionicons name="construct" size={18} color={COLORS.primary} />
              <Text style={s.serviceName}>{booking?.serviceName || 'Engine Oil Change'}</Text>
            </View>
            <Text style={s.price}>₹{booking?.totalAmount?.toLocaleString('en-IN') || '1,299'}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
            <Text style={s.dateText}>{booking?.scheduledDate || '11 Nov 2026'} • {booking?.scheduledTime || '11:00 AM'}</Text>
          </View>
        </View>

        {/* Assigned Mechanic */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>Assigned Mechanic</Text>
          <View style={s.mechanicRow}>
            <View style={s.avatar}><Text style={s.avatarText}>{(booking?.mechanic?.name || 'RY')[0]}</Text></View>
            <View style={s.mechanicInfo}>
              <Text style={s.mechanicName}>{booking?.mechanic?.name || 'Rohan Yadav'}</Text>
              <View style={s.ratingRow}>
                <Ionicons name="star" size={14} color={COLORS.starGold} />
                <Text style={s.ratingText}>{booking?.mechanic?.rating || 4.8} (320 jobs)</Text>
              </View>
              <Text style={s.expText}>6+ years experience</Text>
            </View>
          </View>
        </View>

        {/* Progress Dots */}
        <View style={s.progressRow}>
          {steps.map((step, i) => (
            <View key={step} style={s.progressItem}>
              <View style={[s.dot, i === 0 && s.dotActive]} />
              {i < steps.length - 1 && <View style={s.progressLine} />}
              <Text style={[s.progressLabel, i === 0 && s.progressLabelActive]}>{step}</Text>
            </View>
          ))}
        </View>

        {/* CTAs */}
        <TouchableOpacity style={s.primaryBtn} onPress={() => navigation.navigate('LiveTracking', { bookingId: booking?.id || bookingId })}>
          <Ionicons name="navigate" size={18} color={COLORS.white} />
          <Text style={s.primaryBtnText}>View Tracking →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.secondaryBtn} onPress={() => navigation.navigate('BookingDetail', { bookingId: booking?.id || bookingId, booking })}>
          <Text style={s.secondaryBtnText}>View Booking Details</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { padding: SPACING['2xl'], alignItems: 'center' },
  successCircle: { marginTop: SPACING['3xl'], marginBottom: SPACING.lg },
  title: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginBottom: SPACING['2xl'] },
  card: { backgroundColor: COLORS.white, borderRadius: RADII.md, padding: SPACING.lg, width: '100%', marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SPACING.sm },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary },
  value: { ...TYPOGRAPHY.bodySemibold, color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.xs },
  serviceName: { ...TYPOGRAPHY.h5, color: COLORS.textPrimary },
  price: { ...TYPOGRAPHY.price, color: COLORS.primary },
  dateText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, marginLeft: 6 },
  sectionTitle: { ...TYPOGRAPHY.h5, color: COLORS.textPrimary, marginBottom: SPACING.md },
  mechanicRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  mechanicInfo: { flex: 1 },
  mechanicName: { ...TYPOGRAPHY.h5, color: COLORS.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary },
  expText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: 2 },
  progressRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', width: '100%', paddingHorizontal: SPACING.md, marginBottom: SPACING['2xl'] },
  progressItem: { alignItems: 'center', flex: 1 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.gray300, marginBottom: 6 },
  dotActive: { backgroundColor: COLORS.success },
  progressLine: { position: 'absolute', top: 5, left: '60%', right: '-40%', height: 2, backgroundColor: COLORS.gray200 },
  progressLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, textAlign: 'center' },
  progressLabelActive: { color: COLORS.success, fontWeight: '600' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, width: '100%', height: 52, borderRadius: RADII.md, gap: 8, marginBottom: SPACING.md },
  primaryBtnText: { ...TYPOGRAPHY.buttonLarge, color: COLORS.white },
  secondaryBtn: { width: '100%', height: 48, borderRadius: RADII.md, borderWidth: 1.5, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  secondaryBtnText: { ...TYPOGRAPHY.buttonMedium, color: COLORS.primary },
});
