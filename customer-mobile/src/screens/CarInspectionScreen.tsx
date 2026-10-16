import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';

const CHECKLIST = [
  { icon: 'cog', label: 'Engine & Transmission' },
  { icon: 'alert-circle', label: 'Accident & Paint Check' },
  { icon: 'car', label: 'Interior & Exterior' },
  { icon: 'disc', label: 'Tyres & Brakes' },
  { icon: 'flash', label: 'Electrical & Electronics' },
  { icon: 'speedometer', label: 'Test Drive Report' },
];

export const CarInspectionScreen: React.FC<{ navigation: any; route: any }> = ({ navigation }) => {
  const [location, setLocation] = useState<'Home' | 'Office' | 'Other'>('Home');

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} /></TouchableOpacity>
        <Text style={s.headerTitle}>Book Car Inspection</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.vehicleCard}>
          <Ionicons name="car-sport" size={24} color={COLORS.primary} />
          <View style={{ marginLeft: SPACING.md }}>
            <Text style={s.vehicleName}>Maruti Swift VXI 2021</Text>
            <Text style={s.vehicleSpecs}>CG04AB1234 | 32,000 km | Petrol | Manual</Text>
          </View>
        </View>
        <Text style={s.sectionTitle}>Select Date & Time</Text>
        <View style={s.dateTimeRow}>
          <View style={s.dtBox}><Ionicons name="calendar-outline" size={18} color={COLORS.textSecondary} /><Text style={s.dtText}>20 Oct 2026</Text></View>
          <View style={s.dtBox}><Ionicons name="time-outline" size={18} color={COLORS.textSecondary} /><Text style={s.dtText}>10:00 AM</Text></View>
        </View>
        <Text style={s.sectionTitle}>Inspection Location</Text>
        <View style={s.locationOptions}>
          {(['Home', 'Office', 'Other'] as const).map(loc => (
            <TouchableOpacity key={loc} style={[s.locOption, location === loc && s.locOptionActive]} onPress={() => setLocation(loc)}>
              <View style={[s.radio, location === loc && s.radioActive]}>{location === loc && <View style={s.radioDot} />}</View>
              <Ionicons name={loc === 'Home' ? 'home' : loc === 'Office' ? 'briefcase' : 'location'} size={18} color={location === loc ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[s.locText, location === loc && { color: COLORS.primary }]}>{loc === 'Other' ? 'Other Location' : loc}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.addressCard}><Ionicons name="location" size={16} color={COLORS.primary} /><Text style={s.addressText}>101, Shanti Nagar, Raipur, Chhattisgarh</Text><TouchableOpacity><Text style={s.changeLink}>Change</Text></TouchableOpacity></View>
        <Text style={s.sectionTitle}>Inspection Checklist (50+ Points)</Text>
        <View style={s.checklistGrid}>
          {CHECKLIST.map(item => (<View key={item.label} style={s.checkItem}><Ionicons name="checkmark-circle" size={18} color={COLORS.success} /><Text style={s.checkText}>{item.label}</Text></View>))}
        </View>
        <View style={s.priceCard}><Text style={s.priceLabel}>Inspection Fee</Text><Text style={s.priceValue}>₹1,499</Text></View>
      </ScrollView>
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.bookBtn} onPress={() => Alert.alert('Inspection Booked!', 'Your car inspection has been scheduled.', [{ text: 'OK', onPress: () => navigation.goBack() }])}>
          <Text style={s.bookBtnText}>Book Inspection →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white },
  headerTitle: { ...TYPOGRAPHY.h4, color: COLORS.textPrimary },
  scroll: { padding: SPACING.lg, paddingBottom: 100 },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: RADII.md, ...SHADOWS.sm, marginBottom: SPACING.lg },
  vehicleName: { ...TYPOGRAPHY.h5, color: COLORS.textPrimary },
  vehicleSpecs: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  sectionTitle: { ...TYPOGRAPHY.h5, color: COLORS.textPrimary, marginBottom: SPACING.md, marginTop: SPACING.lg },
  dateTimeRow: { flexDirection: 'row', gap: SPACING.md },
  dtBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: RADII.md, borderWidth: 1, borderColor: COLORS.border },
  dtText: { ...TYPOGRAPHY.bodySemibold, color: COLORS.textPrimary },
  locationOptions: { gap: SPACING.sm },
  locOption: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: RADII.md, borderWidth: 1, borderColor: COLORS.border },
  locOptionActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: COLORS.gray300, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  locText: { ...TYPOGRAPHY.bodySemibold, color: COLORS.textPrimary },
  addressCard: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.sm, paddingHorizontal: SPACING.sm },
  addressText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, flex: 1 },
  changeLink: { ...TYPOGRAPHY.label, color: COLORS.primary },
  checklistGrid: { gap: SPACING.sm },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: RADII.sm },
  checkText: { ...TYPOGRAPHY.body, color: COLORS.textPrimary },
  priceCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, padding: SPACING.lg, borderRadius: RADII.md, marginTop: SPACING.lg, ...SHADOWS.sm },
  priceLabel: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  priceValue: { ...TYPOGRAPHY.priceLarge, color: COLORS.primary },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
  bookBtn: { backgroundColor: COLORS.primary, height: 52, borderRadius: RADII.md, alignItems: 'center', justifyContent: 'center' },
  bookBtnText: { ...TYPOGRAPHY.buttonLarge, color: COLORS.white },
});
