import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants';
import { SERVICE_CATEGORIES, SAMPLE_SERVICES, INITIAL_BOOKINGS } from '../data/mockData';
import { ServiceCard } from '../components/ServiceCard';
import { EmergencyButton } from '../components/EmergencyButton';
import { BookingCard } from '../components/BookingCard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeMain'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 12) / 2;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [activeBooking] = useState(INITIAL_BOOKINGS.find((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED'));

  const handleCategoryPress = (category: (typeof SERVICE_CATEGORIES)[0]) => {
    // Find matching service or fallback to first sample service
    const matched =
      SAMPLE_SERVICES.find((s) => s.categoryId === category.id) || {
        id: `srv_${category.code.toLowerCase()}`,
        categoryId: category.id,
        categoryName: category.name,
        name: `${category.name} Package`,
        description: category.description,
        price: category.startingPrice,
        estimatedDuration: '2 - 3 hours',
        includedFeatures: [
          'Certified workshop inspection',
          'OEM / OES genuine spare parts used',
          'Free pick-up and drop available',
          '1000 km or 1-month service warranty',
        ],
      };

    navigation.navigate('ServiceDetail', { service: matched });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header */}
        <View style={styles.welcomeBanner}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Car Enthusiast'} 👋</Text>
          </View>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>AUTO PRO</Text>
          </View>
        </View>

        {/* Quick Emergency SOS button */}
        <EmergencyButton
          onPress={() => navigation.navigate('Emergency')}
        />

        {/* Active Booking Card if any */}
        {activeBooking ? (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Booking</Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('BookingDetail', {
                    bookingId: activeBooking.id,
                    booking: activeBooking,
                  })
                }
              >
                <Text style={styles.seeAllText}>Track Live →</Text>
              </TouchableOpacity>
            </View>
            <BookingCard
              booking={activeBooking}
              onPress={() =>
                navigation.navigate('BookingDetail', {
                  bookingId: activeBooking.id,
                  booking: activeBooking,
                })
              }
            />
          </View>
        ) : null}

        {/* Service Categories Grid */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Car Services & Repairs</Text>
            <Text style={styles.sectionSubtitle}>Select category to inspect packages</Text>
          </View>

          <View style={styles.grid}>
            {SERVICE_CATEGORIES.map((cat) => (
              <View key={cat.id} style={{ width: CARD_WIDTH }}>
                <ServiceCard
                  name={cat.name}
                  icon={cat.icon}
                  startingPrice={cat.startingPrice}
                  onPress={() => handleCategoryPress(cat)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Value Proposition banner */}
        <View style={styles.promoCard}>
          <View style={styles.promoTextContainer}>
            <Text style={styles.promoTitle}>🛡️ Auto Pro Assurance</Text>
            <Text style={styles.promoSubtitle}>
              100% Genuine Spare Parts • Free Doorstep Pickup • Transparent Upfront Pricing
            </Text>
          </View>
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
    padding: 18,
    paddingBottom: 32,
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  brandBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  brandBadgeText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  sectionContainer: {
    marginTop: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  promoCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  promoTextContainer: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3730A3',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 12,
    color: '#4338CA',
    lineHeight: 18,
  },
});
