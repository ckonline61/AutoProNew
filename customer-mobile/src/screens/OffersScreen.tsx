import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { Card, Button, TabPills, TabPillItem, Badge } from '../components/ui';

interface Coupon {
  id: string;
  code: string;
  category: 'ALL' | 'SERVICE' | 'PARTS' | 'CARS';
  discountBadge: string;
  title: string;
  description: string;
  minOrder: string;
  validity: string;
}

const MOCK_COUPONS: Coupon[] = [
  {
    id: 'c1',
    code: 'AUTOPRO20',
    category: 'SERVICE',
    discountBadge: '20% OFF',
    title: 'Get 20% OFF on Periodic Service',
    description: 'Instant discount on comprehensive periodic service package with synthetic oil replacement.',
    minOrder: 'Min. order ₹2,499',
    validity: 'Valid till 31 Oct 2026',
  },
  {
    id: 'c2',
    code: 'FREETEST',
    category: 'SERVICE',
    discountBadge: 'FREE SCAN',
    title: 'Free 40-Point Electronic Diagnostic Scan',
    description: 'Get a full computerized health diagnostic scan complimentary with any service.',
    minOrder: 'Min. order ₹1,499',
    validity: 'Valid till 15 Nov 2026',
  },
  {
    id: 'c3',
    code: 'PARTS15',
    category: 'PARTS',
    discountBadge: '15% OFF',
    title: 'Flat 15% OFF on Genuine Brake Pads & Filters',
    description: 'Save 15% on 100% genuine OEM & OES spare parts from Bosch, Brembo & Mobil 1.',
    minOrder: 'Min. order ₹999',
    validity: 'Valid till 05 Nov 2026',
  },
  {
    id: 'c4',
    code: 'BATTERY500',
    category: 'PARTS',
    discountBadge: '₹500 OFF',
    title: 'Flat ₹500 OFF on Exide & Amaron Batteries',
    description: 'Save ₹500 instantly on doorstep battery installation with manufacturer warranty.',
    minOrder: 'Min. order ₹3,000',
    validity: 'Valid till 30 Nov 2026',
  },
  {
    id: 'c5',
    code: 'ASSUREDCAR',
    category: 'CARS',
    discountBadge: '1 YR WARRANTY',
    title: 'Free 1-Year Comprehensive Warranty',
    description: 'Get free 12-month roadside assistance & mechanical warranty on all certified used cars.',
    minOrder: 'Valid on certified cars',
    validity: 'Valid till 31 Dec 2026',
  },
];

type CategoryFilter = 'ALL' | 'SERVICE' | 'PARTS' | 'CARS';

