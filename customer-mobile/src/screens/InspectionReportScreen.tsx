import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { Card, Badge, Button } from '../components/ui';
import { useCustomerData } from '../contexts/CustomerDataContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MarketplaceStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<MarketplaceStackParamList, 'InspectionReport'>;

interface CategoryScore {
  name: string;
  score: number;
  icon: keyof typeof Ionicons.glyphMap;
  verdict: string;
}

const CATEGORY_SCORES: CategoryScore[] = [
  {
    name: 'Engine & Transmission',
    score: 8.5,
    icon: 'speedometer',
    verdict: 'Excellent',
  },
  {
    name: 'Exterior & Interior',
    score: 8.0,
    icon: 'car-sport',
    verdict: 'Very Good',
  },
  {
    name: 'Tyres & Brakes',
    score: 9.0,
    icon: 'disc',
    verdict: 'Immaculate',
  },
  {
    name: 'Electrical & Electronics',
    score: 8.5,
    icon: 'flash',
    verdict: 'No Faults',
  },
  {
    name: 'Accident & Paint Check',
    score: 9.0,
    icon: 'shield-checkmark',
    verdict: 'Original Paint',
  },
];

const PHOTO_ITEMS = [
  { label: 'Engine Bay', icon: 'hardware-chip-outline' as const },
  { label: 'Front Chassis', icon: 'shield-outline' as const },
  { label: 'Dashboard & ODO', icon: 'speedometer-outline' as const },
  { label: 'Right Tyres', icon: 'disc-outline' as const },
  { label: 'Underbody Frame', icon: 'construct-outline' as const },
  { label: 'Boot & Spare Wheel', icon: 'cube-outline' as const },
];

