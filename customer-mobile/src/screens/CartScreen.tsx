import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { Card, Button, Badge, PriceText } from '../components/ui';
import { requestError, useCustomerData } from '../contexts/CustomerDataContext';
import { useAuth } from '../contexts/AuthContext';
import { Address, CartItem } from '../types';
import { useNavigation } from '@react-navigation/native';

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { cart, orders, addresses, updateCartQuantity, placeOrder } = useCustomerData();
  const { isPreview } = useAuth();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [busy, setBusy] = useState<boolean>(false);
  const [addressModalVisible, setAddressModalVisible] = useState<boolean>(false);

  // Determine active address
  const activeAddress = useMemo(() => {
    if (selectedAddressId) {
      const found = addresses.find((a) => a.id === selectedAddressId);
      if (found) return found;
    }
    const defaultAddr = addresses.find((a) => a.isDefault);
    return defaultAddr || addresses[0] || null;
  }, [addresses, selectedAddressId]);

  // Price calculations
  const itemsTotal = useMemo(() => {
    return cart.reduce(
      (sum, item) => sum + (item.unitPrice ?? item.sparePart.price) * item.quantity,
      0
    );
  }, [cart]);

  const mrpTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const mrp = item.sparePart.originalPrice ?? (item.unitPrice ?? item.sparePart.price);
      return sum + mrp * item.quantity;
    }, 0);
  }, [cart]);

  const discountAmount = Math.max(0, mrpTotal - itemsTotal);
  const deliveryCharges = itemsTotal >= 999 || itemsTotal === 0 ? 0 : 99;
  const finalTotal = itemsTotal + deliveryCharges;

  const handleUpdateQuantity = async (sparePartId: string, quantity: number) => {
    if (busy) return;
    setBusy(true);
    try {
      await updateCartQuantity(sparePartId, quantity);
    } catch (error) {
      Alert.alert('Cart update failed', requestError(error));
    } finally {
      setBusy(false);
    }
  };

  const handleCheckout = () => {
    if (!activeAddress) {
      Alert.alert(
        'Address required',
        'Please add a shipping address in your profile before placing an order.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add Address',
            onPress: () => navigation.navigate('Addresses'),
          },
        ]
      );
      return;
    }

    Alert.alert(
      isPreview ? 'Place sample order via Razorpay?' : 'Confirm Order',
      `Ship to: ${activeAddress.street}, ${activeAddress.city}\nAmount to pay: ₹${finalTotal.toLocaleString('en-IN')}\n\nProceed with Razorpay secure payment gateway?`,
      [
        { text: 'Keep Shopping', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: async () => {
            if (busy) return;
            setBusy(true);
            try {
              const order = await placeOrder(activeAddress);
              Alert.alert(
                isPreview ? 'Order Placed (Preview Mode)' : 'Order Placed Successfully! 🎉',
                `Order ID: ${order.number || order.id}\nStatus: ${order.status}\nPayment: Authorized\nTotal Amount: ₹${order.totalAmount.toLocaleString('en-IN')}`
              );
            } catch (error) {
              Alert.alert('Order failed', requestError(error));
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
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

        <Text style={styles.headerTitle}>Shopping Cart</Text>

        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Empty Cart State */}
        {cart.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="cart-outline" size={48} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Explore our wide range of genuine spare parts and accessories to get started.
            </Text>
            <Button
              title="Browse Spare Parts"
              onPress={() => navigation.goBack()}
              style={{ marginTop: SPACING.lg }}
              icon="arrow-back"
            />
          </View>
        ) : (
          <>
            {/* Cart Items List */}
            <View style={styles.itemsSection}>
              <Text style={styles.sectionHeading}>
                Items in Cart ({cart.length})
              </Text>

              {cart.map((item: CartItem) => {
                const unitPrice = item.unitPrice ?? item.sparePart.price;
                const part = item.sparePart;

                return (
                  <Card key={item.sparePartId} style={styles.itemCard} padding="md">
                    <View style={styles.itemRow}>
                      {/* Product Image / Placeholder */}
                      <View style={styles.itemImageWrapper}>
                        {part.imageUrl ? (
                          <Image
                            source={{ uri: part.imageUrl }}
                            style={styles.itemImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.imagePlaceholder}>
                            <Ionicons name="cog" size={26} color={COLORS.gray400} />
                          </View>
                        )}
                      </View>

                      {/* Product Details */}
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemBrand}>
                          {part.brand ? part.brand.toUpperCase() : 'GENUINE PART'}
                        </Text>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {part.name || 'Auto Component'}
                        </Text>
                        <Text style={styles.itemVariant}>
                          Category: {part.category || 'Spare Part'}
                        </Text>

                        {/* Price & Stepper Row */}
                        <View style={styles.itemActionRow}>
                          <Text style={styles.itemPriceRed}>
                            ₹{(unitPrice * item.quantity).toLocaleString('en-IN')}
                          </Text>

                          {/* Quantity Stepper */}
                          <View style={styles.stepperContainer}>
                            <TouchableOpacity
                              style={styles.stepperBtn}
                              disabled={busy}
                              onPress={() =>
                                handleUpdateQuantity(item.sparePartId, item.quantity - 1)
                              }
                            >
                              <Ionicons name="remove" size={14} color={COLORS.textPrimary} />
                            </TouchableOpacity>

                            <Text style={styles.stepperCount}>{item.quantity}</Text>

                            <TouchableOpacity
                              style={styles.stepperBtn}
                              disabled={busy}
                              onPress={() =>
                                handleUpdateQuantity(item.sparePartId, item.quantity + 1)
                              }
                            >
                              <Ionicons name="add" size={14} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                          </View>

                          {/* Remove button */}
                          <TouchableOpacity
                            style={styles.removeBtn}
                            disabled={busy}
                            onPress={() => handleUpdateQuantity(item.sparePartId, 0)}
                          >
                            <Ionicons name="trash-outline" size={16} color={COLORS.emergencyRed} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Card>
                );
              })}
            </View>

            {/* Delivery Address Card */}
            <View style={styles.addressSection}>
              <Text style={styles.sectionHeading}>Delivery Address</Text>
              <Card style={styles.addressCard} padding="md">
                <View style={styles.addressHeaderRow}>
                  <View style={styles.addressIconWrap}>
                    <Ionicons name="location" size={18} color={COLORS.primary} />
                  </View>
                  <View style={styles.addressInfo}>
                    <View style={styles.addressTitleRow}>
                      <Text style={styles.addressTitle}>
                        {activeAddress?.title || 'No address selected'}
                      </Text>
                      {activeAddress?.isDefault && (
                        <Badge text="Default" variant="success" size="sm" />
                      )}
                    </View>
                    <Text style={styles.addressText} numberOfLines={2}>
                      {activeAddress
                        ? `${activeAddress.street}, ${activeAddress.city}, ${activeAddress.state} - ${activeAddress.zipCode}`
                        : 'Please add a shipping address to proceed.'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setAddressModalVisible(true)}
                    activeOpacity={0.7}
                    style={styles.changeAddressBtn}
                  >
                    <Text style={styles.changeAddressText}>Change</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </View>

            {/* Price Details Breakdown */}
            <View style={styles.billSection}>
              <Text style={styles.sectionHeading}>Price Details</Text>
              <Card style={styles.billCard} padding="lg">
                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Items Total</Text>
                  <Text style={styles.billValue}>
                    ₹{itemsTotal.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Delivery Charges</Text>
                  <Text
                    style={[
                      styles.billValue,
                      deliveryCharges === 0 && styles.freeDeliveryText,
                    ]}
                  >
                    {deliveryCharges === 0 ? 'FREE' : `₹${deliveryCharges}`}
                  </Text>
                </View>

                {discountAmount > 0 && (
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Catalog Discount</Text>
                    <Text style={styles.discountGreen}>
                      -₹{discountAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}

                <View style={styles.billDivider} />

                <View style={styles.billTotalRow}>
                  <Text style={styles.totalLabelBold}>Total Amount</Text>
                  <Text style={styles.totalValueBold}>
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </Text>
                </View>

                {deliveryCharges === 0 && (
                  <View style={styles.savingsBanner}>
                    <Ionicons name="sparkles" size={14} color={COLORS.success} />
                    <Text style={styles.savingsText}>
                      You saved on free doorstep delivery!
                    </Text>
                  </View>
                )}
              </Card>
            </View>

            {/* Place Order CTA */}
            <View style={styles.ctaContainer}>
              <Button
                title={busy ? 'Processing...' : 'Place Order via Razorpay'}
                onPress={handleCheckout}
                disabled={busy}
                loading={busy}
                size="lg"
                fullWidth
                icon="shield-checkmark-outline"
              />
              <Text style={styles.secureText}>
                🔒 100% Secure Checkout powered by Razorpay
              </Text>
            </View>
          </>
        )}

        {/* Order History Section */}
        {orders.length > 0 && (
          <View style={styles.ordersSection}>
            <Text style={styles.sectionHeading}>Recent Orders ({orders.length})</Text>
            {orders.map((order) => (
              <Card key={order.id} style={styles.orderCard} padding="md">
                <View style={styles.orderHeaderRow}>
                  <View>
                    <Text style={styles.orderNumber}>
                      {order.number || `Order #${order.id.slice(0, 8)}`}
                    </Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                  <Badge
                    text={order.status}
                    variant={order.status === 'DELIVERED' ? 'success' : 'info'}
                    size="sm"
                  />
                </View>

                <View style={styles.orderDivider} />

                {order.items.map((item, idx) => (
                  <View key={idx} style={styles.orderItemRow}>
                    <Text style={styles.orderItemName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.orderItemQty}>
                      × {item.quantity}  (₹{item.price * item.quantity})
                    </Text>
                  </View>
                ))}

                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotalLabel}>Total Paid: </Text>
                  <Text style={styles.orderTotalValue}>
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Address Selection Modal */}
      <Modal
        visible={addressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Delivery Address</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Ionicons name="close-circle" size={24} color={COLORS.gray500} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {addresses.map((addr) => {
                const isSelected = activeAddress?.id === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={[
                      styles.modalAddressOption,
                      isSelected && styles.modalAddressOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedAddressId(addr.id);
                      setAddressModalVisible(false);
                    }}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? COLORS.primary : COLORS.gray400}
                    />
                    <View style={styles.modalAddressDetails}>
                      <Text style={styles.modalAddressTitle}>{addr.title}</Text>
                      <Text style={styles.modalAddressSub}>
                        {addr.street}, {addr.city}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Button
              title="+ Add New Address"
              variant="outline"
              size="md"
              onPress={() => {
                setAddressModalVisible(false);
                navigation.navigate('Addresses');
              }}
              style={{ marginTop: SPACING.md }}
            />
          </View>
        </View>
      </Modal>
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
    paddingBottom: SPACING['4xl'],
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
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  sectionHeading: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  itemsSection: {
    marginBottom: SPACING.lg,
  },
  itemCard: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  itemRow: {
    flexDirection: 'row',
  },
  itemImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: RADII.sm,
    backgroundColor: COLORS.gray100,
    overflow: 'hidden',
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemBrand: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  itemName: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
    marginTop: 1,
  },
  itemVariant: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  itemActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs + 2,
  },
  itemPriceRed: {
    ...TYPOGRAPHY.price,
    color: COLORS.primary,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    paddingHorizontal: 8,
  },
  removeBtn: {
    padding: 6,
  },
  addressSection: {
    marginBottom: SPACING.lg,
  },
  addressCard: {
    backgroundColor: COLORS.surface,
  },
  addressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressTitle: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  addressText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  changeAddressBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  changeAddressText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.primary,
    fontWeight: '700',
  },
  billSection: {
    marginBottom: SPACING.lg,
  },
  billCard: {
    backgroundColor: COLORS.surface,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  billLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  billValue: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  freeDeliveryText: {
    color: COLORS.success,
    fontWeight: '700',
  },
  discountGreen: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.success,
    fontWeight: '700',
  },
  billDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.sm,
  },
  billTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabelBold: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
  },
  totalValueBold: {
    ...TYPOGRAPHY.priceLarge,
    color: COLORS.primary,
  },
  savingsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: RADII.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    marginTop: SPACING.sm,
    gap: 6,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.success,
  },
  ctaContainer: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  secureText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.sm,
  },
  ordersSection: {
    marginTop: SPACING.md,
  },
  orderCard: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  orderDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  orderDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.sm,
  },
  orderItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderItemName: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  orderItemQty: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: SPACING.xs,
  },
  orderTotalLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  orderTotalValue: {
    ...TYPOGRAPHY.label,
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADII.lg,
    borderTopRightRadius: RADII.lg,
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
  },
  modalAddressOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  modalAddressOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  modalAddressDetails: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  modalAddressTitle: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  modalAddressSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
