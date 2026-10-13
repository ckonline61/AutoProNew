import React, { useState } from 'react';
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
} from 'react-native';
import { COLORS } from '../constants';
import { SAMPLE_SPARE_PARTS, SAMPLE_USED_CARS } from '../data/mockData';
import { SparePart, UsedCarListing } from '../types';

const { width } = Dimensions.get('window');
const PART_WIDTH = (width - 44) / 2;

export const MarketplaceScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'PARTS' | 'CARS'>('PARTS');
  const [spareParts] = useState<SparePart[]>(SAMPLE_SPARE_PARTS);
  const [usedCars] = useState<UsedCarListing[]>(SAMPLE_USED_CARS);

  const handleBuyPart = (part: SparePart) => {
    Alert.alert(
      'Added to Cart',
      `${part.name} added to your cart for ₹${part.price}. Instant delivery available.`,
      [{ text: 'OK' }]
    );
  };

  const handleViewCar = (car: UsedCarListing) => {
    Alert.alert(
      `${car.brand} ${car.model}`,
      `Year: ${car.year}\nPrice: ₹${car.price.toLocaleString()}\nMileage: ${car.mileage.toLocaleString()} km\nInspection Score: ${car.inspectionScore || 9}/10\nLocation: ${car.location}`,
      [
        { text: 'Book Test Drive', onPress: () => Alert.alert('Test Drive Booked', 'Our advisor will contact you to schedule!') },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Text style={styles.title}>Marketplace</Text>
        <Text style={styles.subtitle}>Genuine spare parts & certified pre-owned cars</Text>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'PARTS' && styles.tabButtonActive]}
            onPress={() => setActiveTab('PARTS')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'PARTS' && styles.tabTextActive]}>
              ⚙️ Spare Parts ({spareParts.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'CARS' && styles.tabButtonActive]}
            onPress={() => setActiveTab('CARS')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'CARS' && styles.tabTextActive]}>
              🚘 Certified Cars ({usedCars.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'PARTS' ? (
        <FlatList
          data={spareParts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.partsGrid}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <View style={styles.partCard}>
              <View style={styles.partIconWrapper}>
                <Text style={styles.partIconText}>⚙️</Text>
              </View>
              <Text style={styles.partBrand}>{item.brand.toUpperCase()}</Text>
              <Text style={styles.partName} numberOfLines={2}>
                {item.name}
              </Text>
              <View style={styles.partPriceRow}>
                <Text style={styles.partPrice}>₹{item.price}</Text>
                {item.originalPrice ? (
                  <Text style={styles.partOriginalPrice}>₹{item.originalPrice}</Text>
                ) : null}
              </View>
              <TouchableOpacity
                style={styles.addToCartBtn}
                onPress={() => handleBuyPart(item)}
                activeOpacity={0.8}
              >
                <Text style={styles.addToCartText}>+ Add to Cart</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={usedCars}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.carsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.carCard}
              onPress={() => handleViewCar(item)}
              activeOpacity={0.85}
            >
              <View style={styles.carHeaderRow}>
                <View style={styles.carIconBox}>
                  <Text style={styles.carEmoji}>🏎️</Text>
                </View>
                <View style={styles.carTitleBox}>
                  <Text style={styles.carTitle}>
                    {item.brand} {item.model}
                  </Text>
                  <Text style={styles.carSubtitle}>
                    {item.year} • {item.mileage.toLocaleString()} km • {item.fuelType}
                  </Text>
                </View>
                {item.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓ Certified</Text>
                  </View>
                )}
              </View>

              <Text style={styles.carDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.carFooter}>
                <View>
                  <Text style={styles.priceLabel}>Price</Text>
                  <Text style={styles.carPrice}>₹{(item.price / 100000).toFixed(2)} Lakh</Text>
                </View>
                <View style={styles.inspectionBadge}>
                  <Text style={styles.inspectionScore}>⭐ {item.inspectionScore || '9.2'}/10</Text>
                  <Text style={styles.inspectionLabel}>Inspection</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    borderRadius: 10,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.cardBackground,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  partsGrid: {
    padding: 16,
    paddingBottom: 24,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  partCard: {
    width: PART_WIDTH,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  partIconWrapper: {
    height: 70,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  partIconText: {
    fontSize: 32,
  },
  partBrand: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  partName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    minHeight: 34,
    marginBottom: 6,
  },
  partPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 10,
  },
  partPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  partOriginalPrice: {
    fontSize: 11,
    color: COLORS.gray400,
    textDecorationLine: 'line-through',
  },
  addToCartBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  addToCartText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  carsList: {
    padding: 16,
    paddingBottom: 24,
  },
  carCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  carHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  carIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  carEmoji: {
    fontSize: 22,
  },
  carTitleBox: {
    flex: 1,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  carSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
  },
  carDescription: {
    fontSize: 13,
    color: COLORS.gray600,
    lineHeight: 18,
    marginBottom: 12,
  },
  carFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    paddingTop: 10,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  carPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
  },
  inspectionBadge: {
    alignItems: 'flex-end',
  },
  inspectionScore: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  inspectionLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
});
