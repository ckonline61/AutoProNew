import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { COLORS } from '../constants';
import { FuelType, Vehicle } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'VehicleForm'>;

const FUEL_TYPES: FuelType[] = ['PETROL', 'DIESEL', 'CNG', 'ELECTRIC', 'HYBRID'];

export const VehicleFormScreen: React.FC<Props> = ({ route, navigation }) => {
  const vehicle = route.params?.vehicle;
  const isEdit = !!route.params?.isEdit && !!vehicle;

  const [brand, setBrand] = useState(vehicle?.brand || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [year, setYear] = useState(vehicle?.year ? String(vehicle.year) : '2023');
  const [fuelType, setFuelType] = useState<FuelType>(vehicle?.fuelType || 'PETROL');
  const [registrationNumber, setRegistrationNumber] = useState(
    vehicle?.registrationNumber || ''
  );
  const [color, setColor] = useState(vehicle?.color || '');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!brand.trim()) errs.brand = 'Brand is required (e.g. Maruti, Hyundai, Tata)';
    if (!model.trim()) errs.model = 'Model is required (e.g. Swift, Creta, Nexon)';
    if (!year.trim() || isNaN(Number(year)) || Number(year) < 1990 || Number(year) > 2027) {
      errs.year = 'Enter a valid year between 1990 and 2026';
    }
    if (!registrationNumber.trim()) {
      errs.registrationNumber = 'Registration number is required (e.g. MH 12 AB 1234)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const savedVehicle: Vehicle = {
      id: vehicle?.id || `veh_${Date.now()}`,
      userId: 'usr_1',
      brand: brand.trim(),
      model: model.trim(),
      year: Number(year),
      fuelType,
      registrationNumber: registrationNumber.trim().toUpperCase(),
      color: color.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    Alert.alert(
      isEdit ? 'Vehicle Updated' : 'Vehicle Added',
      `${savedVehicle.brand} ${savedVehicle.model} has been saved successfully!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{isEdit ? 'Edit Vehicle Details' : 'Add New Vehicle'}</Text>
          <Text style={styles.subtitle}>
            Enter your vehicle details for accurate spare part matching and service estimates.
          </Text>
        </View>

        <View style={styles.card}>
          {/* Brand */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Make / Manufacturer</Text>
            <TextInput
              style={[styles.input, errors.brand ? styles.inputError : null]}
              placeholder="e.g. Hyundai, Toyota, Tata, Honda"
              placeholderTextColor={COLORS.gray400}
              value={brand}
              onChangeText={(text) => {
                setBrand(text);
                if (errors.brand) setErrors((prev) => ({ ...prev, brand: '' }));
              }}
            />
            {errors.brand ? <Text style={styles.errorText}>{errors.brand}</Text> : null}
          </View>

          {/* Model */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Model & Variant</Text>
            <TextInput
              style={[styles.input, errors.model ? styles.inputError : null]}
              placeholder="e.g. Creta SX, Nexon EV, City ZX"
              placeholderTextColor={COLORS.gray400}
              value={model}
              onChangeText={(text) => {
                setModel(text);
                if (errors.model) setErrors((prev) => ({ ...prev, model: '' }));
              }}
            />
            {errors.model ? <Text style={styles.errorText}>{errors.model}</Text> : null}
          </View>

          {/* Year */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Manufacturing Year</Text>
            <TextInput
              style={[styles.input, errors.year ? styles.inputError : null]}
              placeholder="e.g. 2022"
              placeholderTextColor={COLORS.gray400}
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

          {/* Registration Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Registration Number</Text>
            <TextInput
              style={[styles.input, errors.registrationNumber ? styles.inputError : null]}
              placeholder="e.g. MH 12 AB 1234"
              placeholderTextColor={COLORS.gray400}
              autoCapitalize="characters"
              value={registrationNumber}
              onChangeText={(text) => {
                setRegistrationNumber(text.toUpperCase());
                if (errors.registrationNumber) setErrors((prev) => ({ ...prev, registrationNumber: '' }));
              }}
            />
            {errors.registrationNumber ? (
              <Text style={styles.errorText}>{errors.registrationNumber}</Text>
            ) : null}
          </View>

          {/* Fuel Type selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fuel Type</Text>
            <View style={styles.fuelTypeRow}>
              {FUEL_TYPES.map((type) => {
                const isSelected = fuelType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.fuelPill, isSelected && styles.fuelPillActive]}
                    onPress={() => setFuelType(type)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.fuelText, isSelected && styles.fuelTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Color (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Exterior Color (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Polar White, Phantom Black"
              placeholderTextColor={COLORS.gray400}
              value={color}
              onChangeText={setColor}
            />
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{isEdit ? 'Update Vehicle' : 'Save Vehicle'}</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.emergency,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: COLORS.emergency,
    fontSize: 12,
    marginTop: 4,
  },
  fuelTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fuelPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.gray100,
  },
  fuelPillActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  fuelText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  fuelTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
