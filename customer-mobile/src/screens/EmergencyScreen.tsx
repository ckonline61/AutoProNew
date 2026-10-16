import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { requestError, useCustomerData } from '../contexts/CustomerDataContext';
import { useAuth } from '../contexts/AuthContext';
import { idOf, record } from '../services/customer-data';

interface ProblemOption {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
}

const EMERGENCY_TYPES: ProblemOption[] = [
  { key: 'JUMP_START', label: 'Jump Start', icon: 'flash', description: 'Dead battery restart' },
  { key: 'BATTERY_PROBLEM', label: 'Battery Problem', icon: 'battery-dead', description: 'Testing & replacement' },
  { key: 'FLAT_TYRE', label: 'Flat Tyre', icon: 'disc', description: 'Puncture or spare change' },
  { key: 'FUEL_EMERGENCY', label: 'Fuel Emergency', icon: 'water', description: 'Emergency 5L fuel delivery' },
  { key: 'BREAKDOWN', label: 'Breakdown Assistance', icon: 'build', description: 'On-spot mechanical triage' },
  { key: 'TOWING', label: 'Towing Service', icon: 'car', description: 'Flatbed towing to garage' },
];

const TERMINAL_STATUSES = ['COMPLETED', 'CANCELLED', 'FAILED', 'REJECTED', 'EXPIRED'];

