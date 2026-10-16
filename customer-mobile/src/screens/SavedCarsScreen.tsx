import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { Card, Badge, TabPills, Button, TabPillItem } from '../components/ui';

interface SavedCarsScreenProps {
  navigation?: any;
}

interface SavedCarItem {
  id: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  location: string;
  imageUrl?: string;
  inspectionScore: number;
  isFavorite: boolean;
  category: 'Shortlisted' | 'Viewed';
}

const INITIAL_SAVED_CARS: SavedCarItem[] = [
  {
    id: 'car_1',
    brand: 'Honda',
    model: 'City ZX CVT Petrol',
    variant: 'ZX (Sunroof, Leather)',
    year: 2021,
    price: 1140000,
    mileage: 32000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    location: 'Baner, Pune',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600',
    inspectionScore: 9.4,
    isFavorite: true,
    category: 'Shortlisted',
  },
  {
    id: 'car_2',
    brand: 'Tata',
    model: 'Harrier XZA+ Dark Edition',
    variant: 'XZA+ Kryotec Flagship',
    year: 2022,
    price: 1890000,
    mileage: 28500,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    location: 'Kothrud, Pune',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600',
    inspectionScore: 9.6,
    isFavorite: true,
    category: 'Shortlisted',
  },
  {
    id: 'car_3',
    brand: 'Volkswagen',
    model: 'Polo GT 1.0 TSI',
    variant: 'GT Highline Plus TSI',
    year: 2020,
    price: 785000,
    mileage: 41000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    location: 'Viman Nagar, Pune',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600',
    inspectionScore: 9.1,
    isFavorite: true,
    category: 'Viewed',
  },
  {
    id: 'car_4',
    brand: 'Hyundai',
    model: 'Creta SX(O) 1.5 Turbo',
    variant: 'SX(O) Knight Edition',
    year: 2023,
    price: 1650000,
    mileage: 19200,
    fuelType: 'Petrol',
    transmission: 'DCT Auto',
    location: 'Aundh, Pune',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600',
    inspectionScore: 9.7,
    isFavorite: true,
    category: 'Viewed',
  },
];

