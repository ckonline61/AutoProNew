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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { useCustomerData } from '../contexts/CustomerDataContext';
import { useAuth } from '../contexts/AuthContext';
import { AutoProLogo } from '../components/ui';

type Props = NativeStackScreenProps<HomeStackParamList, 'InvoiceDetail'>;

interface InvoiceLineItem {
  sNo: number;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export const InvoiceDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const { user } = useAuth();
  const { bookings } = useCustomerData();

  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const booking = bookings.find((b) => b.id === bookingId);
  const totalAmount = booking?.totalAmount || 2999;

  // Itemized breakdown table
  const lineItems: InvoiceLineItem[] = [
    {
      sNo: 1,
      description: `${booking?.serviceName || 'Periodic Scheduled Maintenance'} (Labor & Checkup)`,
      qty: 1,
      rate: Math.round(totalAmount * 0.45),
      amount: Math.round(totalAmount * 0.45),
    },
    {
      sNo: 2,
      description: 'Fully Synthetic 5W-30 Engine Oil (3.5L can)',
      qty: 1,
      rate: Math.round(totalAmount * 0.25),
      amount: Math.round(totalAmount * 0.25),
    },
    {
      sNo: 3,
      description: 'OEM Spin-on Oil Filter Element',
      qty: 1,
      rate: Math.round(totalAmount * 0.1),
      amount: Math.round(totalAmount * 0.1),
    },
    {
      sNo: 4,
      description: '40-Point Electronic Diagnostic & Safety Scan',
      qty: 1,
      rate: Math.round(totalAmount * 0.2),
      amount: Math.round(totalAmount * 0.2),
    },
  ];

  const subtotal = lineItems.reduce((acc, curr) => acc + curr.amount, 0);
  const discount = Math.round(subtotal * 0.1);
  const taxableValue = subtotal - discount;
  const cgst = Math.round(taxableValue * 0.09);
  const sgst = Math.round(taxableValue * 0.09);
  const finalTotal = taxableValue + cgst + sgst;

  const invoiceNumber = `INV-${new Date().getFullYear()}-${bookingId ? bookingId.slice(-6).toUpperCase() : '84210'}`;
  const invoiceDate = booking?.scheduledDate || new Date().toISOString().slice(0, 10);
  const gstNumber = '27AABCA9876K1Z9';

  const handleDownloadPDF = () => {
    if (isDownloading) return;
    setIsDownloading(true);

    setTimeout(() => {
      setIsDownloading(false);
      Alert.alert(
        'Invoice Downloaded',
        `Tax invoice ${invoiceNumber}.pdf has been saved to your downloads folder.`,
        [{ text: 'OK' }]
      );
    }, 1200);
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
        <Text style={styles.topBarTitle}>Invoice Detail</Text>
        <TouchableOpacity
          style={styles.circleBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={handleDownloadPDF}
        >
          <Ionicons name="share-social-outline" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Printable / Viewable White Tax Invoice Card */}
        <View style={styles.invoiceSheet}>
          {/* Header Row: Logo & Tax Invoice Heading */}
          <View style={styles.sheetHeader}>
            <AutoProLogo size="sm" showBrandName={true} tagline="Automotive Care & Services" />
            <View style={styles.taxInvoiceBadge}>
              <Text style={styles.taxInvoiceTitle}>TAX INVOICE</Text>
              <Text style={styles.taxInvoiceCopy}>ORIGINAL FOR RECIPIENT</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Invoice Meta Grid */}
          <View style={styles.metaRow}>
            <View style={styles.metaCol}>
              <Text style={styles.metaLabel}>Invoice No:</Text>
              <Text style={styles.metaValue}>{invoiceNumber}</Text>
              <Text style={[styles.metaLabel, { marginTop: 6 }]}>Invoice Date:</Text>
              <Text style={styles.metaValue}>{invoiceDate}</Text>
            </View>
            <View style={styles.metaColRight}>
              <Text style={styles.metaLabel}>Booking No:</Text>
              <Text style={styles.metaValue}>
                #{bookingId ? bookingId.slice(-6).toUpperCase() : 'BK8291'}
              </Text>
              <Text style={[styles.metaLabel, { marginTop: 6 }]}>GSTIN:</Text>
              <Text style={styles.metaValue}>{gstNumber}</Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          {/* Customer & Vehicle Details */}
          <View style={styles.partiesRow}>
            {/* Customer Column */}
            <View style={styles.partyCol}>
              <Text style={styles.partyHeader}>BILLED TO (CUSTOMER)</Text>
              <Text style={styles.partyName}>{user?.name || 'Customer'}</Text>
              <Text style={styles.partyText}>{user?.phone || '+91 98765 43210'}</Text>
              <Text style={styles.partyText} numberOfLines={3}>
                {booking?.address
                  ? `${booking.address.street}, ${booking.address.city} - ${booking.address.zipCode}`
                  : 'Doorstep Service, Shivajinagar, Pune 411005'}
              </Text>
            </View>