export const EmergencyScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isPreview } = useAuth();
  const { emergencies, vehicles, createEmergency, refreshEmergency, cancelEmergency } = useCustomerData();

  const [selectedType, setSelectedType] = useState<string>('JUMP_START');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');
  const [latitude, setLatitude] = useState<string>(isPreview ? '18.5204' : '');
  const [longitude, setLongitude] = useState<string>(isPreview ? '73.8567' : '');
  const [address, setAddress] = useState<string>('FC Road, Shivajinagar, Pune, Maharashtra');
  const [description, setDescription] = useState<string>('');
  const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [locating, setLocating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const active = emergencies.find((e) => !TERMINAL_STATUSES.includes(String(e.status)));
  const activeId = idOf(active);

  // Poll status when emergency is active
  useEffect(() => {
    if (!activeId || isPreview) return;
    let cancelled = false;
    const reload = () => {
      void refreshEmergency(activeId).catch((err) => {
        if (!cancelled) setError(requestError(err));
      });
    };
    reload();
    const timer = setInterval(reload, 15000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [activeId, isPreview]);

  // Sync selected vehicle if vehicle list loads later
  useEffect(() => {
    if (!selectedVehicleId && vehicles.length > 0) {
      setSelectedVehicleId(vehicles[0].id);
    }
  }, [vehicles, selectedVehicleId]);

  // Request user GPS location
  const handleLocateMe = async () => {
    if (locating) return;
    setLocating(true);
    setError('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Location permission was denied. Please enter address manually.');
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLatitude(String(position.coords.latitude));
      setLongitude(String(position.coords.longitude));

      // Attempt reverse geocode for a human-readable address
      try {
        const reverseResults = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        if (reverseResults.length > 0) {
          const item = reverseResults[0];
          const parts = [item.name, item.street, item.district, item.city, item.postalCode].filter(Boolean);
          if (parts.length > 0) {
            setAddress(parts.join(', '));
          }
        }
      } catch {
        // Fallback to coordinates string if reverse geocoding is unavailable
        setAddress(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
      }
    } catch (err) {
      setError(requestError(err));
    } finally {
      setLocating(false);
    }
  };

  // Submit emergency request
  const handleConfirmRequest = async () => {
    if (busy || active) return;
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!latitude.trim() || !longitude.trim() || isNaN(lat) || isNaN(lng)) {
      setError('Please use "Locate Me" or enter valid coordinates.');
      return;
    }

    setBusy(true);
    setError('');

    const chosenVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    const fullNotes = [
      chosenVehicle ? `Vehicle: ${chosenVehicle.brand} ${chosenVehicle.model} (${chosenVehicle.registrationNumber})` : '',
      description.trim(),
    ]
      .filter(Boolean)
      .join(' | ');

    try {
      await createEmergency({
        problemType: selectedType,
        latitude: lat,
        longitude: lng,
        address: address.trim() || undefined,
        description: fullNotes || undefined,
      });
    } catch (err) {
      setError(requestError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleCancelSOS = () => {
    Alert.alert(
      'Cancel SOS?',
      'Are you sure you want to cancel this emergency assistance request?',
      [
        { text: 'Keep Active', style: 'cancel' },
        {
          text: 'Cancel SOS',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await cancelEmergency(activeId);
            } catch (err) {
              setError(requestError(err));
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  const provider = record(active?.assignedProviderId);
  const providerPhone = typeof provider.phone === 'string' ? provider.phone : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Assistance</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Red Hero Banner */}
        <LinearGradient
          colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroTextContainer}>
            <View style={styles.heroBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.heroBadgeText}>RAPID DISPATCH</Text>
            </View>
            <Text style={styles.heroTitle}>Need help on road?</Text>
            <Text style={styles.heroSubtitle}>We are here 24/7. Auto Pro patrol dispatched in minutes.</Text>
          </View>
          <View style={styles.heroIconCircle}>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.white} />
          </View>
        </LinearGradient>

        {isPreview && (
          <View style={styles.previewNotice}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.info} />
            <Text style={styles.previewNoticeText}>
              Preview Mode: Demo assistance dispatcher. No real mechanic will arrive.
            </Text>
          </View>
        )}

        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* ACTIVE EMERGENCY CARD */}
        {active ? (
          <View style={styles.activeCard}>
            <View style={styles.activeHeaderRow}>
              <View>
                <Text style={styles.activeReqLabel}>SOS REQUEST</Text>
                <Text style={styles.activeReqNumber}>#{String(active.requestNumber || activeId.slice(-6)).toUpperCase()}</Text>
              </View>
              <View style={styles.statusPill}>
                <View style={styles.statusPillDot} />
                <Text style={styles.statusPillText}>{String(active.status).replace(/_/g, ' ')}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Provider Section */}
            {active.assignedProviderId ? (
              <View style={styles.providerRow}>
                <View style={styles.providerAvatar}>
                  <Ionicons name="person" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.providerInfo}>
                  <Text style={styles.providerName}>{String(provider.name || 'Auto Pro Technician')}</Text>
                  <Text style={styles.providerRole}>Assigned Roadside Specialist</Text>
                </View>
                {providerPhone && (
                  <TouchableOpacity
                    style={styles.callProviderBtn}
                    onPress={() => void Linking.openURL(`tel:${providerPhone}`).catch((err) => setError(requestError(err)))}
                  >
                    <Ionicons name="call" size={18} color={COLORS.white} />
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.searchingRow}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.searchingText}>Matching nearest patrol technician to your location...</Text>
              </View>
            )}

            {typeof active.estimatedArrival === 'number' && (
              <View style={styles.etaRow}>
                <Ionicons name="time-outline" size={18} color={COLORS.textSecondary} />
                <Text style={styles.etaText}>
                  Estimated Arrival: <Text style={styles.etaBold}>{active.estimatedArrival} mins</Text>
                </Text>
              </View>
            )}

            {/* Action Buttons for Active SOS */}
            <View style={styles.activeActions}>
              <TouchableOpacity
                disabled={busy}
                onPress={() => void refreshEmergency(activeId).catch((err) => setError(requestError(err)))}
                style={styles.refreshBtn}
              >
                <Ionicons name="refresh" size={16} color={COLORS.textPrimary} />
                <Text style={styles.refreshBtnText}>Refresh Status</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={busy}
                onPress={handleCancelSOS}
                style={styles.cancelSOSBtn}
              >
                <Ionicons name="close-circle-outline" size={16} color={COLORS.emergencyRed} />
                <Text style={styles.cancelSOSBtnText}>Cancel SOS</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            {/* EMERGENCY TYPE SELECTOR (2x3 GRID) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Emergency Issue</Text>
              <Text style={styles.sectionSubtitle}>Choose what assistance your vehicle requires right now</Text>

              <View style={styles.grid}>
                {EMERGENCY_TYPES.map((type) => {
                  const isSelected = selectedType === type.key;
                  return (
                    <TouchableOpacity
                      key={type.key}
                      onPress={() => setSelectedType(type.key)}
                      activeOpacity={0.8}
                      style={[styles.gridCard, isSelected && styles.gridCardSelected]}
                    >
                      <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                        <Ionicons
                          name={type.icon}
                          size={24}
                          color={isSelected ? COLORS.white : COLORS.primary}
                        />
                      </View>
                      <Text
                        style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}
                        numberOfLines={2}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* LOCATION SECTION */}
            <View style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.iconTagRow}>
                  <Ionicons name="location" size={18} color={COLORS.primary} />
                  <Text style={styles.cardHeaderTitle}>Current Location</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsEditingAddress(!isEditingAddress)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.changeLink}>{isEditingAddress ? 'Done' : 'Change'}</Text>
                </TouchableOpacity>
              </View>

              {isEditingAddress ? (
                <View style={styles.editAddressContainer}>
                  <TextInput
                    style={styles.addressInput}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="Enter landmark, road, or area"
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                  />
                  <View style={styles.coordsRow}>
                    <TextInput
                      style={[styles.coordInput, { marginRight: 8 }]}
                      value={latitude}
                      onChangeText={setLatitude}
                      placeholder="Latitude"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="numeric"
                    />
                    <TextInput
                      style={styles.coordInput}
                      value={longitude}
                      onChangeText={setLongitude}
                      placeholder="Longitude"
                      placeholderTextColor={COLORS.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              ) : (
                <Text style={styles.addressDisplay}>{address || 'No address set. Tap Locate Me below.'}</Text>
              )}

              <TouchableOpacity
                style={styles.locateMeBtn}
                onPress={handleLocateMe}
                disabled={locating}
                activeOpacity={0.8}
              >
                {locating ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <>
                    <Ionicons name="locate" size={16} color={COLORS.primary} />
                    <Text style={styles.locateMeText}>Fetch GPS Location</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* VEHICLE SELECTOR SECTION */}
            <View style={styles.sectionCard}>
              <View style={styles.iconTagRow}>
                <Ionicons name="car-sport" size={18} color={COLORS.primary} />
                <Text style={styles.cardHeaderTitle}>Select Vehicle</Text>
              </View>

              {vehicles.length === 0 ? (
                <View style={styles.noVehiclesBox}>
                  <Text style={styles.noVehiclesText}>
                    No saved vehicles found. We will assist you on-site.
                  </Text>
                </View>
              ) : (
                <View style={styles.vehiclesList}>
                  {vehicles.map((v) => {
                    const isSelected = v.id === selectedVehicleId;
                    return (
                      <TouchableOpacity
                        key={v.id}
                        onPress={() => setSelectedVehicleId(v.id)}
                        activeOpacity={0.7}
                        style={[styles.vehicleOption, isSelected && styles.vehicleOptionSelected]}
                      >
                        <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                        <View style={styles.vehicleDetails}>
                          <Text style={[styles.vehicleName, isSelected && styles.vehicleNameSelected]}>
                            {v.brand} {v.model}
                          </Text>
                          <Text style={styles.vehiclePlate}>
                            {v.registrationNumber} • {v.fuelType}
                          </Text>
                        </View>
                        <Ionicons
                          name="car"
                          size={20}
                          color={isSelected ? COLORS.primary : COLORS.gray400}
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* ADDITIONAL SYMPTOMS / NOTES */}
            <View style={styles.sectionCard}>
              <Text style={styles.cardHeaderTitle}>Problem Details (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe what happened (e.g., car won't crank, smoke from hood, front-right tyre punctured)..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                maxLength={500}
              />
            </View>

            {/* CONFIRM BUTTON */}
            <TouchableOpacity
              style={[styles.confirmBtn, busy && styles.btnDisabled]}
              onPress={handleConfirmRequest}
              disabled={busy}
              activeOpacity={0.85}
            >
              {busy ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Text style={styles.confirmBtnText}>Confirm Request</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>
          </>
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
  header: {
    height: 56,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.white,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  heroBanner: {
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  heroTextContainer: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.full,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.white,
    marginRight: 6,
  },
  heroBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    fontWeight: '800',
    marginBottom: 4,
  },
  heroSubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  heroIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoLight,
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginBottom: SPACING.md,
    gap: 8,
  },
  previewNoticeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.info,
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginBottom: SPACING.md,
    gap: 8,
  },
  errorText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.error,
    flex: 1,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  gridCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FEF2F2',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconCircleSelected: {
    backgroundColor: COLORS.primary,
  },
  cardLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  iconTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  cardHeaderTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  changeLink: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    fontWeight: '700',
  },
  addressDisplay: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  editAddressContainer: {
    marginBottom: SPACING.md,
  },
  addressInput: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.sm,
    padding: SPACING.sm,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    minHeight: 50,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  coordsRow: {
    flexDirection: 'row',
  },
  coordInput: {
    flex: 1,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.sm,
    padding: SPACING.sm,
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
  },
  locateMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 10,
    borderRadius: RADII.sm,
    gap: 6,
  },
  locateMeText: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    fontWeight: '700',
  },
  vehiclesList: {
    gap: 8,
    marginTop: 4,
  },
  vehicleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  vehicleOptionSelected: {
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
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  vehicleNameSelected: {
    color: COLORS.primary,
  },
  vehiclePlate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  noVehiclesBox: {
    padding: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderRadius: RADII.sm,
  },
  noVehiclesText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
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
  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.md,
    marginTop: SPACING.xs,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    ...TYPOGRAPHY.buttonLarge,
    color: COLORS.white,
    fontWeight: '700',
  },
  activeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    ...SHADOWS.lg,
  },
  activeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeReqLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activeReqNumber: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.full,
    gap: 6,
  },
  statusPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  statusPillText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.primary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginBottom: SPACING.md,
  },
  providerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  providerRole: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  callProviderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: SPACING.md,
  },
  searchingText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    flex: 1,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.md,
  },
  etaText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  etaBold: {
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  activeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  refreshBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.gray100,
  },
  refreshBtnText: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
  },
  cancelSOSBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.errorLight,
  },
  cancelSOSBtnText: {
    ...TYPOGRAPHY.label,
    color: COLORS.emergencyRed,
  },
});
