import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { Button, Card, Badge, Avatar, RatingStars } from '../components/ui';
import api from '../config/api';

interface LiveTrackingScreenProps {
  navigation?: any;
  route?: {
    params?: {
      bookingId?: string;
      mechanicName?: string;
      mechanicRating?: number;
    };
  };
}

const { width } = Dimensions.get('window');

type TrackingStep = 'ASSIGNED' | 'EN_ROUTE' | 'ON_SERVICE' | 'COMPLETED';

const STEP_CONFIG = [
  { key: 'ASSIGNED', label: 'Assigned', icon: 'checkmark-circle' },
  { key: 'EN_ROUTE', label: 'En Route', icon: 'navigate-circle' },
  { key: 'ON_SERVICE', label: 'In Service', icon: 'construct' },
  { key: 'COMPLETED', label: 'Done', icon: 'ribbon' },
];

/** Map backend booking status → UI TrackingStep */
function mapStatusToStep(status: string): TrackingStep {
  switch (status) {
    case 'ASSIGNED':
      return 'ASSIGNED';
    case 'EN_ROUTE':
      return 'EN_ROUTE';
    case 'IN_PROGRESS':
      return 'ON_SERVICE';
    case 'COMPLETED':
      return 'COMPLETED';
    default:
      return 'EN_ROUTE';
  }
}

