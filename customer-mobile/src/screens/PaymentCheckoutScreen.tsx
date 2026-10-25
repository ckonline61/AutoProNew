import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import RazorpayCheckout from 'react-native-razorpay';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { useCustomerData } from '../contexts/CustomerDataContext';
import api from '../config/api';

type Props = NativeStackScreenProps<HomeStackParamList, 'PaymentCheckout'>;

type PaymentMethodType = 'COD' | 'UPI' | 'CARD' | 'NET_BANKING';

interface PaymentOption {
  id: PaymentMethodType;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  badges?: string[];
  isOnline?: boolean;
}

const PAYMENT_METHODS: PaymentOption[] = [
  {
    id: 'COD',
    title: 'Pay at Service Completion',
    subtitle: 'Cash or UPI directly to mechanic after job done',
    icon: 'handshake',
    badges: ['Cash', 'UPI', 'QR Code'],
    isOnline: false,
  },
  {
    id: 'UPI',
    title: 'UPI (Google Pay, PhonePe, Paytm)',
    subtitle: 'Instant transfer via any UPI App or VPA ID',
    icon: 'lightning-bolt-circle',
    badges: ['GPay', 'PhonePe', 'Paytm', 'BHIM'],
    isOnline: true,
  },
  {
    id: 'CARD',
    title: 'Credit / Debit Card',
    subtitle: 'Visa, MasterCard, RuPay & Diners Club',
    icon: 'credit-card-outline',
    badges: ['Visa', 'MasterCard', 'RuPay'],
    isOnline: true,
  },
  {
    id: 'NET_BANKING',
    title: 'Net Banking',
    subtitle: 'All Indian banks (HDFC, SBI, ICICI, Axis...)',
    icon: 'bank-outline',
    badges: ['HDFC', 'SBI', 'ICICI'],
    isOnline: true,
  },
];