            {/* Vehicle Column */}
            <View style={styles.partyColRight}>
              <Text style={styles.partyHeader}>VEHICLE DETAILS</Text>
              <Text style={styles.partyName}>
                {booking?.vehicleDetails
                  ? `${booking.vehicleDetails.brand} ${booking.vehicleDetails.model}`
                  : 'Honda City i-VTEC'}
              </Text>
              <Text style={styles.partyText}>
                Reg: {booking?.vehicleDetails?.registrationNumber || 'MH 12 AB 1234'}
              </Text>
              <Text style={styles.partyText}>Fuel: Petrol (Synthetic Oil)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Itemized Services Table */}
          <View style={styles.tableHeader}>
            <Text style={[styles.thText, styles.colSNo]}>#</Text>
            <Text style={[styles.thText, styles.colDesc]}>Description</Text>
            <Text style={[styles.thText, styles.colQty]}>Qty</Text>
            <Text style={[styles.thText, styles.colAmt]}>Amount</Text>
          </View>

          {lineItems.map((item) => (
            <View key={item.sNo} style={styles.tableRow}>
              <Text style={[styles.tdText, styles.colSNo]}>{item.sNo}</Text>
              <Text style={[styles.tdText, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.tdText, styles.colQty]}>{item.qty}</Text>
              <Text style={[styles.tdText, styles.colAmt, styles.tdBold]}>
                ₹{item.amount}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          {/* Totals & Calculations */}
          <View style={styles.totalsContainer}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalVal}>₹{subtotal}</Text>
            </View>

            <View style={styles.totalLine}>
              <Text style={styles.discountLabel}>Promotional Discount</Text>
              <Text style={styles.discountVal}>-₹{discount}</Text>
            </View>

            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>CGST (9%)</Text>
              <Text style={styles.totalVal}>₹{cgst}</Text>
            </View>

            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>SGST (9%)</Text>
              <Text style={styles.totalVal}>₹{sgst}</Text>
            </View>

            <View style={styles.dashedDivider} />

            <View style={styles.finalTotalLine}>
              <Text style={styles.finalTotalLabel}>Total Amount (INR)</Text>
              <Text style={styles.finalTotalVal}>₹{finalTotal}</Text>
            </View>
          </View>

          {/* Payment Status Stamp */}
          <View style={styles.paymentStatusRow}>
            <View style={styles.paidBadge}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
              <Text style={styles.paidBadgeText}>PAID ONLINE VIA RAZORPAY</Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />

          {/* Footer & Signature Line */}
          <View style={styles.sheetFooter}>
            <View style={styles.thankYouCol}>
              <Text style={styles.thankYouText}>Thank you for choosing Auto Pro!</Text>
              <Text style={styles.safeDriveText}>Drive safe with our 1000 KMs service warranty.</Text>
            </View>

            <View style={styles.signatureCol}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureText}>Authorized Signatory</Text>
              <Text style={styles.autoProTech}>Auto Pro Services India Pvt Ltd</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Red Sticky Bottom CTA: Download PDF Invoice */}
      <View style={styles.stickyFooter}>
        <TouchableOpacity
          style={[styles.downloadBtn, isDownloading && styles.downloadBtnDisabled]}
          onPress={handleDownloadPDF}
          disabled={isDownloading}
          activeOpacity={0.85}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color={COLORS.white} />
              <Text style={styles.downloadBtnText}>Download PDF Invoice</Text>
            </>
          )}
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
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: 110,
  },
  invoiceSheet: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taxInvoiceBadge: {
    alignItems: 'flex-end',
  },
  taxInvoiceTitle: {
    ...TYPOGRAPHY.h5,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
  },
  taxInvoiceCopy: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginVertical: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaCol: {
    flex: 1,
  },
  metaColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metaLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  metaValue: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  partiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  partyCol: {
    flex: 1,
  },
  partyColRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  partyHeader: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  partyName: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  partyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.gray100,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: RADII.xs,
    marginBottom: 6,
  },
  thText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  tdText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  tdBold: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  colSNo: {
    width: 24,
  },
  colDesc: {
    flex: 1,
    paddingRight: 8,
  },
  colQty: {
    width: 32,
    textAlign: 'center',
  },
  colAmt: {
    width: 68,
    textAlign: 'right',
  },
  totalsContainer: {
    paddingHorizontal: 6,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  totalVal: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  discountLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '600',
  },
  discountVal: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    color: COLORS.success,
  },
  finalTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  finalTotalLabel: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
    fontWeight: '800',
  },
  finalTotalVal: {
    ...TYPOGRAPHY.priceLarge,
    color: COLORS.primary,
    fontWeight: '800',
  },
  paymentStatusRow: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADII.full,
    gap: 6,
  },
  paidBadgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.success,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sheetFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: SPACING.xs,
  },
  thankYouCol: {
    flex: 1,
    paddingRight: 10,
  },
  thankYouText: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  safeDriveText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  signatureCol: {
    alignItems: 'center',
  },
  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 4,
  },
  signatureText: {
    ...TYPOGRAPHY.caption,
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  autoProTech: {
    ...TYPOGRAPHY.caption,
    fontSize: 8,
    color: COLORS.textMuted,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    ...SHADOWS.lg,
  },
  downloadBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOWS.md,
  },
  downloadBtnDisabled: {
    opacity: 0.6,
  },
  downloadBtnText: {
    ...TYPOGRAPHY.buttonLarge,
    color: COLORS.white,
    fontWeight: '700',
  },
});