export const LiveTrackingScreen: React.FC<LiveTrackingScreenProps> = ({
  route,
  navigation,
}) => {
  const bookingId = route?.params?.bookingId || 'BK-1001';

  // Mechanic info — populated from API, fall back to route params / defaults
  const [mechanicName, setMechanicName] = useState<string>(
    route?.params?.mechanicName || 'Your Mechanic'
  );
  const [mechanicRating, setMechanicRating] = useState<number>(
    route?.params?.mechanicRating || 0
  );
  const [mechanicPhone, setMechanicPhone] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<TrackingStep>('EN_ROUTE');
  const [etaMinutes, setEtaMinutes] = useState(5);
  const [distanceKm, setDistanceKm] = useState('1.8');
  const [loading, setLoading] = useState(true);

  // Map state
  const mapRef = useRef<MapView>(null);
  const [customerLocation, setCustomerLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [mechanicLocation, setMechanicLocation] = useState<{latitude: number; longitude: number} | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Fetch booking data and update state */
  const fetchBooking = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      const booking = response.data?.data ?? response.data;

      if (booking) {
        // Map status to UI step
        if (booking.status) {
          setCurrentStep(mapStatusToStep(booking.status));
        }

        // Extract mechanic info
        const mechanic = booking.mechanicId;
        if (mechanic) {
          if (mechanic.name) setMechanicName(mechanic.name);
          if (typeof mechanic.rating === 'number') setMechanicRating(mechanic.rating);
          if (mechanic.phone) setMechanicPhone(mechanic.phone);
          // Real mechanic location from backend
          if (mechanic.currentLocation?.coordinates) {
            const [lng, lat] = mechanic.currentLocation.coordinates;
            setMechanicLocation({ latitude: lat, longitude: lng });
          }
        }

        // ETA / distance if provided by API
        if (typeof booking.etaMinutes === 'number') {
          setEtaMinutes(booking.etaMinutes);
        }
        if (booking.distanceKm) {
          setDistanceKm(String(booking.distanceKm));
        }
      }
    } catch {
      // Network / API unavailable — keep existing state (params or defaults)
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + polling every 10 seconds
  useEffect(() => {
    fetchBooking();
    pollingRef.current = setInterval(fetchBooking, 10000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  // Get customer's current location for map
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCustomerLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      // Simulate mechanic ~500m away (until real location comes from backend)
      setMechanicLocation({
        latitude: loc.coords.latitude + 0.005,
        longitude: loc.coords.longitude + 0.004,
      });
    })();
  }, []);

  const handleCallMechanic = () => {
    const phone = mechanicPhone ?? '';
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {
        Alert.alert('Call Mechanic', `Calling ${mechanicName} at ${phone}`);
      });
    } else {
      Alert.alert('Call Mechanic', `Mechanic contact unavailable right now.`);
    }
  };

  const handleChatMechanic = () => {
    if (navigation?.navigate) {
      navigation.navigate('Support');
    } else {
      Alert.alert('Chat', 'Opening direct chat with assigned technician.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack && navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Live Tracking</Text>
            <Text style={styles.headerSubtitle}>Booking #{bookingId.slice(-6).toUpperCase()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.sosButton}
          onPress={() => Alert.alert('Auto Pro Emergency SOS', 'Connecting directly with 24/7 Roadside Control Center...')}
        >
          <Ionicons name="warning" size={14} color={COLORS.white} />
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      {/* Real Google Maps */}
      <View style={styles.mapContainer}>
        {customerLocation ? (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: customerLocation.latitude,
              longitude: customerLocation.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsTraffic={true}
          >
            {/* Customer Location Marker */}
            <Marker
              coordinate={customerLocation}
              title="Your Location"
              pinColor={COLORS.primary}
            />

            {/* Mechanic Location Marker */}
            {mechanicLocation && (
              <Marker
                coordinate={mechanicLocation}
                title={mechanicName}
                description="Your mechanic"
              >
                <View style={styles.mechanicMapMarker}>
                  <Ionicons name="car-sport" size={18} color={COLORS.white} />
                </View>
              </Marker>
            )}

            {/* Route line between mechanic and customer */}
            {mechanicLocation && (
              <Polyline
                coordinates={[mechanicLocation, customerLocation]}
                strokeColor={COLORS.primary}
                strokeWidth={3}
                lineDashPattern={[8, 4]}
              />
            )}
          </MapView>
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={48} color={COLORS.gray400} />
            <Text style={styles.mapPlaceholderText}>Getting your location...</Text>
          </View>
        )}

        {/* Floating ETA Badge Overlay */}
        <View style={styles.etaOverlayCard}>
          <View style={styles.etaClockBadge}>
            <Ionicons name="time" size={16} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.etaTitle}>ETA: {etaMinutes} min away</Text>
            <Text style={styles.etaSub}>{distanceKm} km • Live tracking</Text>
          </View>
        </View>

        {/* Recenter Button */}
        <View style={styles.floatingControls}>
          <TouchableOpacity
            style={styles.floatingBtn}
            onPress={() => {
              if (customerLocation && mapRef.current) {
                mapRef.current.animateToRegion({
                  latitude: customerLocation.latitude,
                  longitude: customerLocation.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }, 500);
              }
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.floatingBtn}
            onPress={() => {
              if (mechanicLocation && mapRef.current) {
                mapRef.current.animateToRegion({
                  latitude: mechanicLocation.latitude,
                  longitude: mechanicLocation.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }, 500);
              }
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="car-sport-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sheet Card */}
      <View style={styles.bottomCardContainer}>
        <View style={styles.dragHandle} />

        {/* Status Stepper Header */}
        <View style={styles.statusHeaderRow}>
          <View style={styles.statusPulseDot} />
          <View style={{ flex: 1, marginLeft: SPACING.sm }}>
            <Text style={styles.statusHeadline}>Arriving in {etaMinutes} minutes</Text>
            <Text style={styles.statusSub}>Your TVS certified mechanic is en route with parts</Text>
          </View>
        </View>

        {/* Horizontal Stepper Progress */}
        <View style={styles.stepperWrapper}>
          <View style={styles.stepperLineBackground} />
          <View style={styles.stepperLineActive} />

          <View style={styles.stepsRow}>
            {STEP_CONFIG.map((step, idx) => {
              const isPastOrCurrent =
                idx === 0 || (idx === 1 && currentStep === 'EN_ROUTE');
              const isCurrent = step.key === currentStep;

              return (
                <View key={step.key} style={styles.stepCol}>
                  <View
                    style={[
                      styles.stepDot,
                      isPastOrCurrent && styles.stepDotActive,
                      isCurrent && styles.stepDotPulse,
                    ]}
                  >
                    <Ionicons
                      name={step.icon as any}
                      size={14}
                      color={isPastOrCurrent ? COLORS.white : COLORS.textMuted}
                    />
                  </View>
                  <Text
                    style={[
                      styles.stepText,
                      isPastOrCurrent && styles.stepTextActive,
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Mechanic Profile Row */}
        <Card style={styles.mechanicCard} elevation="none" border>
          <View style={styles.mechanicRow}>
            <Avatar
              name={mechanicName}
              size={48}
              status="online"
              backgroundColor={COLORS.primaryLight}
              textColor={COLORS.primary}
            />

            <View style={styles.mechanicInfo}>
              <View style={styles.rowAlign}>
                <Text style={styles.mechanicNameText}>{mechanicName}</Text>
                <Badge text="TVS Certified" variant="error" size="sm" style={{ marginLeft: 6 }} />
              </View>
              <Text style={styles.mechanicRole}>TVS Master Technician</Text>
              <RatingStars
                rating={mechanicRating}
                reviewCount={142}
                size="sm"
                style={{ marginTop: 2 }}
              />
            </View>

            {/* Quick Actions Call & Message */}
            <View style={styles.actionButtonsCol}>
              <TouchableOpacity
                style={styles.callCircleBtn}
                onPress={handleCallMechanic}
                activeOpacity={0.8}
              >
                <Ionicons name="call" size={18} color={COLORS.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.chatCircleBtn}
                onPress={handleChatMechanic}
                activeOpacity={0.8}
              >
                <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    zIndex: 10,
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
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.full,
    gap: 4,
  },
  sosText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '800',
  },

  // Map Area
  mapContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E8F4FD',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  mechanicMapMarker: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  highwayHorizontal: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    height: 18,
    backgroundColor: '#D1D5DB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#9CA3AF',
  },
  highwayVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '52%',
    width: 22,
    backgroundColor: '#D1D5DB',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#9CA3AF',
  },
  streetDiagonal: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    width: '90%',
    height: 10,
    backgroundColor: '#E2E8F0',
    transform: [{ rotate: '-25deg' }],
  },
  routeTraceLine: {
    position: 'absolute',
    top: '46%',
    left: '32%',
    width: '40%',
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  destinationMarker: {
    position: 'absolute',
    top: '40%',
    right: '22%',
    alignItems: 'center',
  },
  destinationPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    top: -6,
  },
  destinationPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  destinationCallout: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.sm,
    marginTop: 4,
    ...SHADOWS.sm,
  },
  calloutText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  mechanicMarker: {
    position: 'absolute',
    top: '44%',
    left: '26%',
    alignItems: 'center',
  },
  mechanicPulseRing: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    top: -8,
  },
  mechanicPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.black,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  mechanicCallout: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
    marginTop: 4,
    ...SHADOWS.sm,
  },
  mechanicCalloutText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Floating Overlay
  etaOverlayCard: {
    position: 'absolute',
    top: SPACING.md,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADII.full,
    gap: SPACING.sm,
    ...SHADOWS.lg,
  },
  etaClockBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaTitle: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  etaSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  floatingControls: {
    position: 'absolute',
    right: SPACING.lg,
    top: SPACING.md,
    gap: SPACING.sm,
  },
  floatingBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },

  // Bottom Card
  bottomCardContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl,
    ...SHADOWS.xl,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gray300,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusPulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
  },
  statusHeadline: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  statusSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Stepper
  stepperWrapper: {
    position: 'relative',
    marginVertical: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  stepperLineBackground: {
    position: 'absolute',
    top: 14,
    left: '10%',
    right: '10%',
    height: 3,
    backgroundColor: COLORS.gray200,
  },
  stepperLineActive: {
    position: 'absolute',
    top: 14,
    left: '10%',
    width: '35%',
    height: 3,
    backgroundColor: COLORS.primary,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepCol: {
    alignItems: 'center',
    width: width * 0.2,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotPulse: {
    borderColor: COLORS.primaryLight,
    borderWidth: 3,
  },
  stepText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 4,
    fontSize: 10,
  },
  stepTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },

  // Mechanic Card
  mechanicCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: RADII.md,
    padding: SPACING.md,
  },
  mechanicRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mechanicInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mechanicNameText: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  mechanicRole: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  actionButtonsCol: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  callCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  chatCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
