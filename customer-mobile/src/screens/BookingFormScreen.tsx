import React, { useState } from 'react';
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
} from 'react-native';
import { COLORS } from '../constants';
import { INITIAL_VEHICLES, INITIAL_ADDRESSES } from '../data/mockData';
import { Vehicle, Address, ServiceType, Booking } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'BookingForm'>;

const TIME_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
];

export const BookingFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { serviceId, serviceName, price } = route.params;

  const [vehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [addresses] = useState<Address[]>(INITIAL_ADDRESSES);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0]?.id || '');
  const [serviceType, setServiceType] = useState<ServiceType>('DOORSTEP');
  const [selectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  });
  const [selectedSlot, setSelectedSlot] = useState<string>(TIME_SLOTS[0]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const handleConfirmBooking = () => {
    if (!selectedVehicle) {
      Alert.alert('Vehicle Required', 'Please select a vehicle to proceed.');
      return;
    }

    setIsSubmitting(true);

    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      userId: 'usr_1',
      serviceId,
      serviceName,
      vehicleId: selectedVehicle.id,
      vehicleDetails: {
        brand: selectedVehicle.brand,
        model: selectedVehicle.model,
        registrationNumber: selectedVehicle.registrationNumber,
      },
      address: selectedAddress,
      scheduledDate: selectedDate,
      scheduledTime: selectedSlot,
      serviceType,
      status: 'CONFIRMED',
      totalAmount: price,
      notes: notes.trim() || undefined,
      mechanic: {
        id: 'mech_auto_1',
        name: 'Auto Pro Master Technician',
        phone: '+91 9876500000',
        rating: 4.95,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Booking Confirmed! 🎉',
        `Your appointment for ${serviceName} is scheduled. A certified technician will reach out shortly.`,
        [
          {
            text: 'View Booking',
            onPress: () => {
              navigation.replace('BookingDetail', {
                bookingId: newBooking.id,
                booking: newBooking,
              });
            },
          },
        ]
      );
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Service Summary Header */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Service Selected</Text>
          <Text style={styles.serviceTitle}>{serviceName}</Text>
          <Text style={styles.priceTag}>Total: ₹{price}</Text>
        </View>

        {/* Doorstep vs Workshop */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Service Mode</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[
                styles.modeCard,
                serviceType === 'DOORSTEP' && styles.modeCardActive,
              ]}
              onPress={() => setServiceType('DOORSTEP')}
              activeOpacity={0.7}
            >
              <Text style={styles.modeEmoji}>🏠</Text>
              <Text style={[styles.modeTitle, serviceType === 'DOORSTEP' && styles.modeTitleActive]}>
                Doorstep Service
              </Text>
              <Text style={styles.modeDesc}>Mechanic visits your address</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeCard,
                serviceType === 'WORKSHOP' && styles.modeCardActive,
              ]}
              onPress={() => setServiceType('WORKSHOP')}
              activeOpacity={0.7}
            >
              <Text style={styles.modeEmoji}>🏬</Text>
              <Text style={[styles.modeTitle, serviceType === 'WORKSHOP' && styles.modeTitleActive]}>
                Workshop Visit
              </Text>
              <Text style={styles.modeDesc}>Bring car or request free pickup</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Select Vehicle */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Select Vehicle</Text>
          {vehicles.map((v) => {
            const isSelected = v.id === selectedVehicleId;
            return (
              <TouchableOpacity
                key={v.id}
                style={[styles.selectOption, isSelected && styles.selectOptionActive]}
                onPress={() => setSelectedVehicleId(v.id)}
                activeOpacity={0.7}
              >
                <View style={styles.radioDotOuter}>
                  {isSelected && <View style={styles.radioDotInner} />}
                </View>
                <View style={styles.optionDetails}>
                  <Text style={styles.optionTitle}>
                    {v.brand} {v.model} ({v.year})
                  </Text>
                  <Text style={styles.optionSubtitle}>{v.registrationNumber} • {v.fuelType}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Select Address */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Service Address</Text>
          {addresses.map((a) => {
            const isSelected = a.id === selectedAddressId;
            return (
              <TouchableOpacity
                key={a.id}
                style={[styles.selectOption, isSelected && styles.selectOptionActive]}
                onPress={() => setSelectedAddressId(a.id)}
                activeOpacity={0.7}
              >
                <View style={styles.radioDotOuter}>
                  {isSelected && <View style={styles.radioDotInner} />}
                </View>
                <View style={styles.optionDetails}>
                  <Text style={styles.optionTitle}>{a.title}</Text>
                  <Text style={styles.optionSubtitle}>
                    {a.street}, {a.city} - {a.zipCode}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Select Preferred Time Slot */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Preferred Time Slot</Text>
          <View style={styles.slotsGrid}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = slot === selectedSlot;
              return (
                <TouchableOpacity
                  key={slot}
                  style={[styles.slotBadge, isSelected && styles.slotBadgeActive]}
                  onPress={() => setSelectedSlot(slot)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.slotText, isSelected && styles.slotTextActive]}>
                    {slot}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Special Instructions / Symptoms</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="e.g. Unusual engine vibration, brakes squeaking, AC cooling low..."
            placeholderTextColor={COLORS.gray400}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.payableLabel}>Payable Amount</Text>
          <Text style={styles.payableAmount}>₹{price}</Text>
        </View>
        <TouchableOpacity
          style={styles.confirmBtn}
          onPress={handleConfirmBooking}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>
            {isSubmitting ? 'Confirming...' : 'Confirm & Schedule'}
          </Text>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  summaryCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  priceTag: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  section: {
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
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeCard: {
    flex: 1,
    backgroundColor: COLORS.gray100,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  modeCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  modeEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  modeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
    textAlign: 'center',
  },
  modeTitleActive: {
    color: COLORS.primary,
  },
  modeDesc: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 8,
    backgroundColor: COLORS.cardBackground,
  },
  selectOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F7FF',
  },
  radioDotOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  optionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  slotsGrid: {
    gap: 8,
  },
  slotBadge: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
  },
  slotBadgeActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  slotText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  slotTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  notesInput: {
    backgroundColor: COLORS.gray100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    fontSize: 13,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payableLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  payableAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
