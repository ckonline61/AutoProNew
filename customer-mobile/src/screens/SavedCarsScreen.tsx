import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { Card, Badge, TabPills, Button, TabPillItem } from '../components/ui';
import api from '../config/api';

const SAVED_CARS_KEY = 'autopro_saved_car_ids';

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

/** Save a car ID to the persistent wishlist */
export async function saveCarToWishlist(carId: string): Promise<void> {
  const stored = await AsyncStorage.getItem(SAVED_CARS_KEY);
  const ids: string[] = stored ? (JSON.parse(stored) as string[]) : [];
  if (!ids.includes(carId)) {
    ids.push(carId);
    await AsyncStorage.setItem(SAVED_CARS_KEY, JSON.stringify(ids));
  }
}

/** Remove a car ID from the persistent wishlist */
export async function removeCarFromWishlist(carId: string): Promise<void> {
  const stored = await AsyncStorage.getItem(SAVED_CARS_KEY);
  const ids: string[] = stored ? (JSON.parse(stored) as string[]) : [];
  await AsyncStorage.setItem(SAVED_CARS_KEY, JSON.stringify(ids.filter((id) => id !== carId)));
}

function mapCar(raw: Record<string, unknown>): SavedCarItem {
  const loc = raw.location as Record<string, unknown> | undefined;
  const locationStr = loc ? `${loc.city ?? ''}, ${loc.state ?? ''}`.trim().replace(/^,|,$/, '') : 'India';
  const images = raw.images as string[] | undefined;
  return {
    id: String(raw._id ?? raw.id ?? ''),
    brand: String(raw.brand ?? ''),
    model: String(raw.model ?? ''),
    variant: String(raw.variant ?? raw.model ?? ''),
    year: Number(raw.year ?? 0),
    price: Number(raw.price ?? 0),
    mileage: Number(raw.mileage ?? 0),
    fuelType: String(raw.fuelType ?? 'Petrol'),
    transmission: String(raw.transmission ?? 'Manual'),
    location: locationStr,
    imageUrl: images?.[0],
    inspectionScore: Number(raw.inspectionScore ?? 9.0),
    isFavorite: true,
    category: 'Shortlisted',
  };
}

export const SavedCarsScreen: React.FC<SavedCarsScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [savedCars, setSavedCars] = useState<SavedCarItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedCars = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(SAVED_CARS_KEY);
      const ids: string[] = stored ? (JSON.parse(stored) as string[]) : [];

      if (ids.length === 0) {
        setSavedCars([]);
        return;
      }

      // Fetch each saved car from the API
      const results = await Promise.allSettled(
        ids.map((id) => api.get(`/used-cars/${id}`))
      );

      const cars: SavedCarItem[] = [];
      const validIds: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const raw = result.value.data?.data ?? result.value.data;
          if (raw) {
            cars.push(mapCar(raw as Record<string, unknown>));
            validIds.push(ids[index]);
          }
        }
        // If rejected (car deleted), skip — don't add to validIds
      });

      // Prune stale IDs
      if (validIds.length !== ids.length) {
        await AsyncStorage.setItem(SAVED_CARS_KEY, JSON.stringify(validIds));
      }

      setSavedCars(cars);
    } catch {
      setSavedCars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSavedCars();
  }, [loadSavedCars]);

  const toggleFavorite = async (id: string) => {
    await removeCarFromWishlist(id);
    setSavedCars((prev) => prev.filter((car) => car.id !== id));
  };

  const filteredCars = savedCars.filter((car) => {
    if (activeTab === 'all' || activeTab === 'cars') return true;
    if (activeTab === 'viewed') return car.category === 'Viewed';
    if (activeTab === 'shortlisted') return car.category === 'Shortlisted';
    return true;
  });

  const activeCount = savedCars.length;

  const TABS: TabPillItem[] = [
    { key: 'all', label: 'All', count: activeCount },
    { key: 'cars', label: 'Cars' },
    { key: 'viewed', label: 'Viewed' },
    { key: 'shortlisted', label: 'Shortlisted' },
  ];

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Saved Cars</Text>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, marginTop: SPACING.sm }}>
            Loading saved cars...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