export const PaymentCheckoutScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId, amount, serviceName } = route.params;
  const { bookings } = useCustomerData();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('COD');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Find booking details if available
  const booking = bookings.find((b) => b.id === bookingId);
  const totalPayable = amount || booking?.totalAmount || 2999;

  // Breakdown calculations
  const basicService = Math.round(totalPayable * 0.55);
  const engineOil = Math.round(totalPayable * 0.22);
  const oilFilter = Math.round(totalPayable * 0.08);
  const labourCharges = Math.round(totalPayable * 0.15);
  const subtotal = basicService + engineOil + oilFilter + labourCharges;
  const discount = Math.round(totalPayable * 0.1);
  const taxable = subtotal - discount;
  const gst = Math.round(taxable * 0.18);
  const finalTotal = taxable + gst;

  const handleCODConfirm = () => {
    Alert.alert(
      '✅ Booking Confirmed!',
      `Your booking is confirmed!\n\nPayment: ₹${finalTotal} to be collected at service completion.\n\nYour mechanic will collect payment (Cash / UPI / QR) after the job is done successfully.`,
      [
        {
          text: 'Track Booking',
          onPress: () => navigation.replace('BookingDetail', { bookingId, booking }),
        },
      ]
    );
  };

  const handleRazorpayPayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Step 1: Create Razorpay order on backend
      const orderResponse = await api.post('/payments/orders', { bookingId });
      const { razorpayOrder, keyId } = orderResponse.data.data;

      // Step 2: Open Razorpay checkout
      const options = {
        description: serviceName || booking?.serviceName || 'Auto Pro Service',
        image: 'https://auto-pro-backend-403346240734.asia-south1.run.app/logo.png',
        currency: 'INR',
        key: keyId,
        amount: razorpayOrder.amount, // already in paise
        order_id: razorpayOrder.id,
        name: 'Auto Pro',
        prefill: {
          email: '',
          contact: '',
          name: '',
        },
        theme: { color: COLORS.primary },
      };

      const paymentData = await RazorpayCheckout.open(options);

      // Step 3: Verify payment on backend
      await api.post('/payments/verify', {
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpaySignature: paymentData.razorpay_signature,
      });

      // Step 4: Success
      setIsProcessing(false);
      Alert.alert(
        '🎉 Payment Successful!',
        `₹${finalTotal} paid successfully!\n\nTransaction ID: ${paymentData.razorpay_payment_id}`,
        [
          {
            text: 'View Invoice',
            onPress: () => navigation.replace('InvoiceDetail', { bookingId }),
          },
          {
            text: 'Track Booking',
            onPress: () => navigation.replace('BookingDetail', { bookingId, booking }),
          },
        ]
      );
    } catch (error: unknown) {
      setIsProcessing(false);
      const err = error as { code?: number; description?: string; message?: string };
      // User cancelled (code 0) — don't show error
      if (err?.code === 0) return;
      Alert.alert(
        'Payment Failed',
        err?.description || err?.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleConfirmPayment = () => {
    if (selectedMethod === 'COD') {
      handleCODConfirm();
    } else {
      void handleRazorpayPayment();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />

      {/* Screen Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.circleBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Payment Checkout</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Service Details Card */}
        <View style={styles.card}>
          <View style={styles.serviceHeaderRow}>
            <View style={styles.serviceIconBadge}>
              <MaterialCommunityIcons name="shield-check" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.serviceHeaderInfo}>
              <Text style={styles.bookingRefText}>
                BOOKING REF #{bookingId ? bookingId.slice(-6).toUpperCase() : 'BK9812'}
              </Text>
              <Text style={styles.serviceNameText}>{serviceName || booking?.serviceName || 'Car Service Package'}</Text>
            </View>
          </View>

          <View style={styles.serviceMetaGrid}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Vehicle</Text>
              <Text style={styles.metaValue}>
                {booking?.vehicleDetails
                  ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model}`
                  : 'Selected Vehicle'}
              </Text>
            </View>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Scheduled For</Text>
              <Text style={styles.metaValue}>
                {booking ? `${booking.scheduledDate} • ${booking.scheduledTime.split(' - ')[0]}` : 'Tomorrow, 10:00 AM'}
              </Text>
            </View>
          </View>
        </View>

        {/* Price Breakdown Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Basic Service Charges</Text>
            <Text style={styles.breakdownValue}>₹{basicService}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Synthetic Engine Oil (3.5L)</Text>
            <Text style={styles.breakdownValue}>₹{engineOil}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>OEM Oil Filter Replacement</Text>
            <Text style={styles.breakdownValue}>₹{oilFilter}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Standard Labour & Inspection</Text>
            <Text style={styles.breakdownValue}>₹{labourCharges}</Text>
          </View>

          <View style={styles.subtotalDivider} />

          <View style={styles.breakdownRow}>
            <Text style={styles.subtotalLabel}>Subtotal</Text>
            <Text style={styles.subtotalValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.discountLabel}>Promotional Discount (AUTOPRO)</Text>
            <Text style={styles.discountValue}>-₹{discount}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Goods & Services Tax (GST 18%)</Text>
            <Text style={styles.breakdownValue}>₹{gst}</Text>
          </View>

          <View style={styles.totalDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalTitle}>Total Amount</Text>
            <Text style={styles.totalAmountText}>₹{finalTotal}</Text>
          </View>
        </View>

        {/* Select Payment Method Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          <Text style={styles.sectionSubtitle}>Choose your preferred checkout method</Text>

          <View style={styles.methodsList}>
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedMethod === method.id;
              return (
                <TouchableOpacity
                  key={method.id}
                  style={[styles.methodCard, isSelected && styles.methodCardSelected]}
                  onPress={() => setSelectedMethod(method.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.radioDotOuter, isSelected && styles.radioDotOuterSelected]}>
                    {isSelected && <View style={styles.radioDotInner} />}
                  </View>

                  <View style={styles.methodIconBadge}>
                    <MaterialCommunityIcons
                      name={method.icon}
                      size={24}
                      color={isSelected ? COLORS.primary : COLORS.gray600}
                    />
                  </View>

                  <View style={styles.methodInfo}>
                    <Text style={[styles.methodTitle, isSelected && styles.methodTitleSelected]}>
                      {method.title}
                    </Text>
                    <Text style={styles.methodSubtitle}>{method.subtitle}</Text>

                    {method.badges && (
                      <View style={styles.badgesRow}>
                        {method.badges.map((b) => (
                          <View key={b} style={styles.badgePill}>
                            <Text style={styles.badgePillText}>{b}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Security Row */}
        <View style={styles.securityRow}>
          <Ionicons name="lock-closed" size={16} color={COLORS.success} />
          <Text style={styles.securityText}>
            Secure & Trusted • 256-bit SSL • Powered by Razorpay
          </Text>
        </View>
      </ScrollView>

      {/* Sticky CTA Button */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
          onPress={handleConfirmPayment}
          disabled={isProcessing}
          activeOpacity={0.85}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.payButtonText}>
                {selectedMethod === 'COD'
                  ? '✓ Confirm Booking'
                  : `Pay ₹${finalTotal} via Razorpay`}
              </Text>
              <Ionicons name="shield-checkmark" size={18} color={COLORS.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.gray100,
    alignItems: 'center', justifyContent: 'center',
  },
  topBarTitle: { ...TYPOGRAPHY.h5, color: COLORS.textPrimary, fontWeight: '700' },
  scrollContent: { padding: SPACING.md, paddingBottom: 110 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    ...SHADOWS.sm,
  },
  serviceHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  serviceIconBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md,
  },
  serviceHeaderInfo: { flex: 1 },
  bookingRefText: { ...TYPOGRAPHY.caption, color: COLORS.primary, fontWeight: '800', letterSpacing: 0.5 },
  serviceNameText: { ...TYPOGRAPHY.h5, color: COLORS.textPrimary, fontWeight: '700', marginTop: 2 },
  serviceMetaGrid: {
    flexDirection: 'row', backgroundColor: COLORS.gray50,
    borderRadius: RADII.sm, padding: SPACING.md, gap: 16,
  },
  metaCol: { flex: 1 },
  metaLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: 2 },
  metaValue: { ...TYPOGRAPHY.bodySmall, color: COLORS.textPrimary, fontWeight: '600' },
  sectionTitle: { ...TYPOGRAPHY.h5, color: COLORS.textPrimary, fontWeight: '700', marginBottom: SPACING.sm },
  sectionSubtitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: SPACING.md },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  breakdownLabel: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary },
  breakdownValue: { ...TYPOGRAPHY.bodySmall, color: COLORS.textPrimary, fontWeight: '600' },
  subtotalDivider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: 6 },
  subtotalLabel: { ...TYPOGRAPHY.bodySmall, color: COLORS.textPrimary, fontWeight: '600' },
  subtotalValue: { ...TYPOGRAPHY.bodySmall, color: COLORS.textPrimary, fontWeight: '700' },
  discountLabel: { ...TYPOGRAPHY.bodySmall, color: COLORS.success, fontWeight: '600' },
  discountValue: { ...TYPOGRAPHY.bodySmall, color: COLORS.success, fontWeight: '700' },
  totalDivider: { height: 1.5, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalTitle: { ...TYPOGRAPHY.bodyLarge, fontWeight: '800', color: COLORS.textPrimary },
  totalAmountText: { ...TYPOGRAPHY.priceLarge, color: COLORS.primary, fontWeight: '800' },
  methodsList: { gap: 12 },
  methodCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: SPACING.md, borderRadius: RADII.md,
    borderWidth: 1.5, borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  methodCardSelected: { borderColor: COLORS.primary, backgroundColor: '#FEF2F2' },
  radioDotOuter: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: COLORS.gray400,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12, marginTop: 2,
  },
  radioDotOuterSelected: { borderColor: COLORS.primary },
  radioDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  methodIconBadge: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.gray100,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  methodInfo: { flex: 1 },
  methodTitle: { ...TYPOGRAPHY.bodySemibold, color: COLORS.textPrimary },
  methodTitleSelected: { color: COLORS.primary },
  methodSubtitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  badgesRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  badgePill: { backgroundColor: COLORS.gray100, paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADII.xs },
  badgePillText: { ...TYPOGRAPHY.caption, fontSize: 9, color: COLORS.textSecondary, fontWeight: '600' },
  securityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: SPACING.xs, marginBottom: SPACING.md },
  securityText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  stickyFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.borderLight, ...SHADOWS.lg,
  },
  payButton: {
    backgroundColor: COLORS.primary, borderRadius: RADII.md,
    paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, ...SHADOWS.md,
  },
  payButtonDisabled: { opacity: 0.6 },
  payButtonText: { ...TYPOGRAPHY.buttonLarge, color: COLORS.white, fontWeight: '700' },
});
