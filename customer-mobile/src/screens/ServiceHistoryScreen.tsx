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
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { Card, Button, PriceText, Badge, Divider } from '../components/ui';
import { useCustomerData } from '../contexts/CustomerDataContext';
import { Booking } from '../types';
import { useNavigation } from '@react-navigation/native';



export const ServiceHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { bookings, vehicles } = useCustomerData();

  // Combine real completed bookings with fallback mock completed records
  const completedFromContext = useMemo(
    () => bookings.filter((b) => b.status === 'COMPLETED'),
    [bookings]
  );

  const allCompletedHistory = completedFromContext;

  // Vehicle selector state
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Filter based on selected vehicle
  const displayedHistory = useMemo(() => {
    if (selectedVehicleId === 'ALL') return allCompletedHistory;
    return allCompletedHistory.filter((item) => item.vehicleId === selectedVehicleId);
  }, [allCompletedHistory, selectedVehicleId]);

  const activeBookingForInvoice = selectedBooking || displayedHistory[0] || null;

  const handleViewInvoice = () => {
    if (!activeBookingForInvoice) {
      Alert.alert('No Service Selected', 'Please select a service item to view its invoice.');
      return;
    }
    Alert.alert(
      `Invoice #${activeBookingForInvoice.id}`,
      `Service: ${activeBookingForInvoice.serviceName}\nDate: ${activeBookingForInvoice.scheduledDate}\nAmount Paid: ₹${activeBookingForInvoice.totalAmount.toLocaleString('en-IN')}\nStatus: PAID (GST 18% included)\n\nVehicle: ${activeBookingForInvoice.vehicleDetails?.brand || 'Car'} ${activeBookingForInvoice.vehicleDetails?.model || ''}\nMechanic: ${activeBookingForInvoice.mechanic?.name || 'Auto Pro Technician'}\n\nA digital PDF copy has been sent to your registered email.`,
      [{ text: 'Download PDF' }, { text: 'Close', style: 'cancel' }]
    );
  };

  const handleGetHelp = () => {
    navigation.navigate('Support');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Service History</Text>

        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Vehicle Selector Dropdown / Pills */}
        <View style={styles.vehicleSelectorSection}>
          <Text style={styles.selectorLabel}>Select Vehicle</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.vehiclePillsScroll}
          >
            {/* 'All Vehicles' pill */}
            <TouchableOpacity
              style={[
                styles.vehiclePill,
                selectedVehicleId === 'ALL' && styles.vehiclePillActive,
              ]}
              onPress={() => setSelectedVehicleId('ALL')}
              activeOpacity={0.7}
            >
              <Ionicons
                name="car-sport"
                size={14}
                color={selectedVehicleId === 'ALL' ? COLORS.white : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.vehiclePillText,
                  selectedVehicleId === 'ALL' && styles.vehiclePillTextActive,
                ]}
              >
                All Vehicles
              </Text>
            </TouchableOpacity>

            {/* Individual Vehicles */}
            {vehicles.map((v) => {
              const isSelected = selectedVehicleId === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  style={[
                    styles.vehiclePill,
                    isSelected && styles.vehiclePillActive,
                  ]}
                  onPress={() => setSelectedVehicleId(v.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="car-sport"
                    size={14}
                    color={isSelected ? COLORS.white : COLORS.textSecondary}
                  />
                  <Text
                    style={[
                      styles.vehiclePillText,
                      isSelected && styles.vehiclePillTextActive,
                    ]}
                  >
                    {v.brand} {v.model}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* History List Card */}
        <Card style={styles.historyCard} padding="lg" elevation="md">
          <View style={styles.historyHeaderRow}>
            <Text style={styles.historyCardTitle}>
              Completed Services ({displayedHistory.length})
            </Text>
            <Badge text="Verified by Auto Pro" variant="success" size="sm" />
          </View>

          <View style={styles.cardTopDivider} />

          {displayedHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={38} color={COLORS.gray400} />
              <Text style={styles.emptyTitle}>No service history for this vehicle</Text>
              <Text style={styles.emptySubtitle}>
                Completed service orders will automatically appear here with invoices.
              </Text>
            </View>
          ) : (
            displayedHistory.map((item, index) => {
              const isLast = index === displayedHistory.length - 1;
              const isSelected = selectedBooking?.id === item.id;

              return (
                <View key={item.id}>
                  <TouchableOpacity
                    style={[
                      styles.serviceItemRow,
                      isSelected && styles.serviceItemRowActive,
                    ]}
                    onPress={() => setSelectedBooking(item)}
                    activeOpacity={0.7}
                  >
                    {/* Service Icon Circle */}
                    <View style={styles.serviceIconCircle}>
                      <Ionicons
                        name="construct-outline"
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>

                    {/* Service Info */}
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName} numberOfLines={1}>
                        {item.serviceName}
                      </Text>
                      <Text style={styles.serviceDate}>
                        {item.scheduledDate}
                        {item.scheduledTime ? ` • ${item.scheduledTime}` : ''}
                      </Text>
                      {item.vehicleDetails && (
                        <Text style={styles.vehicleSub}>
                          {item.vehicleDetails.brand} {item.vehicleDetails.model}
                        </Text>
                      )}
                    </View>

                    {/* Price in Red Bold & Status */}
                    <View style={styles.priceColumn}>
                      <PriceText
                        price={item.totalAmount}
                        size="sm"
                        color={COLORS.primary}
                      />
                      <View style={styles.completedBadgeSmall}>
                        <Ionicons name="checkmark-circle" size={11} color={COLORS.success} />
                        <Text style={styles.completedBadgeText}>Completed</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {!isLast && <Divider spacing="sm" />}
                </View>
              );
            })
          )}
        </Card>

        {/* Selected Service Highlight Details Card */}
        {activeBookingForInvoice && (
          <Card style={styles.detailsCard} padding="md" elevation="sm">
            <View style={styles.detailsHeader}>
              <Ionicons name="information-circle" size={18} color={COLORS.primary} />
              <Text style={styles.detailsHeaderTitle}>Service Summary</Text>
            </View>
            <Text style={styles.detailsText}>
              Selected: <Text style={{ fontWeight: '700' }}>{activeBookingForInvoice.serviceName}</Text> on{' '}
              {activeBookingForInvoice.scheduledDate}.
            </Text>
            {activeBookingForInvoice.mechanic?.name && (
              <Text style={styles.detailsMechanic}>
                Mechanic: {activeBookingForInvoice.mechanic.name} (⭐ {activeBookingForInvoice.mechanic.rating || '4.9'})
              </Text>
            )}
          </Card>
        )}
      </ScrollView>

      {/* Bottom Action Bar: View Invoice & Get Help */}
      <View style={styles.bottomActionBar}>
        <View style={styles.actionButtonsRow}>
          <View style={styles.actionBtnWrapper}>
            <Button
              title="Get Help"
              variant="outline"
              size="md"
              fullWidth
              icon="help-circle-outline"
              onPress={handleGetHelp}
            />
          </View>
          <View style={styles.actionBtnWrapper}>
            <Button
              title="View Invoice"
              variant="primary"
              size="md"
              fullWidth
              icon="receipt-outline"
              onPress={handleViewInvoice}
            />
          </View>
        </View>
      </View>
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  headerRightSpacer: {
    width: 36,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 110, // room for bottom action bar
  },
  vehicleSelectorSection: {
    marginBottom: SPACING.lg,
  },
  selectorLabel: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  vehiclePillsScroll: {
    gap: SPACING.sm,
  },
  vehiclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADII.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
    ...SHADOWS.sm,
  },
  vehiclePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  vehiclePillText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.textSecondary,
  },
  vehiclePillTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    marginBottom: SPACING.lg,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyCardTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
  },
  cardTopDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  serviceItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: RADII.sm,
  },
  serviceItemRowActive: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.xs,
  },
  serviceIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  serviceInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  serviceName: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  serviceDate: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  vehicleSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  priceColumn: {
    alignItems: 'flex-end',
  },
  completedBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.success,
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    marginBottom: SPACING.md,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.xs,
  },
  detailsHeaderTitle: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.primary,
    fontWeight: '700',
  },
  detailsText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
  },
  detailsMechanic: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.lg,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  actionBtnWrapper: {
    flex: 1,
  },
});
