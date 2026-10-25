import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { useCustomerData } from '../contexts/CustomerDataContext';
import { saveCarToWishlist, removeCarFromWishlist } from './SavedCarsScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_KEY = 'autopro_saved_car_ids';

export const UsedCarDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { carId } = route.params || {};
  const { usedCars } = useCustomerData();
  const car = usedCars.find(c => c.id === carId) || usedCars[0];

  const [isSaved, setIsSaved] = useState(false);

  // Check if this car is already saved on mount
  useEffect(() => {
    if (!car) return;
    AsyncStorage.getItem(SAVED_KEY).then((raw) => {
      const ids: string[] = raw ? JSON.parse(raw) : [];
      setIsSaved(ids.includes(car.id));
    }).catch(() => {});
  }, [car]);

  const handleToggleSave = async () => {
    if (!car) return;
    if (isSaved) {
      await removeCarFromWishlist(car.id);
      setIsSaved(false);
    } else {
      await saveCarToWishlist(car.id);
      setIsSaved(true);
    }
  };

  if (!car) return <SafeAreaView style={s.container}><Text style={{ padding: 24 }}>Car not found</Text></SafeAreaView>;

  const specs = [
    { icon: 'speedometer', label: `${car.mileage?.toLocaleString('en-IN') || '32,000'} km`, sub: 'Driven' },
    { icon: 'water', label: car.fuelType, sub: 'Fuel' },
    { icon: 'settings', label: car.transmission, sub: 'Transmission' },
    { icon: 'person', label: `${car.ownersCount || 1}${car.ownersCount === 1 ? 'st' : 'nd'} Owner`, sub: 'Ownership' },
  ];

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} /></TouchableOpacity>
          <View style={s.headerRight}>
            <TouchableOpacity onPress={handleToggleSave}>
              <Ionicons
                name={isSaved ? 'heart' : 'heart-outline'}
                size={24}
                color={isSaved ? COLORS.error ?? '#E53935' : COLORS.textPrimary}
              />
            </TouchableOpacity>
            <TouchableOpacity><Ionicons name="share-social-outline" size={24} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
        </View>

        {/* Image Carousel Placeholder */}
        <View style={s.imagePlaceholder}>
          <Ionicons name="car-sport" size={72} color={COLORS.gray400} />
          <View style={s.imageCounter}><Text style={s.imageCounterText}>1/12</Text></View>
        </View>

        {/* Title */}
        <View style={s.content}>
          <Text style={s.carTitle}>{car.brand} {car.model} {car.year}</Text>

          {/* Badges */}
          <View style={s.badgeRow}>
            {car.verified && <View style={s.badgeGreen}><Ionicons name="shield-checkmark" size={12} color={COLORS.success} /><Text style={s.badgeGreenText}>Inspected</Text></View>}
            <View style={s.badgeBlue}><Ionicons name="person" size={12} color={COLORS.info} /><Text style={s.badgeBlueText}>Single Owner</Text></View>
          </View>

          {/* Specs Grid */}
          <View style={s.specsGrid}>
            {specs.map(sp => (
              <View key={sp.sub} style={s.specItem}>
                <Ionicons name={sp.icon as any} size={20} color={COLORS.textSecondary} />
                <Text style={s.specValue}>{sp.label}</Text>
                <Text style={s.specLabel}>{sp.sub}</Text>
              </View>
            ))}
          </View>

          {/* Seller Info */}
          <View style={s.sellerCard}>
            <Text style={s.sectionTitle}>Seller Information</Text>
            <View style={s.sellerRow}>
              <View style={s.sellerAvatar}><Text style={s.sellerAvatarText}>AS</Text></View>
              <View style={s.sellerInfo}>
                <Text style={s.sellerName}>Amit Sharma</Text>
                <Text style={s.sellerType}>Individual Seller</Text>
              </View>
              <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL('tel:+919876543210')}>
                <Ionicons name="call" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Price */}
          <View style={s.priceSection}>
            <Text style={s.priceLabel}>Asking Price</Text>
            <Text style={s.priceValue}>₹{(car.price || 580000).toLocaleString('en-IN')}</Text>
          </View>

          {/* Location */}
          <View style={s.locationRow}>
            <Ionicons name="location" size={16} color={COLORS.textSecondary} />
            <Text style={s.locationText}>{car.location || 'Raipur, CG'}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTAs */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.outlineBtn} onPress={() => navigation.navigate('CarInspection', { carId: car.id })}>
          <Text style={s.outlineBtnText}>Book Inspection</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.primaryBtn} onPress={() => Linking.openURL('tel:+919876543210')}>
          <Ionicons name="call" size={18} color={COLORS.white} />
          <Text style={s.primaryBtnText}>Contact Seller</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  imagePlaceholder: { width: '100%', height: 250, backgroundColor: COLORS.gray100, alignItems: 'center', justifyContent: 'center' },
  imageCounter: { position: 'absolute', top: SPACING.md, right: SPACING.md, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADII.full },
  imageCounterText: { ...TYPOGRAPHY.labelSmall, color: COLORS.white },
  content: { padding: SPACING.lg },
  carTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: SPACING.lg },
  badgeGreen: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.successLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADII.full },
  badgeGreenText: { ...TYPOGRAPHY.labelSmall, color: COLORS.success },
  badgeBlue: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.infoLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADII.full },
  badgeBlueText: { ...TYPOGRAPHY.labelSmall, color: COLORS.info },
  specsGrid: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.gray50, borderRadius: RADII.md, padding: SPACING.lg, marginBottom: SPACING.lg },
  specItem: { alignItems: 'center', gap: 4 },
  specValue: { ...TYPOGRAPHY.label, color: COLORS.textPrimary },
  specLabel: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  sellerCard: { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADII.md, padding: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { ...TYPOGRAPHY.h5, color: COLORS.textPrimary, marginBottom: SPACING.md },
  sellerRow: { flexDirection: 'row', alignItems: 'center' },
  sellerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  sellerAvatarText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  sellerInfo: { flex: 1, marginLeft: SPACING.md },
  sellerName: { ...TYPOGRAPHY.h5, color: COLORS.textPrimary },
  sellerType: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary },
  callBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center' },
  priceSection: { marginBottom: SPACING.md },
  priceLabel: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary },
  priceValue: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: SPACING.md, backgroundColor: COLORS.white, padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
  outlineBtn: { flex: 1, height: 48, borderRadius: RADII.md, borderWidth: 1.5, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  outlineBtnText: { ...TYPOGRAPHY.buttonMedium, color: COLORS.primary },
  primaryBtn: { flex: 1, height: 48, borderRadius: RADII.md, backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  primaryBtnText: { ...TYPOGRAPHY.buttonMedium, color: COLORS.white },
});