export const InspectionReportScreen: React.FC<Props> = ({ route, navigation }) => {
  const { carId } = route.params || { carId: 'car_1' };
  const { usedCars } = useCustomerData();

  const car = usedCars.find((c) => c.id === carId) || {
    id: carId || 'car_1',
    brand: 'Honda',
    model: 'City ZX CVT Petrol',
    year: 2021,
    price: 1140000,
    mileage: 32000,
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    location: 'Baner, Pune',
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return COLORS.success;
    if (score >= 7.0) return COLORS.warning;
    return COLORS.error;
  };

  const handleShareReport = async () => {
    try {
      await Share.share({
        message: `Auto Pro Certified Vehicle Inspection Report for ${car.brand} ${car.model} (${car.year}). Overall Score: 8.5/10 - Good Condition. Verified Report #APR-2026-8842.`,
        title: 'Auto Pro Inspection Report',
      });
    } catch {
      // ignore
    }
  };

  const handleDownloadPdf = () => {
    Alert.alert(
      'Download PDF Report',
      'The comprehensive 50-point inspection PDF report (with 18 high-resolution photos) will be sent to your registered email address.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header: back arrow + Inspection Report + Completed green badge */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspection Report</Text>
        <Badge text="Completed" variant="success" size="sm" showDot />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle Header Card */}
        <Card style={styles.vehicleHeaderCard} elevation="sm">
          <View style={styles.metaBadgeRow}>
            <Text style={styles.reportNumber}>REPORT #APR-2026-8842</Text>
            <Text style={styles.reportDate}>16 Oct 2026</Text>
          </View>

          <Text style={styles.vehicleTitle}>
            {car.brand} {car.model} ({car.year})
          </Text>

          <Text style={styles.vehicleSpecs}>
            {typeof car.mileage === 'number' ? `${car.mileage.toLocaleString()} km` : car.mileage} • {car.fuelType} • {car.transmission} • Pune
          </Text>

          <View style={styles.inspectorRow}>
            <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
            <Text style={styles.inspectorText}>
              Inspected by <Text style={styles.inspectorName}>Rajesh Sharma</Text> (Auto Pro Certified Lead Engineer)
            </Text>
          </View>
        </Card>

        {/* Overall Score Section */}
        <Card style={styles.scoreCard} elevation="sm">
          <Text style={styles.scoreSectionTitle}>Overall Inspection Score</Text>

          {/* Large circular score display */}
          <View style={styles.scoreCircle}>
            <View style={styles.scoreInnerCircle}>
              <View style={styles.scoreNumberRow}>
                <Text style={styles.scoreMainText}>8.5</Text>
                <Text style={styles.scoreTotalText}>/10</Text>
              </View>
              <Text style={styles.scoreStars}>★★★★★</Text>
            </View>
          </View>

          {/* Good Condition green badge */}
          <View style={styles.badgeWrap}>
            <Badge
              text="Good Condition"
              variant="success"
              size="md"
              icon="checkmark-circle"
            />
          </View>

          <Text style={styles.scoreSummaryText}>
            This vehicle passed 48 out of 50 physical & diagnostic inspection checkpoints. No major structural accident or flood damage detected.
          </Text>
        </Card>

        {/* Category Scores Grid (2 columns) */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          <Text style={styles.sectionSubtitle}>5 Critical Domains</Text>
        </View>

        <View style={styles.categoriesGrid}>
          {CATEGORY_SCORES.map((cat) => {
            const color = getScoreColor(cat.score);
            const percentage = (cat.score / 10) * 100;

            return (
              <Card key={cat.name} style={styles.categoryCard} elevation="sm">
                <View style={styles.catHeader}>
                  <View style={[styles.catIconWrap, { backgroundColor: color + '15' }]}>
                    <Ionicons name={cat.icon} size={18} color={color} />
                  </View>
                  <Text style={[styles.catScoreText, { color }]}>
                    {cat.score.toFixed(1)}
                    <Text style={styles.catScoreMax}>/10</Text>
                  </Text>
                </View>

                <Text style={styles.catName} numberOfLines={2}>
                  {cat.name}
                </Text>

                {/* Progress Bar */}
                <View style={styles.progressBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${percentage}%`, backgroundColor: color },
                    ]}
                  />
                </View>

                <View style={styles.verdictRow}>
                  <Text style={styles.verdictLabel}>Status:</Text>
                  <Text style={[styles.verdictValue, { color }]}>{cat.verdict}</Text>
                </View>
              </Card>
            );
          })}
        </View>

        {/* Inspection Photos Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Inspection Photos</Text>
          <Badge text="18 Photos" variant="info" size="sm" showDot={false} />
        </View>
        <Text style={styles.photosCaption}>
          Actual condition captures taken on-site by the inspection technician.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photosScrollContent}
        >
          {PHOTO_ITEMS.map((item, index) => {
            const isLast = index === PHOTO_ITEMS.length - 1;
            return (
              <TouchableOpacity
                key={item.label}
                style={styles.photoBox}
                activeOpacity={0.8}
                onPress={() =>
                  Alert.alert(
                    item.label,
                    'Viewing high-resolution inspection snapshot: ' + item.label
                  )
                }
              >
                <View style={styles.photoInner}>
                  <Ionicons name="camera-outline" size={26} color={COLORS.gray500} />
                  <Ionicons
                    name={item.icon}
                    size={16}
                    color={COLORS.primary}
                    style={styles.photoSubIcon}
                  />
                </View>
                <Text style={styles.photoLabel} numberOfLines={1}>
                  {item.label}
                </Text>

                {isLast && (
                  <View style={styles.morePhotosOverlay}>
                    <Text style={styles.morePhotosText}>+12</Text>
                    <Text style={styles.morePhotosSub}>More</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Inspector's Summary Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Inspector's Summary</Text>
        </View>

        <Card style={styles.summaryCard} elevation="sm">
          <View style={styles.inspectorProfileRow}>
            <View style={styles.inspectorAvatar}>
              <Text style={styles.inspectorAvatarText}>RS</Text>
            </View>
            <View style={styles.inspectorProfileInfo}>
              <Text style={styles.inspectorProfileName}>Rajesh Sharma</Text>
              <Text style={styles.inspectorProfileRole}>Senior Automotive Diagnostic Specialist</Text>
              <Text style={styles.inspectorExperience}>8+ Yrs Exp • 1,200+ Inspections Certified</Text>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <Text style={styles.summaryParagraph}>
            The vehicle is in healthy mechanical and electronic shape. Cold engine startup was smooth with zero vibration and clean exhaust. The automatic CVT transmission responds cleanly through all stepped ratios without lag or jerking.
          </Text>
          <Text style={styles.summaryParagraph}>
            Braking system pads and rotors measure at ~75% life remaining. The paint depth gauge reads within OEM tolerance (95–120 microns) across all primary pillars and door skins. Minor cosmetic scuffs on lower plastic apron, standard for Pune city traffic. Clean chassis apron with no welding signs.
          </Text>

          <View style={styles.summaryVerdictBox}>
            <Ionicons name="checkmark-done-circle" size={20} color={COLORS.success} />
            <Text style={styles.summaryVerdictText}>
              <Text style={{ fontWeight: '700' }}>Recommendation:</Text> Certified safe to purchase. Valued at fair market range.
            </Text>
          </View>
        </Card>

        {/* Download & Share Actions */}
        <View style={styles.actionsContainer}>
          <Button
            title="Download Full PDF Report"
            icon="download-outline"
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleDownloadPdf}
            style={styles.downloadButton}
          />

          <Button
            title="Share Inspection Report"
            icon="share-social-outline"
            variant="outline"
            size="md"
            fullWidth
            onPress={handleShareReport}
            style={styles.shareButton}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  vehicleHeaderCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  reportNumber: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  reportDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  vehicleTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginTop: 2,
    marginBottom: 4,
  },
  vehicleSpecs: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  inspectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: RADII.xs,
    gap: 6,
  },
  inspectorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
  inspectorName: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  scoreCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  scoreSectionTitle: {
    ...TYPOGRAPHY.label,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  scoreCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 6,
    borderColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    ...SHADOWS.sm,
  },
  scoreInnerCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreMainText: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.success,
    letterSpacing: -1,
  },
  scoreTotalText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  scoreStars: {
    color: '#FBBF24',
    fontSize: 13,
    letterSpacing: 2,
    marginTop: 2,
  },
  badgeWrap: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  scoreSummaryText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: SPACING.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    marginTop: SPACING.xs,
  },
  categoryCard: {
    width: '47.5%',
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.md,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  catIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catScoreText: {
    fontSize: 15,
    fontWeight: '700',
  },
  catScoreMax: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  catName: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
    fontSize: 13,
    minHeight: 36,
  },
  progressBackground: {
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
    marginVertical: SPACING.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  verdictRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  verdictLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  verdictValue: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
  },
  photosCaption: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  photosScrollContent: {
    gap: SPACING.md,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  photoBox: {
    width: 105,
    height: 105,
    borderRadius: RADII.md,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xs,
    overflow: 'hidden',
    position: 'relative',
  },
  photoInner: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  photoSubIcon: {
    position: 'absolute',
    bottom: -4,
    right: -6,
  },
  photoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
    textAlign: 'center',
  },
  morePhotosOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  morePhotosText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  morePhotosSub: {
    color: COLORS.gray300,
    fontSize: 10,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  inspectorProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inspectorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  inspectorAvatarText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
  },
  inspectorProfileInfo: {
    flex: 1,
  },
  inspectorProfileName: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  inspectorProfileRole: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  inspectorExperience: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  summaryParagraph: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  summaryVerdictBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: SPACING.md,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  summaryVerdictText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
  actionsContainer: {
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  downloadButton: {
    marginBottom: SPACING.xs,
  },
  shareButton: {
    backgroundColor: COLORS.white,
  },
});

export default InspectionReportScreen;
