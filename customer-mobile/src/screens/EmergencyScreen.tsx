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
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants';
import { EmergencyProblemType, EmergencyStatus } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Emergency'>;

interface ProblemOption {
  type: EmergencyProblemType;
  title: string;
  emoji: string;
  description: string;
}

const PROBLEM_TYPES: ProblemOption[] = [
  {
    type: 'JUMP_START',
    title: 'Battery Jump Start',
    emoji: '🔋',
    description: 'Dead battery? Portable heavy jump kit on wheels',
  },
  {
    type: 'FLAT_TYRE',
    title: 'Flat Tyre / Puncture',
    emoji: '🛞',
    description: 'Stepney change or on-spot tyre tubeless repair',
  },
  {
    type: 'FUEL_DELIVERY',
    title: 'Emergency Fuel',
    emoji: '⛽',
    description: 'Up to 5 Litres of Petrol or Diesel delivered',
  },
  {
    type: 'BREAKDOWN',
    title: 'Mechanical Breakdown',
    emoji: '⚠️',
    description: 'Engine overheating, clutch failure or unusual smoke',
  },
  {
    type: 'TOWING',
    title: 'Flatbed Towing Truck',
    emoji: '🚛',
    description: 'Hydraulic low-angle flatbed towing to nearest workshop',
  },
];

export const EmergencyScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState<EmergencyProblemType>('JUMP_START');
  const [locationText, setLocationText] = useState('Baner High St, near Orchid Hotel, Pune (GPS ±5m)');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<EmergencyStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRequestSOS = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus('DISPATCHED');
      Alert.alert(
        '🚨 SOS Patrol Dispatched!',
        'An Auto Pro emergency patrol vehicle has been dispatched to your GPS coordinates. Estimated arrival: 14 minutes.',
        [{ text: 'Got it' }]
      );
    }, 1200);
  };

  const handleCancelSOS = () => {
    Alert.alert('Cancel Emergency', 'Are you sure you want to cancel the emergency request?', [
      { text: 'Keep Active', style: 'cancel' },
      {
        text: 'Cancel SOS',
        style: 'destructive',
        onPress: () => {
          setStatus(null);
          Alert.alert('Request Cancelled', 'The emergency patrol has been notified.');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#B91C1C" />

      {/* Emergency SOS Banner Header */}
      <View style={styles.emergencyHeader}>
        <View style={styles.sosBadge}>
          <Text style={styles.sosBadgeText}>🚨 24/7 ROADSIDE ASSISTANCE</Text>
        </View>
        <Text style={styles.headerTitle}>Emergency Breakdown Dispatch</Text>
        <Text style={styles.headerSubtitle}>
          Average response time: &lt; 20 minutes anywhere in the city
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Dispatch Status Card if Dispatched */}
        {status === 'DISPATCHED' && (
          <View style={styles.dispatchedCard}>
            <View style={styles.dispatchedHeader}>
              <View style={styles.pulsingIcon}>
                <Text style={styles.sirenIcon}>🚨</Text>
              </View>
              <View style={styles.dispatchedInfo}>
                <Text style={styles.dispatchedTitle}>Patrol Van En Route</Text>
                <Text style={styles.etaText}>⏱️ Arriving in ~14 mins</Text>
              </View>
            </View>
            <View style={styles.mechanicContact}>
              <Text style={styles.driverName}>Technician: Sunil Jadhav</Text>
              <Text style={styles.vehicleInfo}>Auto Pro Rapid Patrol Van #08 (MH 12 QX 9912)</Text>
            </View>
            <TouchableOpacity
              style={styles.cancelSOSBtn}
              onPress={handleCancelSOS}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelSOSText}>Cancel Request</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Current Location Auto-Detect Card */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Your Current Location</Text>
          <View style={styles.locationBox}>
            <Text style={styles.locationPin}>📍</Text>
            <View style={styles.locationTextContainer}>
              <Text style={styles.detectedTitle}>Auto-Detected GPS Location</Text>
              <TextInput
                style={styles.locationInput}
                value={locationText}
                onChangeText={setLocationText}
                placeholder="Enter nearby landmark or highway milestone"
              />
            </View>
          </View>
          <Text style={styles.locationHint}>
            💡 If safe, park by the shoulder, turn on hazard warning lights and set reflective triangle.
          </Text>
        </View>

        {/* Select Emergency Issue */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Select Problem Type</Text>
          {PROBLEM_TYPES.map((item) => {
            const isSelected = item.type === selectedType;
            return (
              <TouchableOpacity
                key={item.type}
                style={[styles.problemOption, isSelected && styles.problemOptionActive]}
                onPress={() => setSelectedType(item.type)}
                activeOpacity={0.7}
              >
                <View style={styles.emojiContainer}>
                  <Text style={styles.problemEmoji}>{item.emoji}</Text>
                </View>
                <View style={styles.problemContent}>
                  <Text style={[styles.problemTitle, isSelected && styles.problemTitleActive]}>
                    {item.title}
                  </Text>
                  <Text style={styles.problemDesc}>{item.description}</Text>
                </View>
                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Additional Situation Notes */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Specific Symptoms or Hazards</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="e.g. Engine shut down abruptly, highway exit 4, smelling rubber..."
            placeholderTextColor={COLORS.gray400}
            multiline
            numberOfLines={2}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Dispatch Button */}
        <TouchableOpacity
          style={[styles.sosButton, isSubmitting && styles.sosButtonDisabled]}
          onPress={handleRequestSOS}
          disabled={isSubmitting || status === 'DISPATCHED'}
          activeOpacity={0.88}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.sosButtonContent}>
              <Text style={styles.sosButtonEmoji}>🚨</Text>
              <Text style={styles.sosButtonText}>
                {status === 'DISPATCHED' ? 'PATROL IS EN ROUTE' : 'DISPATCH IMMEDIATE HELP'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emergencyHeader: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sosBadge: {
    backgroundColor: '#7F1D1D',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  sosBadgeText: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#FEE2E2',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  dispatchedCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    marginBottom: 16,
  },
  dispatchedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pulsingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sirenIcon: {
    fontSize: 20,
  },
  dispatchedInfo: {
    flex: 1,
  },
  dispatchedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.emergency,
  },
  etaText: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '600',
    marginTop: 2,
  },
  mechanicContact: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  driverName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  vehicleInfo: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cancelSOSBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelSOSText: {
    fontSize: 13,
    color: COLORS.emergency,
    fontWeight: '700',
  },
  card: {
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
  locationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.gray100,
    borderRadius: 10,
    padding: 12,
  },
  locationPin: {
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  locationTextContainer: {
    flex: 1,
  },
  detectedTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  locationInput: {
    fontSize: 13,
    color: COLORS.text,
    padding: 0,
    fontWeight: '500',
  },
  locationHint: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 16,
  },
  problemOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 8,
    backgroundColor: COLORS.cardBackground,
  },
  problemOptionActive: {
    borderColor: COLORS.emergency,
    backgroundColor: '#FEF2F2',
  },
  emojiContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  problemEmoji: {
    fontSize: 18,
  },
  problemContent: {
    flex: 1,
    marginRight: 8,
  },
  problemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  problemTitleActive: {
    color: COLORS.emergency,
  },
  problemDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: COLORS.emergency,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.emergency,
  },
  notesInput: {
    backgroundColor: COLORS.gray100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    fontSize: 13,
    color: COLORS.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  sosButton: {
    backgroundColor: COLORS.emergency,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.emergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
    marginTop: 6,
  },
  sosButtonDisabled: {
    opacity: 0.7,
  },
  sosButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosButtonEmoji: {
    fontSize: 20,
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