export const OffersScreen: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const tabs: TabPillItem[] = [
    { key: 'ALL', label: 'All', count: MOCK_COUPONS.length },
    {
      key: 'SERVICE',
      label: 'Service',
      count: MOCK_COUPONS.filter((c) => c.category === 'SERVICE').length,
    },
    {
      key: 'PARTS',
      label: 'Spare Parts',
      count: MOCK_COUPONS.filter((c) => c.category === 'PARTS').length,
    },
    {
      key: 'CARS',
      label: 'Used Cars',
      count: MOCK_COUPONS.filter((c) => c.category === 'CARS').length,
    },
  ];

  const filteredCoupons = useMemo(() => {
    if (activeCategory === 'ALL') return MOCK_COUPONS;
    return MOCK_COUPONS.filter((c) => c.category === activeCategory);
  }, [activeCategory]);

  const handleApplyCoupon = (coupon: Coupon) => {
    setAppliedCode(coupon.code);
    Alert.alert(
      'Coupon Applied! 🎉',
      `Code "${coupon.code}" has been applied to your session.\n${coupon.title}\n\nYou will receive your discount at checkout.`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Offers & Coupons</Text>
        <Text style={styles.headerSubtitle}>
          Save more with exclusive deals and promo vouchers
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner: Red Gradient */}
        <LinearGradient
          colors={[COLORS.primaryGradientStart, COLORS.primaryGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Ionicons name="flame" size={14} color={COLORS.primary} />
              <Text style={styles.heroBadgeText}>LIMITED TIME OFFER</Text>
            </View>

            <Text style={styles.heroTitle}>GET 20% OFF ON CAR SERVICE</Text>
            <Text style={styles.heroSubtitle}>
              Periodic maintenance, AC repair & deep detailing
            </Text>

            {/* Code Box */}
            <TouchableOpacity
              style={styles.codePill}
              activeOpacity={0.8}
              onPress={() =>
                handleApplyCoupon(MOCK_COUPONS.find((c) => c.code === 'AUTOPRO20')!)
              }
            >
              <Text style={styles.codePillText}>Use Code: AUTOPRO20</Text>
              <Ionicons name="copy-outline" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Decorative Background Icon */}
          <View style={styles.heroDeco}>
            <Ionicons name="gift-outline" size={90} color="rgba(255, 255, 255, 0.15)" />
          </View>
        </LinearGradient>

        {/* Category Tabs using TabPills */}
        <View style={styles.tabSection}>
          <TabPills
            tabs={tabs}
            activeTab={activeCategory}
            onTabChange={(key) => setActiveCategory(key as CategoryFilter)}
          />
        </View>

        {/* Coupon Cards List */}
        <View style={styles.couponsList}>
          {filteredCoupons.map((coupon) => {
            const isApplied = appliedCode === coupon.code;

            return (
              <Card key={coupon.id} style={styles.couponCard} padding="lg" elevation="md">
                <View style={styles.couponTopRow}>
                  {/* Left: Code Box & Discount Badge */}
                  <View style={styles.codeAndBadgeRow}>
                    <View style={styles.codeBadge}>
                      <Text style={styles.codeText}>{coupon.code}</Text>
                    </View>
                    <Badge
                      text={coupon.discountBadge}
                      variant="success"
                      size="sm"
                    />
                  </View>

                  {/* Right: Apply Red Outline Button */}
                  <TouchableOpacity
                    style={[
                      styles.applyBtn,
                      isApplied && styles.applyBtnActive,
                    ]}
                    onPress={() => handleApplyCoupon(coupon)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.applyBtnText,
                        isApplied && styles.applyBtnTextActive,
                      ]}
                    >
                      {isApplied ? 'Applied ✓' : 'Apply'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Coupon Title */}
                <Text style={styles.couponTitle}>{coupon.title}</Text>

                {/* Description */}
                <Text style={styles.couponDescription}>{coupon.description}</Text>

                <View style={styles.couponDivider} />

                {/* Min Order & Validity in Caption */}
                <View style={styles.couponFooterRow}>
                  <View style={styles.footerInfoItem}>
                    <Ionicons name="cart-outline" size={13} color={COLORS.textSecondary} />
                    <Text style={styles.couponCaptionText}>{coupon.minOrder}</Text>
                  </View>
                  <View style={styles.footerInfoItem}>
                    <Ionicons name="time-outline" size={13} color={COLORS.textSecondary} />
                    <Text style={styles.couponCaptionText}>{coupon.validity}</Text>
                  </View>
                </View>
              </Card>
            );
          })}
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
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
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
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },
  heroBanner: {
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  heroContent: {
    zIndex: 2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADII.full,
    gap: 4,
    marginBottom: SPACING.sm,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  heroSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADII.full,
    gap: 8,
  },
  codePillText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroDeco: {
    position: 'absolute',
    right: -10,
    bottom: -15,
    zIndex: 1,
  },
  tabSection: {
    marginBottom: SPACING.md,
  },
  couponsList: {
    gap: SPACING.md,
  },
  couponCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
  },
  couponTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  codeAndBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  codeBadge: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.sm,
  },
  codeText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  applyBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADII.sm,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: COLORS.white,
  },
  applyBtnActive: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
  },
  applyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  applyBtnTextActive: {
    color: COLORS.success,
  },
  couponTitle: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  couponDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  couponDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm + 2,
  },
  couponFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  couponCaptionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
});
