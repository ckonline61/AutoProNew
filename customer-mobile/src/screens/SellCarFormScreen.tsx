import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { FuelType } from '../types';
import { Button, Card, Badge } from '../components/ui';

interface SellCarFormScreenProps {
  navigation?: any;
}

const FUEL_OPTIONS: FuelType[] = ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'];
const TRANSMISSION_OPTIONS: ('MANUAL' | 'AUTOMATIC')[] = ['MANUAL', 'AUTOMATIC'];

export const SellCarFormScreen: React.FC<SellCarFormScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('PETROL');
  const [transmission, setTransmission] = useState<'MANUAL' | 'AUTOMATIC'>('MANUAL');
  const [kmDriven, setKmDriven] = useState('');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [city, setCity] = useState('Pune');
  const [ownersCount, setOwnersCount] = useState('1');

  // Step 2 Photos placeholder state
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([
    'Front Angle',
    'Rear Profile',
  ]);

  const [submitting, setSubmitting] = useState(false);

  const validateStep1 = () => {
    if (!make.trim() || !model.trim() || !year.trim() || !kmDriven.trim() || !expectedPrice.trim()) {
      Alert.alert('Required Fields', 'Please fill in all vehicle specifications and expected price.');
      return false;
    }

    const numYear = Number(year);
    if (isNaN(numYear) || numYear < 1995 || numYear > new Date().getFullYear()) {
      Alert.alert('Invalid Year', `Please enter a valid purchase year between 1995 and ${new Date().getFullYear()}.`);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else {
      // Step 3 submission
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        Alert.alert(
          'Listing Submitted!',
          'Your car listing has been created. An Auto Pro inspection expert will contact you within 2 hours for a free doorstep valuation.',
          [
            {
              text: 'View My Listings',
              onPress: () => {
                if (navigation?.goBack) navigation.goBack();
              },
            },
          ]
        );
      }, 700);
    }
  };

  const togglePhoto = (label: string) => {
    setUploadedPhotos((prev) =>
      prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (currentStep > 1) {
              setCurrentStep((prev) => (prev - 1) as any);
            } else if (navigation?.goBack) {
              navigation.goBack();
            }
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sell Your Car</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stepper Progress */}
      <View style={styles.stepperContainer}>
        <View style={styles.stepperRow}>
          {/* Step 1 */}
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                currentStep >= 1 ? styles.stepCircleActive : styles.stepCircleInactive,
              ]}
            >
              {currentStep > 1 ? (
                <Ionicons name="checkmark" size={14} color={COLORS.white} />
              ) : (
                <Text style={styles.stepCircleText}>1</Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                currentStep === 1 ? styles.stepLabelActive : styles.stepLabelInactive,
              ]}
            >
              Details
            </Text>
          </View>

          <View
            style={[
              styles.stepLine,
              currentStep >= 2 ? styles.stepLineActive : styles.stepLineInactive,
            ]}
          />

          {/* Step 2 */}
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                currentStep >= 2 ? styles.stepCircleActive : styles.stepCircleInactive,
              ]}
            >
              {currentStep > 2 ? (
                <Ionicons name="checkmark" size={14} color={COLORS.white} />
              ) : (
                <Text
                  style={[
                    styles.stepCircleText,
                    currentStep < 2 && styles.stepCircleTextInactive,
                  ]}
                >
                  2
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                currentStep === 2 ? styles.stepLabelActive : styles.stepLabelInactive,
              ]}
            >
              Photos
            </Text>
          </View>

          <View
            style={[
              styles.stepLine,
              currentStep >= 3 ? styles.stepLineActive : styles.stepLineInactive,
            ]}
          />

          {/* Step 3 */}
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                currentStep === 3 ? styles.stepCircleActive : styles.stepCircleInactive,
              ]}
            >
              <Text
                style={[
                  styles.stepCircleText,
                  currentStep < 3 && styles.stepCircleTextInactive,
                ]}
              >
                3
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                currentStep === 3 ? styles.stepLabelActive : styles.stepLabelInactive,
              ]}
            >
              Review
            </Text>
          </View>
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
          {currentStep === 1 && (
            /* STEP 1: Details */
            <View style={styles.stepContent}>
              <Card style={styles.promoCard} elevation="none" border>
                <View style={styles.promoRow}>
                  <Ionicons name="shield-checkmark" size={24} color={COLORS.primary} />
                  <View style={{ flex: 1, marginLeft: SPACING.md }}>
                    <Text style={styles.promoTitle}>TVS Assured Best Price Guarantee</Text>
                    <Text style={styles.promoSub}>
                      Free doorstep evaluation, same-day payment, and hassle-free RC transfer assistance.
                    </Text>
                  </View>
                </View>
              </Card>

              <Card style={styles.formCard} elevation="sm" border>
                {/* Make */}
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Make / Brand *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Maruti Suzuki, Hyundai, Honda"
                    placeholderTextColor={COLORS.textMuted}
                    value={make}
                    onChangeText={setMake}
                  />
                </View>

                {/* Model */}
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Model & Variant *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Swift ZXi Plus, Creta SX Petrol"
                    placeholderTextColor={COLORS.textMuted}
                    value={model}
                    onChangeText={setModel}
                  />
                </View>

                {/* Year of Purchase */}
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Year of Purchase *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. 2021"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="number-pad"
                    maxLength={4}
                    value={year}
                    onChangeText={setYear}
                  />
                </View>

                {/* Fuel Type & Transmission Side by Side */}
                <View style={styles.sideBySideRow}>
                  {/* Fuel Type */}
                  <View style={{ flex: 1, marginRight: SPACING.sm }}>
                    <Text style={styles.inputLabel}>Fuel Type *</Text>
                    <View style={styles.pillVerticalStack}>
                      {FUEL_OPTIONS.slice(0, 3).map((f) => {
                        const isSelected = fuelType === f;
                        return (
                          <TouchableOpacity
                            key={f}
                            style={[styles.smallPill, isSelected && styles.smallPillActive]}
                            onPress={() => setFuelType(f)}
                          >
                            <Text
                              style={[
                                styles.smallPillText,
                                isSelected && styles.smallPillTextActive,
                              ]}
                            >
                              {f}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Transmission */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Transmission *</Text>
                    <View style={styles.pillVerticalStack}>
                      {TRANSMISSION_OPTIONS.map((t) => {
                        const isSelected = transmission === t;
                        return (
                          <TouchableOpacity
                            key={t}
                            style={[styles.smallPill, isSelected && styles.smallPillActive]}
                            onPress={() => setTransmission(t)}
                          >
                            <Text
                              style={[
                                styles.smallPillText,
                                isSelected && styles.smallPillTextActive,
                              ]}
                            >
                              {t}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                {/* Kilometres Driven */}
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Kilometres Driven *</Text>
                  <View style={styles.inputWithSuffix}>
                    <TextInput
                      style={[styles.textInput, { flex: 1, borderWidth: 0 }]}
                      placeholder="e.g. 35000"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="number-pad"
                      value={kmDriven}
                      onChangeText={setKmDriven}
                    />
                    <Text style={styles.suffixText}>KM</Text>
                  </View>
                </View>

                {/* Expected Price */}
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Expected Price (₹) *</Text>
                  <View style={styles.inputWithSuffix}>
                    <Text style={styles.prefixText}>₹</Text>
                    <TextInput
                      style={[styles.textInput, { flex: 1, borderWidth: 0 }]}
                      placeholder="e.g. 650000"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="number-pad"
                      value={expectedPrice}
                      onChangeText={setExpectedPrice}
                    />
                  </View>
                </View>

                {/* City Location */}
                <View style={styles.formGroup}>
                  <Text style={styles.inputLabel}>Car Location / City</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Pune, Maharashtra"
                    placeholderTextColor={COLORS.textMuted}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>

                {/* Next CTA Button */}
                <Button
                  title="Next: Upload Photos →"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onPress={handleNext}
                  style={{ marginTop: SPACING.md }}
                />
              </Card>
            </View>
          )}

          {currentStep === 2 && (
            /* STEP 2: Photos */
            <View style={styles.stepContent}>
              <Card style={styles.formCard} elevation="sm" border>
                <Text style={styles.stepHeading}>Upload Car Photos</Text>
                <Text style={styles.stepSub}>
                  Cars with clear exterior and interior photos receive up to 30% higher offers. Tap to select photos.
                </Text>

                <View style={styles.photosGrid}>
                  {[
                    { label: 'Front Angle', icon: 'camera-outline' },
                    { label: 'Rear Profile', icon: 'camera-outline' },
                    { label: 'Left Side', icon: 'camera-outline' },
                    { label: 'Interior Cabin', icon: 'car-outline' },
                    { label: 'Odometer / Cluster', icon: 'speedometer-outline' },
                    { label: 'Engine Bay', icon: 'construct-outline' },
                  ].map((item) => {
                    const isUploaded = uploadedPhotos.includes(item.label);
                    return (
                      <TouchableOpacity
                        key={item.label}
                        style={[styles.photoBox, isUploaded && styles.photoBoxUploaded]}
                        onPress={() => togglePhoto(item.label)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={isUploaded ? 'checkmark-circle' : (item.icon as any)}
                          size={28}
                          color={isUploaded ? COLORS.success : COLORS.textMuted}
                        />
                        <Text style={[styles.photoLabel, isUploaded && styles.photoLabelUploaded]}>
                          {item.label}
                        </Text>
                        <Text style={styles.photoStatusText}>
                          {isUploaded ? 'Attached' : '+ Add Photo'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View style={{ marginTop: SPACING.xl }}>
                  <Button
                    title="Next: Pricing & Review →"
                    variant="primary"
                    size="lg"
                    fullWidth
                    onPress={handleNext}
                  />
                </View>
              </Card>
            </View>
          )}

          {currentStep === 3 && (
            /* STEP 3: Review */
            <View style={styles.stepContent}>
              <Card style={styles.formCard} elevation="sm" border>
                <Text style={styles.stepHeading}>Review Your Listing</Text>
                <Text style={styles.stepSub}>Verify vehicle specs before scheduling inspection.</Text>

                <View style={styles.reviewSummaryCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewCarTitle}>
                      {year || '2021'} {make || 'Maruti Suzuki'} {model || 'Swift'}
                    </Text>
                    <Badge text="Verified Listing" variant="success" size="sm" />
                  </View>

                  <View style={styles.specsRow}>
                    <View style={styles.specItem}>
                      <Text style={styles.specKey}>KM Driven</Text>
                      <Text style={styles.specVal}>{kmDriven || '35,000'} km</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specKey}>Fuel</Text>
                      <Text style={styles.specVal}>{fuelType}</Text>
                    </View>
                    <View style={styles.specItem}>
                      <Text style={styles.specKey}>Transmission</Text>
                      <Text style={styles.specVal}>{transmission}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Your Asking Price</Text>
                    <Text style={styles.priceValue}>
                      ₹{Number(expectedPrice || 650000).toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: SPACING.xl }}>
                  <Button
                    title={submitting ? 'Publishing...' : 'Submit & Book Free Inspection'}
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={submitting}
                    onPress={handleNext}
                  />
                </View>
              </Card>
            </View>
          )}
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
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  stepperContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
  },
  stepCircleInactive: {
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepCircleText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.white,
  },
  stepCircleTextInactive: {
    color: COLORS.textMuted,
  },
  stepLabel: {
    ...TYPOGRAPHY.caption,
    marginTop: 4,
    fontWeight: '600',
  },
  stepLabelActive: {
    color: COLORS.primary,
  },
  stepLabelInactive: {
    color: COLORS.textMuted,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: SPACING.sm,
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  stepLineInactive: {
    backgroundColor: COLORS.border,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  stepContent: {
    gap: SPACING.md,
  },
  promoCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    padding: SPACING.md,
    borderRadius: RADII.md,
  },
  promoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoTitle: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.primary,
  },
  promoSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.xl,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  inputWithSuffix: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingRight: SPACING.md,
  },
  suffixText: {
    ...TYPOGRAPHY.label,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  prefixText: {
    ...TYPOGRAPHY.h4,
    color: COLORS.primary,
    paddingLeft: SPACING.md,
    fontWeight: '700',
  },
  sideBySideRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  pillVerticalStack: {
    gap: 6,
  },
  smallPill: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  smallPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  smallPillText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  smallPillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  stepHeading: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  stepSub: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: SPACING.lg,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  photoBox: {
    width: '47%',
    height: 110,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
  },
  photoBoxUploaded: {
    borderStyle: 'solid',
    borderColor: COLORS.success,
    backgroundColor: '#F0FDF4',
  },
  photoLabel: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 6,
    textAlign: 'center',
  },
  photoLabelUploaded: {
    color: COLORS.success,
  },
  photoStatusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  reviewSummaryCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewCarTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  specItem: {
    alignItems: 'flex-start',
  },
  specKey: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  specVal: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textSecondary,
  },
  priceValue: {
    ...TYPOGRAPHY.priceLarge,
    color: COLORS.primary,
  },
});
