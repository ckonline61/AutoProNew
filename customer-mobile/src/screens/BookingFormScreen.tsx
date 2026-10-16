import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { requestError, useCustomerData } from '../contexts/CustomerDataContext';
import { ServiceType } from '../types';

type Props = NativeStackScreenProps<HomeStackParamList, 'BookingForm'>;

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '12:00 PM - 01:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '06:00 PM - 07:00 PM',
];

export const BookingFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { serviceId, serviceName, price } = route.params;
  const { vehicles, addresses, createBooking } = useCustomerData();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0]?.id || '');
  const [serviceType, setServiceType] = useState<ServiceType>('DOORSTEP');

  // Generate today + next 6 days
  const calendarDays = useMemo(() => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      days.push({
        dateStr: `${yyyy}-${mm}-${dd}`,
        dayName: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : dayNames[d.getDay()],
        dayNum: d.getDate(),
        month: monthNames[d.getMonth()],
      });
    }
    return days;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(calendarDays[1]?.dateStr || calendarDays[0].dateStr);
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  const handleConfirmBooking = async () => {
    if (isSubmitting) return;

    if (!selectedVehicle?.id) {
      Alert.alert('Vehicle Required', 'Please select or add a vehicle first.');
      return;
    }

    if (serviceType === 'DOORSTEP' && !selectedAddress?.id) {
      Alert.alert('Address Required', 'Please add a doorstep service address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const booking = await createBooking({
        vehicleId: selectedVehicle.id,
        serviceId,
        addressId: serviceType === 'DOORSTEP' ? selectedAddress?.id : undefined,
        scheduledDate: selectedDate,
        scheduledTime: selectedSlot,
        serviceType,
        notes: notes.trim() || undefined,
      });

      navigation.replace('BookingDetail', { bookingId: booking.id, booking });
    } catch (error) {
      Alert.alert('Booking Failed', requestError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <Text style={styles.topBarTitle}>Schedule Service</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* 3-Step Indicator (Details -> Schedule -> Confirm) */}
      <View style={styles.stepIndicatorContainer}>
        <View style={styles.stepItem}>
          <View style={[styles.stepDot, styles.stepDotDone]}>
            <Ionicons name="checkmark" size={12} color={COLORS.white} />
          </View>
          <Text style={[styles.stepLabel, styles.stepLabelActive]}>Details</Text>
        </View>
        <View style={[styles.stepLine, styles.stepLineActive]} />

        <View style={styles.stepItem}>
          <View style={[styles.stepDot, styles.stepDotActive]}>
            <Text style={styles.stepNum}>2</Text>
          </View>
          <Text style={[styles.stepLabel, styles.stepLabelActive]}>Schedule</Text>
        </View>
        <View style={styles.stepLine} />

        <View style={styles.stepItem}>
          <View style={styles.stepDot}>
            <Text style={styles.stepNumInactive}>3</Text>
          </View>
          <Text style={styles.stepLabel}>Confirm</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Selected Service Summary Card */}
        <View style={styles.serviceSummaryCard}>
          <View style={styles.serviceIconCircle}>
            <MaterialCommunityIcons name="car-wrench" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.serviceSummaryInfo}>
            <Text style={styles.summaryServiceLabel}>SERVICE SELECTED</Text>
            <Text style={styles.summaryServiceName} numberOfLines={1}>
              {serviceName}
            </Text>
            <Text style={styles.summaryPrice}>₹{price}</Text>
          </View>
        </View>

        {/* Service Mode Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Service Mode</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[
                styles.modeCard,
                serviceType === 'DOORSTEP' && styles.modeCardActive,
              ]}
              onPress={() => setServiceType('DOORSTEP')}
              activeOpacity={0.8}
            >
              <View style={[styles.modeIconCircle, serviceType === 'DOORSTEP' && styles.modeIconCircleActive]}>
                <Ionicons
                  name="home"
                  size={20}
                  color={serviceType === 'DOORSTEP' ? COLORS.primary : COLORS.gray500}
                />
              </View>
              <Text
                style={[
                  styles.modeTitle,
                  serviceType === 'DOORSTEP' && styles.modeTitleActive,
                ]}
              >
                Doorstep
              </Text>
              <Text style={styles.modeSubtitle}>Technician visits you</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeCard,
                serviceType === 'WORKSHOP' && styles.modeCardActive,
              ]}
              onPress={() => setServiceType('WORKSHOP')}
              activeOpacity={0.8}
            >
              <View style={[styles.modeIconCircle, serviceType === 'WORKSHOP' && styles.modeIconCircleActive]}>
                <Ionicons
                  name="business"
                  size={20}
                  color={serviceType === 'WORKSHOP' ? COLORS.primary : COLORS.gray500}
                />
              </View>
              <Text
                style={[
                  styles.modeTitle,
                  serviceType === 'WORKSHOP' && styles.modeTitleActive,
                ]}
              >
                Workshop
              </Text>
              <Text style={styles.modeSubtitle}>Free car pickup</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizontal Calendar Strip (Select Date) */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <Text style={styles.selectedDateBadge}>{selectedDate}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarStrip}
          >
            {calendarDays.map((item) => {
              const isSelected = selectedDate === item.dateStr;
              return (
                <TouchableOpacity
                  key={item.dateStr}
                  onPress={() => setSelectedDate(item.dateStr)}
                  activeOpacity={0.75}
                  style={[
                    styles.datePill,
                    isSelected && styles.datePillSelected,
                  ]}
                >
                  <Text style={[styles.dateDayName, isSelected && styles.dateTextSelected]}>
                    {item.dayName}
                  </Text>
                  <Text style={[styles.dateDayNum, isSelected && styles.dateTextSelected]}>
                    {item.dayNum}
                  </Text>
                  <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>
                    {item.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 8 Time Slot Grid Pills */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Time Slot</Text>
          <Text style={styles.sectionSubtitle}>Technician will arrive within the selected 1-hour window</Text>

          <View style={styles.slotsGrid}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <TouchableOpacity
                  key={slot}
                  onPress={() => setSelectedSlot(slot)}
                  activeOpacity={0.75}
                  style={[
                    styles.slotPill,
                    isSelected && styles.slotPillSelected,
                  ]}
                >
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={isSelected ? COLORS.primary : COLORS.gray500}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.slotPillText,
                      isSelected && styles.slotPillTextSelected,
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Select Vehicle Section */}
        <View style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle}>Select Vehicle</Text>
            <TouchableOpacity onPress={() => (navigation as any).navigate('Profile', { screen: 'VehicleForm' })}>
              <Text style={styles.headerActionLink}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {vehicles.length === 0 ? (
            <View style={styles.emptyNotice}>
              <Ionicons name="car-outline" size={24} color={COLORS.gray400} />
              <Text style={styles.emptyNoticeText}>No vehicles saved yet. Please add your car.</Text>
            </View>
          ) : (
            <View style={styles.radioList}>
              {vehicles.map((v) => {
                const isSelected = v.id === selectedVehicle?.id;
                return (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => setSelectedVehicleId(v.id)}
                    activeOpacity={0.7}
                    style={[styles.radioCard, isSelected && styles.radioCardSelected]}
                  >
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <View style={styles.radioInfo}>
                      <Text style={[styles.radioTitle, isSelected && styles.radioTitleActive]}>
                        {v.brand} {v.model} ({v.year})
                      </Text>
                      <Text style={styles.radioSubtitle}>
                        {v.registrationNumber} • {v.fuelType}
                      </Text>
                    </View>
                    <Ionicons
                      name="car-sport"
                      size={20}
                      color={isSelected ? COLORS.primary : COLORS.gray400}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Service Address Section (if Doorstep) */}
        {serviceType === 'DOORSTEP' && (
          <View style={styles.sectionCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionTitle}>Service Address</Text>
              <TouchableOpacity onPress={() => (navigation as any).navigate('Profile', { screen: 'Addresses' })}>
                <Text style={styles.headerActionLink}>Change</Text>
              </TouchableOpacity>
            </View>

            {addresses.length === 0 ? (
              <View style={styles.emptyNotice}>
                <Ionicons name="location-outline" size={24} color={COLORS.gray400} />
                <Text style={styles.emptyNoticeText}>No address found. Please add a doorstep address.</Text>
              </View>
            ) : (
              <View style={styles.radioList}>
                {addresses.map((a) => {
                  const isSelected = a.id === selectedAddress?.id;
                  return (
                    <TouchableOpacity
                      key={a.id}
                      onPress={() => setSelectedAddressId(a.id)}
                      activeOpacity={0.7}
                      style={[styles.radioCard, isSelected && styles.radioCardSelected]}
                    >
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                        {isSelected && <View style={styles.radioInner} />}
                      </View>
                      <View style={styles.radioInfo}>
                        <Text style={[styles.radioTitle, isSelected && styles.radioTitleActive]}>
                          {a.title}
                        </Text>
                        <Text style={styles.radioSubtitle} numberOfLines={2}>
                          {a.street}, {a.city} - {a.zipCode}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {/* Special Instructions Multiline Input */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Special Instructions / Symptoms</Text>
          <Text style={styles.sectionSubtitle}>Any specific noise, issue, or inspection notes for the technician</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="e.g. Unusual engine vibration, brakes squeaking at low speed, AC cooling seems low..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
            maxLength={400}
          />
        </View>
      </ScrollView>

      {/* Fixed Bottom Sticky Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Total Payable</Text>
          <Text style={styles.bottomPriceValue}>₹{price}</Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, isSubmitting && styles.btnDisabled]}
          onPress={handleConfirmBooking}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.confirmBtnText}>Confirm Booking</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotDone: {
    backgroundColor: COLORS.success,
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepNumInactive: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  stepLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.gray200,
    marginHorizontal: 8,
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: COLORS.success,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 110,
  },
  serviceSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    padding: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: SPACING.md,
  },
  serviceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    ...SHADOWS.sm,
  },
  serviceSummaryInfo: {
    flex: 1,
  },
  summaryServiceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  summaryServiceName: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  summaryPrice: {
    ...TYPOGRAPHY.price,
    color: COLORS.primary,
    marginTop: 2,
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
  sectionTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  selectedDateBadge: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.xs,
  },
  headerActionLink: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    fontWeight: '700',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SPACING.xs,
  },
  modeCard: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  modeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FEF2F2',
  },
  modeIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  modeIconCircleActive: {
    backgroundColor: COLORS.primaryLight,
  },
  modeTitle: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  modeTitleActive: {
    color: COLORS.primary,
  },
  modeSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  calendarStrip: {
    gap: 8,
    paddingVertical: SPACING.xs,
  },
  datePill: {
    width: 60,
    height: 76,
    borderRadius: RADII.md,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  datePillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  dateDayName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  dateDayNum: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginVertical: 2,
  },
  dateMonth: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  dateTextSelected: {
    color: COLORS.white,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: SPACING.xs,
  },
  slotPill: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  slotPillSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FEF2F2',
  },
  slotPillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  slotPillTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  radioList: {
    gap: 8,
    marginTop: SPACING.xs,
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  radioCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FEF2F2',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray400,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  radioInfo: {
    flex: 1,
  },
  radioTitle: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  radioTitleActive: {
    color: COLORS.primary,
  },
  radioSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyNotice: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.gray50,
    borderRadius: RADII.sm,
    gap: 6,
  },
  emptyNoticeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  notesInput: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.sm,
    padding: SPACING.md,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    minHeight: 70,
    textAlignVertical: 'top',
    marginTop: SPACING.xs,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.lg,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  bottomPriceValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontWeight: '800',
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...SHADOWS.md,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    ...TYPOGRAPHY.buttonMedium,
    color: COLORS.white,
    fontWeight: '700',
  },
});
