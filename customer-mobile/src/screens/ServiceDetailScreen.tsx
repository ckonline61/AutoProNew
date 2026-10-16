import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { useCustomerData } from '../contexts/CustomerDataContext';
import { Badge, PriceText } from '../components/ui';

type Props = NativeStackScreenProps<HomeStackParamList, 'ServiceDetail'>;

const { width } = Dimensions.get('window');

export const ServiceDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const serviceParams = route.params;
  const { services, spareParts } = useCustomerData();

  const service =
    'service' in serviceParams
      ? serviceParams.service
      : services.find((s) => s.id === serviceParams.serviceId);

  if (!service) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
        <Text style={styles.errorTitle}>Service Not Found</Text>
        <Text style={styles.errorSubtitle}>
          The requested service is no longer available in the catalogue.
        </Text>
        <TouchableOpacity style={styles.backHomeBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backHomeBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Calculate original price for 30% discount display
  const originalPrice = Math.round(service.price * 1.43);

  // Filter or take related products from spareParts
  const relatedParts = spareParts.slice(0, 4);

  const handleBookNow = () => {
    navigation.navigate('BookingForm', {
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Navigation Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.circleBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {service.name}
        </Text>
        <TouchableOpacity
          style={styles.circleBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => navigation.navigate('HomeMain')}
        >
          <Ionicons name="home-outline" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Image Area (Placeholder gray bg with service icon, 200px height) */}
        <View style={styles.imagePlaceholder}>
          <LinearGradient
            colors={['#2D3748', '#1A202C']}
            style={styles.imageGradient}
          >
            <View style={styles.imageIconBadge}>
              <MaterialCommunityIcons name="car-wrench" size={64} color={COLORS.white} />
            </View>
            <View style={styles.verifiedTag}>
              <Ionicons name="shield-checkmark" size={14} color={COLORS.white} />
              <Text style={styles.verifiedTagText}>Auto Pro Certified</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Header & Price Section */}
        <View style={styles.card}>
          <View style={styles.categoryRow}>
            <Badge
              text={service.categoryName || 'PREMIUM SERVICE'}
              variant="info"
              size="sm"
            />
            <View style={styles.doorstepBadge}>
              <Ionicons name="checkmark-done" size={12} color={COLORS.success} />
              <Text style={styles.doorstepBadgeText}>Doorstep Available</Text>
            </View>
          </View>

          <Text style={styles.serviceTitle}>{service.name}</Text>

          {/* Price with large amount + discount badge */}
          <View style={styles.priceRow}>
            <PriceText
              price={service.price}
              originalPrice={originalPrice}
              size="lg"
              color={COLORS.primary}
              showDiscountBadge={true}
            />
          </View>

          {/* Duration & Rating Pills */}
          <View style={styles.pillsRow}>
            <View style={styles.infoPill}>
              <Ionicons name="time-outline" size={15} color={COLORS.textSecondary} />
              <Text style={styles.pillText}>Est. {service.estimatedDuration}</Text>
            </View>
            <View style={styles.infoPill}>
              <Ionicons name="star" size={15} color={COLORS.starGold} />
              <Text style={styles.pillText}>4.9 (420+ reviews)</Text>
            </View>
            <View style={styles.infoPill}>
              <Ionicons name="ribbon-outline" size={15} color={COLORS.success} />
              <Text style={styles.pillText}>OEM Spares</Text>
            </View>
          </View>
        </View>

        {/* Service Overview */}
        <View style={styles.card}>
          <Text style={styles.sectionHeading}>Service Overview</Text>
          <Text style={styles.descriptionText}>{service.description}</Text>
        </View>

        {/* What's Included Section */}
        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionHeading}>What's Included</Text>
            <Text style={styles.itemsCount}>
              {service.includedFeatures.length} Key Tasks
            </Text>
          </View>

          <View style={styles.checklist}>
            {service.includedFeatures.map((item, index) => (
              <View key={index} style={styles.checkItem}>
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={14} color={COLORS.success} />
                </View>
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Auto Pro Guarantee Banner */}
        <View style={styles.guaranteeCard}>
          <View style={styles.guaranteeIconCircle}>
            <Ionicons name="shield-checkmark" size={24} color="#B45309" />
          </View>
          <View style={styles.guaranteeContent}>
            <Text style={styles.guaranteeTitle}>1000 KMs / 1-Month Warranty</Text>
            <Text style={styles.guaranteeDesc}>
              Every service is backed by our unconditional guarantee. If anything feels off, our master tech visits and resolves free of cost.
            </Text>
          </View>
        </View>

        {/* Related Products Section */}
        {relatedParts.length > 0 && (
          <View style={styles.card}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionHeading}>Recommended Add-on Parts</Text>
              <Text style={styles.genuineBadge}>100% Genuine</Text>
            </View>
            <Text style={styles.productsSubtitle}>
              Authentic OEM spare parts compatible with periodic maintenance
            </Text>

            <View style={styles.productsGrid}>
              {relatedParts.map((part) => (
                <View key={part.id} style={styles.productCard}>
                  <View style={styles.partImgPlaceholder}>
                    <Ionicons name="cog-outline" size={28} color={COLORS.gray500} />
                  </View>
                  <Text style={styles.partBrand} numberOfLines={1}>
                    {part.brand}
                  </Text>
                  <Text style={styles.partName} numberOfLines={2}>
                    {part.name}
                  </Text>
                  <Text style={styles.partPrice}>₹{part.price}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.stickyBottomBar}>
        <View style={styles.bottomPriceCol}>
          <Text style={styles.bottomPriceLabel}>Total Amount</Text>
          <Text style={styles.bottomPriceValue}>₹{service.price}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookNowBtn}
          onPress={handleBookNow}
          activeOpacity={0.85}
        >
          <Text style={styles.bookNowText}>Book Now</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    height: 54,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    fontWeight: '700',
    flex: 1,
    marginHorizontal: SPACING.md,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  imagePlaceholder: {
    width: width,
    height: 200,
    backgroundColor: COLORS.gray800,
    overflow: 'hidden',
  },
  imageGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageIconBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  verifiedTag: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.full,
    gap: 4,
  },
  verifiedTagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.white,
    fontWeight: '700',
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  doorstepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.sm,
    gap: 4,
  },
  doorstepBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '700',
  },
  serviceTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    fontWeight: '800',
    marginBottom: SPACING.sm,
  },
  priceRow: {
    marginVertical: SPACING.xs,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: SPACING.md,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADII.full,
    gap: 6,
  },
  pillText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  sectionHeading: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  itemsCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
  },
  descriptionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: SPACING.xs,
  },
  checklist: {
    marginTop: SPACING.sm,
    gap: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  guaranteeCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADII.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 12,
    alignItems: 'flex-start',
  },
  guaranteeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guaranteeContent: {
    flex: 1,
  },
  guaranteeTitle: {
    ...TYPOGRAPHY.label,
    color: '#92400E',
    fontWeight: '700',
    marginBottom: 2,
  },
  guaranteeDesc: {
    ...TYPOGRAPHY.caption,
    color: '#78350F',
    lineHeight: 16,
  },
  genuineBadge: {
    ...TYPOGRAPHY.caption,
    color: COLORS.info,
    fontWeight: '700',
  },
  productsSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.gray50,
    borderRadius: RADII.sm,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  partImgPlaceholder: {
    height: 70,
    backgroundColor: COLORS.gray200,
    borderRadius: RADII.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  partBrand: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  partName: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
    minHeight: 34,
  },
  partPrice: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginTop: 4,
  },
  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.lg,
  },
  bottomPriceCol: {
    flex: 1,
  },
  bottomPriceLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  bottomPriceValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.primary,
    fontWeight: '800',
  },
  bookNowBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...SHADOWS.md,
  },
  bookNowText: {
    ...TYPOGRAPHY.buttonMedium,
    color: COLORS.white,
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginTop: SPACING.md,
  },
  errorSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  backHomeBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADII.md,
  },
  backHomeBtnText: {
    ...TYPOGRAPHY.buttonMedium,
    color: COLORS.white,
  },
});
