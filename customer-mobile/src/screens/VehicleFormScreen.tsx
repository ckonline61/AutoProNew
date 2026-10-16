import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { FuelType } from '../types';
import { requestError, useCustomerData } from '../contexts/CustomerDataContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';
import { Button, Card } from '../components/ui';

type Props = Partial<NativeStackScreenProps<ProfileStackParamList, 'VehicleForm'>> & {
  navigation?: any;
  route?: any;
};

const FUEL_TYPES: { type: FuelType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'PETROL', label: 'Petrol', icon: 'flame-outline' },
  { type: 'DIESEL', label: 'Diesel', icon: 'water-outline' },
  { type: 'CNG', label: 'CNG', icon: 'speedometer-outline' },
  { type: 'ELECTRIC', label: 'EV', icon: 'flash-outline' },
  { type: 'HYBRID', label: 'Hybrid', icon: 'leaf-outline' },
];

export const VehicleFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const { saveVehicle } = useCustomerData();
  const [saving, setSaving] = useState(false);
  const vehicle = route?.params?.vehicle;
  const isEdit = !!route?.params?.isEdit && !!vehicle;

  const [brand, setBrand] = useState(vehicle?.brand || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [year, setYear] = useState(vehicle?.year ? String(vehicle.year) : String(new Date().getFullYear()));
  const [fuelType, setFuelType] = useState<FuelType>(vehicle?.fuelType || 'PETROL');
  const [registrationNumber, setRegistrationNumber] = useState(vehicle?.registrationNumber || '');
  const [color, setColor] = useState(vehicle?.color || '');
  const [mileage, setMileage] = useState(vehicle?.mileage ? String(vehicle.mileage) : '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!brand.trim()) errs.brand = 'Brand / Make is required (e.g. Hyundai, Tata, Maruti)';
    if (!model.trim()) errs.model = 'Model & Variant is required (e.g. Creta SX, Nexon EV)';

    const numYear = Number(year);
    const maxYear = new Date().getFullYear() + 1;
    if (!year.trim() || isNaN(numYear) || !Number.isInteger(numYear) || numYear < 1900 || numYear > maxYear) {
      errs.year = `Enter a valid manufacturing year (1900 - ${maxYear})`;
    }

    if (!registrationNumber.trim()) {
      errs.registrationNumber = 'Registration number is required (e.g. MH 12 AB 1234)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      await saveVehicle(
        {
          brand: brand.trim(),
          model: model.trim(),
          year: Number(year),
          fuelType,
          registrationNumber: registrationNumber.trim().toUpperCase(),
          color: color.trim() || undefined,
          mileage: mileage.trim() && !isNaN(Number(mileage)) ? Number(mileage) : undefined,
        },
        isEdit ? vehicle?.id : undefined
      );
      if (navigation?.goBack) {
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Save Failed', requestError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {navigation?.goBack && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Vehicle' : 'Add Vehicle'}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Garage Banner Card */}
          <Card style={styles.garageBanner} elevation="none" border>
            <View style={styles.bannerRow}>
              <View style={styles.carIconCircle}>
                <Ionicons name="car-sport" size={26} color={COLORS.primary} />
              </View>
              <View style={styles.bannerInfo}>
                <Text style={styles.bannerTitle}>My Garage Vehicle Specs</Text>
                <Text style={styles.bannerSub}>
                  Used for tailored periodic maintenance schedules, compatible spare parts, and doorstep service.
                </Text>
              </View>
            </View>
          </Card>

          {/* Form Fields Card */}
          <Card style={styles.formCard} elevation="sm" border>
            {/* Make / Manufacturer */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Make / Manufacturer *</Text>
              <TextInput
                style={[styles.input, errors.brand ? styles.inputError : null]}
                placeholder="e.g. Maruti Suzuki, Hyundai, Tata, Honda"
                placeholderTextColor={COLORS.textMuted}
                value={brand}
                onChangeText={(text) => {
                  setBrand(text);
                  if (errors.brand) setErrors((prev) => ({ ...prev, brand: '' }));
                }}
              />
              {errors.brand ? <Text style={styles.errorText}>{errors.brand}</Text> : null}
            </View>

            {/* Model & Variant */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Model & Variant *</Text>
              <TextInput
                style={[styles.input, errors.model ? styles.inputError : null]}
                placeholder="e.g. Creta SX(O), Nexon EV, Swift ZXi"
                placeholderTextColor={COLORS.textMuted}
                value={model}
                onChangeText={(text) => {
                  setModel(text);
                  if (errors.model) setErrors((prev) => ({ ...prev, model: '' }));
                }}
              />
              {errors.model ? <Text style={styles.errorText}>{errors.model}</Text> : null}
            </View>

            {/* Year & Mileage Row */}
            <View style={styles.rowFields}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: SPACING.sm }]}>
                <Text style={styles.fieldLabel}>Year *</Text>
                <TextInput
                  style={[styles.input, errors.year ? styles.inputError : null]}
                  placeholder="e.g. 2022"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={4}
                  value={year}
                  onChangeText={(text) => {
                    setYear(text);
                    if (errors.year) setErrors((prev) => ({ ...prev, year: '' }));
                  }}
                />
                {errors.year ? <Text style={styles.errorText}>{errors.year}</Text> : null}
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Odometer (km)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 35000"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  value={mileage}
                  onChangeText={setMileage}
                />
              </View>
            </View>

            {/* Fuel Type Pill Selector */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Fuel Type *</Text>
              <View style={styles.fuelPillsRow}>
                {FUEL_TYPES.map((item) => {
                  const isSelected = fuelType === item.type;
                  return (
                    <TouchableOpacity
                      key={item.type}
                      style={[styles.fuelPill, isSelected && styles.fuelPillActive]}
                      onPress={() => setFuelType(item.type)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={item.icon}
                        size={14}
                        color={isSelected ? COLORS.white : COLORS.textSecondary}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.fuelPillText, isSelected && styles.fuelPillTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Registration Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Registration Number *</Text>
              <TextInput
                style={[styles.input, errors.registrationNumber ? styles.inputError : null]}
                placeholder="e.g. MH 12 AB 4589"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                value={registrationNumber}
                onChangeText={(text) => {
                  setRegistrationNumber(text.toUpperCase());
                  if (errors.registrationNumber) {
                    setErrors((prev) => ({ ...prev, registrationNumber: '' }));
                  }
                }}
              />
              {errors.registrationNumber ? (
                <Text style={styles.errorText}>{errors.registrationNumber}</Text>
              ) : null}
            </View>

            {/* Color */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Exterior Color (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Polar White, Daytona Grey, Black"
                placeholderTextColor={COLORS.textMuted}
                value={color}
                onChangeText={setColor}
              />
            </View>

            {/* Save CTA */}
            <View style={styles.ctaWrapper}>
              <Button
                title={saving ? 'Saving Vehicle...' : isEdit ? 'Update Vehicle' : 'Save Vehicle'}
                variant="primary"
                size="lg"
                fullWidth
                loading={saving}
                onPress={handleSave}
              />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: SPACING.sm,
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  garageBanner: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  bannerSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.xl,
  },
  fieldGroup: {
    marginBottom: SPACING.lg,
  },
  rowFields: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  fieldLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error,
    marginTop: 4,
  },
  fuelPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs + 2,
  },
  fuelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADII.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.gray50,
  },
  fuelPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  fuelPillText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  fuelPillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  ctaWrapper: {
    marginTop: SPACING.md,
  },
});
