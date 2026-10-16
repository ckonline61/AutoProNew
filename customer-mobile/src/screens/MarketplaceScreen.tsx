import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import {
  Badge,
  Card,
  TabPills,
  SearchBar,
  PriceText,
  RatingStars,
} from '../components/ui';
import { requestError, useCustomerData } from '../contexts/CustomerDataContext';
import { useAuth } from '../contexts/AuthContext';
import { SparePart, UsedCarListing } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MarketplaceStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');
const GRID_GAP = SPACING.md;
const PART_CARD_WIDTH = (width - SPACING.lg * 2 - GRID_GAP) / 2;

const PART_CATEGORIES = ['All', 'Engine', 'Brakes', 'Filters', 'Battery'];
const CAR_FILTERS = ['All', 'Hatchback', 'Sedan', 'SUV'];

type Props = NativeStackScreenProps<MarketplaceStackParamList, 'MarketplaceMain'>;

export const MarketplaceScreen: React.FC<Props> = ({ navigation }) => {
  const [activeMainTab, setActiveMainTab] = useState<'PARTS' | 'CARS'>('PARTS');
  const [partCategory, setPartCategory] = useState<string>('All');
  const [carFilter, setCarFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { spareParts, usedCars, addPart, loading, refresh, cart } = useCustomerData();
  const { isPreview } = useAuth();

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const handleBuyPart = async (part: SparePart) => {
    try {
      await addPart(part);
      Alert.alert(
        isPreview ? 'Preview cart' : 'Added to Cart',
        `${part.name} added to your cart.`
      );
    } catch (error) {
      Alert.alert('Unable to add part', requestError(error));
    }
  };

  const handleViewCar = (car: UsedCarListing) => {
    Alert.alert(
      `${car.brand} ${car.model} (${car.year})`,
      `Price: ₹${car.price.toLocaleString()}\nMileage: ${car.mileage.toLocaleString()} km\nFuel: ${car.fuelType}\nTransmission: ${car.transmission}\nInspection Score: ${car.inspectionScore ?? '9.2'}/10\nLocation: ${car.location}\n\n${car.description || 'Pre-owned inspected vehicle with complete service history.'}`,
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  // Filter spare parts
  const filteredParts = useMemo(() => {
    return spareParts.filter((part) => {
      const matchesSearch =
        part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        part.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        partCategory === 'All' ||
        part.category.toLowerCase().includes(partCategory.toLowerCase()) ||
        (partCategory === 'Battery' && part.category.toLowerCase().includes('electrical')) ||
        (partCategory === 'Brakes' && part.category.toLowerCase().includes('braking'));

      return matchesSearch && matchesCat;
    });
  }, [spareParts, searchQuery, partCategory]);

  // Filter used cars
  const filteredCars = useMemo(() => {
    return usedCars.filter((car) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        car.brand.toLowerCase().includes(q) ||
        car.model.toLowerCase().includes(q) ||
        (car.variant && car.variant.toLowerCase().includes(q)) ||
        car.location.toLowerCase().includes(q);

      const matchesBody =
        carFilter === 'All' ||
        car.model.toLowerCase().includes(carFilter.toLowerCase()) ||
        (car.description && car.description.toLowerCase().includes(carFilter.toLowerCase()));

      return matchesSearch && matchesBody;
    });
  }, [usedCars, searchQuery, carFilter]);

  const mainTabs = [
    { key: 'PARTS', label: 'Spare Parts', count: spareParts.length },
    { key: 'CARS', label: 'Used Cars', count: usedCars.length },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>
            {activeMainTab === 'PARTS' ? 'Spare Parts' : 'Certified Used Cars'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {activeMainTab === 'PARTS'
              ? '100% Genuine OEM & OES auto components'
              : 'Multi-point inspected certified vehicles'}
          </Text>
        </View>

        {/* Cart Icon with badge */}
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => navigation.navigate('Cart')}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Shopping cart, ${cartCount} items`}
        >
          <Ionicons name="cart-outline" size={24} color={COLORS.textPrimary} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Top Tabs: Spare Parts | Used Cars */}
      <View style={styles.mainTabSection}>
        <TabPills
          tabs={mainTabs}
          activeTab={activeMainTab}
          onTabChange={(key) => {
            setActiveMainTab(key as 'PARTS' | 'CARS');
            setSearchQuery('');
          }}
        />
      </View>

      {/* ── SPARE PARTS TAB CONTENT ── */}
      {activeMainTab === 'PARTS' ? (
        <View style={styles.tabContentContainer}>
          {/* SearchBar */}
          <View style={styles.searchSection}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by part name, brand, model..."
              onClear={() => setSearchQuery('')}
            />
          </View>

          {/* Category Filter Pills */}
          <View style={styles.subCategorySection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryPillsScroll}
            >
              {PART_CATEGORIES.map((cat) => {
                const isSelected = partCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryPill,
                      isSelected && styles.categoryPillActive,
                    ]}
                    onPress={() => setPartCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        isSelected && styles.categoryPillTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 2-Column Product Grid */}
          <FlatList
            data={filteredParts}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.gridRow}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => void refresh()}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="cog-outline" size={38} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyTitle}>No spare parts found</Text>
                <Text style={styles.emptySubtitle}>
                  Try searching with another keyword or select a different category.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                {/* Image Placeholder or Image */}
                <View style={styles.productImageWrapper}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderBox}>
                      <Ionicons name="cog" size={32} color={COLORS.gray400} />
                    </View>
                  )}
                  {item.stock < 5 && item.stock > 0 && (
                    <View style={styles.stockBadge}>
                      <Text style={styles.stockBadgeText}>Only {item.stock} left</Text>
                    </View>
                  )}
                </View>

                {/* Brand Name */}
                <Text style={styles.productBrand} numberOfLines={1}>
                  {item.brand.toUpperCase()}
                </Text>

                {/* Product Name */}
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>

                {/* Star rating + review count */}
                <View style={styles.ratingRow}>
                  <RatingStars rating={4.6} reviewCount={38} size="sm" />
                </View>

                {/* Price in red bold + strikethrough original price */}
                <View style={styles.priceRow}>
                  <PriceText
                    price={item.price}
                    originalPrice={item.originalPrice}
                    size="sm"
                    color={COLORS.primary}
                  />
                </View>

                {/* 'Add' Red Button */}
                <TouchableOpacity
                  style={[
                    styles.addBtn,
                    item.stock < 1 && styles.addBtnDisabled,
                  ]}
                  disabled={item.stock < 1}
                  onPress={() => handleBuyPart(item)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addBtnText}>
                    {item.stock < 1 ? 'Out of Stock' : '+ Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      ) : (
        /* ── USED CARS TAB CONTENT ── */
        <View style={styles.tabContentContainer}>
          {/* SearchBar */}
          <View style={styles.searchSection}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by brand, model, city..."
              onClear={() => setSearchQuery('')}
            />
          </View>

          {/* Filter pills: All, Hatchback, Sedan, SUV */}
          <View style={styles.subCategorySection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryPillsScroll}
            >
              {CAR_FILTERS.map((filter) => {
                const isSelected = carFilter === filter;
                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.categoryPill,
                      isSelected && styles.categoryPillActive,
                    ]}
                    onPress={() => setCarFilter(filter)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        isSelected && styles.categoryPillTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Car Listing Cards */}
          <FlatList
            data={filteredCars}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.carsListContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => void refresh()}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="car-outline" size={38} color={COLORS.primary} />
                </View>
                <Text style={styles.emptyTitle}>No cars match your search</Text>
                <Text style={styles.emptySubtitle}>
                  Try clearing filters or looking for another brand/body style.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Card
                style={styles.carCard}
                padding="md"
                elevation="md"
                onPress={() => handleViewCar(item)}
              >
                {/* Car Image Placeholder */}
                <View style={styles.carImageContainer}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.carImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.carPlaceholder}>
                      <Ionicons name="car-sport" size={48} color={COLORS.gray400} />
                    </View>
                  )}

                  {/* Inspected Green Badge */}
                  {item.verified && (
                    <View style={styles.carBadgeContainer}>
                      <Badge
                        text="Inspected"
                        variant="success"
                        size="sm"
                        icon="checkmark-circle"
                      />
                    </View>
                  )}
                </View>

                {/* Car Details */}
                <View style={styles.carBody}>
                  {/* Car Name (Brand Model Year) */}
                  <View style={styles.carTitleRow}>
                    <Text style={styles.carTitle} numberOfLines={1}>
                      {item.brand} {item.model}
                    </Text>
                    <Text style={styles.carYear}>{item.year}</Text>
                  </View>

                  {/* Specs Row: km driven, fuel type, transmission */}
                  <View style={styles.specsRow}>
                    <View style={styles.specItem}>
                      <Ionicons name="speedometer-outline" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.specText}>
                        {item.mileage.toLocaleString()} km
                      </Text>
                    </View>
                    <Text style={styles.specDot}>•</Text>
                    <View style={styles.specItem}>
                      <Ionicons name="flash-outline" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.specText}>{item.fuelType}</Text>
                    </View>
                    <Text style={styles.specDot}>•</Text>
                    <View style={styles.specItem}>
                      <Ionicons name="cog-outline" size={13} color={COLORS.textSecondary} />
                      <Text style={styles.specText}>{item.transmission}</Text>
                    </View>
                  </View>

                  {/* Rating + Location */}
                  <View style={styles.carRatingRow}>
                    <RatingStars
                      rating={item.inspectionScore ? item.inspectionScore / 2 : 4.5}
                      reviewCount={item.ownersCount ? `${item.ownersCount} Owner` as unknown as number : undefined}
                      size="sm"
                    />
                    <View style={styles.locationTag}>
                      <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.carDivider} />

                  {/* Price in Bold & CTA */}
                  <View style={styles.carFooterRow}>
                    <View>
                      <Text style={styles.priceCaption}>Verified Price</Text>
                      <Text style={styles.carPriceBold}>
                        ₹{(item.price / 100000).toFixed(2)} Lakh
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.carViewBtn}
                      onPress={() => handleViewCar(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.carViewBtnText}>View Details</Text>
                      <Ionicons name="arrow-forward" size={14} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            )}
          />
        </View>
      )}
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
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginLeft: SPACING.sm,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  mainTabSection: {
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tabContentContainer: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
    backgroundColor: COLORS.white,
  },
  subCategorySection: {
    backgroundColor: COLORS.white,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  categoryPillsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADII.full,
    backgroundColor: COLORS.gray100,
  },
  categoryPillActive: {
    backgroundColor: COLORS.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  categoryPillTextActive: {
    color: COLORS.white,
  },
  gridContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: GRID_GAP,
  },
  productCard: {
    width: PART_CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  productImageWrapper: {
    width: '100%',
    height: 110,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.gray100,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stockBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  stockBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
  },
  productBrand: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  productName: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
    minHeight: 38,
    marginBottom: 4,
  },
  ratingRow: {
    marginBottom: 6,
  },
  priceRow: {
    marginBottom: SPACING.sm,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.sm,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  addBtnDisabled: {
    backgroundColor: COLORS.gray300,
  },
  addBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  carsListContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  carCard: {
    marginBottom: SPACING.lg,
    borderRadius: RADII.md,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  carImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.gray100,
    overflow: 'hidden',
    position: 'relative',
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  carPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray100,
  },
  carBadgeContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  carBody: {
    paddingTop: SPACING.md,
  },
  carTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  carTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  carYear: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADII.xs,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  specDot: {
    color: COLORS.textMuted,
    marginHorizontal: 6,
    fontSize: 10,
  },
  carRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    maxWidth: 140,
  },
  locationText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  carDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.xs,
  },
  carFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.xs,
  },
  priceCaption: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  carPriceBold: {
    ...TYPOGRAPHY.price,
    color: COLORS.primary,
  },
  carViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADII.sm,
    gap: 4,
    ...SHADOWS.sm,
  },
  carViewBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['4xl'],
    paddingHorizontal: SPACING.xl,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