export const SavedCarsScreen: React.FC<SavedCarsScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [savedCars, setSavedCars] = useState<SavedCarItem[]>(INITIAL_SAVED_CARS);

  const toggleFavorite = (id: string) => {
    setSavedCars((prev) =>
      prev.map((car) => (car.id === id ? { ...car, isFavorite: !car.isFavorite } : car))
    );
  };

  const filteredCars = savedCars.filter((car) => {
    if (!car.isFavorite) return false;
    if (activeTab === 'all' || activeTab === 'cars') return true;
    if (activeTab === 'viewed') return car.category === 'Viewed';
    if (activeTab === 'shortlisted') return car.category === 'Shortlisted';
    return true;
  });

  const activeCount = savedCars.filter((c) => c.isFavorite).length;

  const TABS: TabPillItem[] = [
    { key: 'all', label: 'All', count: activeCount },
    { key: 'cars', label: 'Cars' },
    { key: 'viewed', label: 'Viewed' },
    { key: 'shortlisted', label: 'Shortlisted' },
  ];

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
          <Text style={styles.headerTitle}>Saved Cars</Text>
        </View>
        <Badge text={`${activeCount} Saved`} variant="error" size="sm" />
      </View>

      {/* Tab Pills */}
      <View style={styles.tabsContainer}>
        <TabPills
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredCars.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={44} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Saved Cars Yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the heart icon on any verified used car to save it for quick comparison and test drive booking.
            </Text>
            {navigation?.navigate && (
              <Button
                title="Browse Verified Cars"
                variant="primary"
                size="md"
                onPress={() => navigation.navigate('MarketplaceMain')}
                style={{ marginTop: SPACING.lg }}
              />
            )}
          </View>
        ) : (
          <View style={styles.carsList}>
            {filteredCars.map((car) => (
              <Card key={car.id} style={styles.carCard} elevation="md" border>
                {/* Image & Overlay Badges */}
                <View style={styles.imageContainer}>
                  {car.imageUrl ? (
                    <Image source={{ uri: car.imageUrl }} style={styles.carImage} />
                  ) : (
                    <View style={styles.carImagePlaceholder}>
                      <Ionicons name="car-sport" size={54} color={COLORS.gray400} />
                    </View>
                  )}

                  {/* Certified Badge Top Left */}
                  <View style={styles.certifiedBadge}>
                    <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
                    <Text style={styles.certifiedBadgeText}>TVS Assured</Text>
                  </View>

                  {/* Heart / Favorite Top Right */}
                  <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => toggleFavorite(car.id)}
                    activeOpacity={0.8}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={car.isFavorite ? 'heart' : 'heart-outline'}
                      size={20}
                      color={car.isFavorite ? COLORS.primary : COLORS.gray600}
                    />
                  </TouchableOpacity>
                </View>

                {/* Car Details Content */}
                <View style={styles.carContent}>
                  {/* Title & Year */}
                  <View style={styles.titleRow}>
                    <Text style={styles.carName} numberOfLines={1}>
                      {car.brand} {car.model}
                    </Text>
                    <Text style={styles.carYearBadge}>{car.year}</Text>
                  </View>

                  <Text style={styles.variantText} numberOfLines={1}>
                    {car.variant}
                  </Text>

                  {/* Specs Chips Row */}
                  <View style={styles.specsRow}>
                    <View style={styles.specChip}>
                      <Ionicons name="speedometer-outline" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.specText}>
                        {(car.mileage / 1000).toFixed(0)}k km
                      </Text>
                    </View>
                    <View style={styles.specChip}>
                      <Ionicons name="flame-outline" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.specText}>{car.fuelType}</Text>
                    </View>
                    <View style={styles.specChip}>
                      <Ionicons name="git-branch-outline" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.specText}>{car.transmission}</Text>
                    </View>
                    <View style={styles.specChip}>
                      <Ionicons name="location-outline" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.specText}>{car.location.split(',')[0]}</Text>
                    </View>
                  </View>

                  {/* Inspection Score */}
                  <View style={styles.scoreRow}>
                    <View style={styles.scoreBadge}>
                      <Ionicons name="star" size={13} color={COLORS.starGold} />
                      <Text style={styles.scoreText}>{car.inspectionScore}/10</Text>
                    </View>
                    <Text style={styles.inspectionSummary}>140-Point Inspection Passed</Text>
                  </View>

                  {/* Card Bottom: Price & Action */}
                  <View style={styles.cardBottomRow}>
                    <View>
                      <Text style={styles.priceLabel}>Price</Text>
                      <Text style={styles.carPrice}>
                        ₹{(car.price / 100000).toFixed(2)} Lakh
                      </Text>
                    </View>

                    <Button
                      title="Book Test Drive"
                      variant="primary"
                      size="sm"
                      iconRight="chevron-forward"
                      onPress={() => {
                        if (navigation?.navigate) {
                          navigation.navigate('UsedCarDetail', { carId: car.id });
                        }
                      }}
                    />
                  </View>
                </View>
              </Card>
            ))}
          </View>
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
  tabsContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  carsList: {
    gap: SPACING.lg,
  },
  carCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    overflow: 'hidden',
    padding: 0,
  },
  imageContainer: {
    position: 'relative',
    height: 170,
    backgroundColor: COLORS.gray100,
  },
  carImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  carImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray200,
  },
  certifiedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.full,
    gap: 4,
  },
  certifiedBadgeText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  carContent: {
    padding: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    flex: 1,
    paddingRight: SPACING.xs,
  },
  carYearBadge: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.sm,
  },
  variantText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginVertical: SPACING.sm,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADII.sm,
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  specText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADII.sm,
    marginRight: 6,
    gap: 2,
  },
  scoreText: {
    ...TYPOGRAPHY.labelSmall,
    color: '#92400E',
    fontWeight: '700',
  },
  inspectionSummary: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  priceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  carPrice: {
    ...TYPOGRAPHY.priceLarge,
    color: COLORS.textPrimary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['4xl'],
    paddingHorizontal: SPACING.xl,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
