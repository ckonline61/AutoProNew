import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { useCustomerData } from '../contexts/CustomerDataContext';

export const ProductDetailScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { productId } = route.params || {};
  const { spareParts, vehicles, addPart } = useCustomerData();
  const product = spareParts.find(p => p.id === productId) || spareParts[0];
  const [qty, setQty] = useState(1);
  const vehicle = vehicles?.[0];

  if (!product) return <SafeAreaView style={s.container}><Text style={{ padding: 24 }}>Product not found</Text></SafeAreaView>;

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} /></TouchableOpacity>
        <Text style={s.headerTitle}>Product Detail</Text>
        <TouchableOpacity><Ionicons name="heart-outline" size={24} color={COLORS.textPrimary} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Product Image */}
        <View style={s.imagePlaceholder}>
          <Ionicons name="cube-outline" size={64} color={COLORS.gray400} />
        </View>

        {/* Title & Rating */}
        <Text style={s.productTitle}>{product.name}</Text>
        <Text style={s.brandText}>{product.brand}</Text>
        <View style={s.ratingRow}>
          <Ionicons name="star" size={14} color={COLORS.starGold} />
          <Text style={s.ratingText}>4.6</Text>
          <Text style={s.reviewCount}>(120 reviews)</Text>
          <View style={s.stockBadge}><Text style={s.stockText}>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</Text></View>
        </View>

        {/* Price */}
        <View style={s.priceRow}>
          <Text style={s.price}>₹{product.price.toLocaleString('en-IN')}</Text>
          {product.originalPrice ? <Text style={s.originalPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</Text> : null}
          {discount > 0 && <View style={s.discountBadge}><Text style={s.discountText}>{discount}% OFF</Text></View>}
        </View>

        {/* Compatible */}
        {vehicle && (
          <View style={s.compatCard}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={s.compatTitle}>Compatible with your car</Text>
              <Text style={s.compatSub}>{vehicle.brand} {vehicle.model} ({vehicle.registrationNumber})</Text>
            </View>
          </View>
        )}

        {/* Trust Badges */}
        <View style={s.trustRow}>
          {[{ icon: 'shield-checkmark', text: '100% Genuine' }, { icon: 'refresh', text: 'Easy Returns' }, { icon: 'flash', text: 'Fast Delivery' }].map(b => (
            <View key={b.text} style={s.trustItem}>
              <Ionicons name={b.icon as any} size={18} color={COLORS.success} />
              <Text style={s.trustText}>{b.text}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <Text style={s.descTitle}>Description</Text>
        <Text style={s.descText}>{product.description}</Text>

        {/* Quantity */}
        <View style={s.qtyRow}>
          <Text style={s.qtyLabel}>Quantity</Text>
          <View style={s.qtyControls}>
            <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(Math.max(1, qty - 1))}><Ionicons name="remove" size={18} color={COLORS.textPrimary} /></TouchableOpacity>
            <Text style={s.qtyValue}>{qty}</Text>
            <TouchableOpacity style={s.qtyBtn} onPress={() => setQty(qty + 1)}><Ionicons name="add" size={18} color={COLORS.textPrimary} /></TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={s.bottomBar}>
        <TouchableOpacity style={s.addBtn} onPress={() => { for (let i = 0; i < qty; i++) addPart(product); navigation.goBack(); }}>
          <Ionicons name="cart" size={20} color={COLORS.white} />
          <Text style={s.addBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  headerTitle: { ...TYPOGRAPHY.h4, color: COLORS.textPrimary },
  scroll: { padding: SPACING.lg, paddingBottom: 100 },
  imagePlaceholder: { width: '100%', height: 200, backgroundColor: COLORS.gray100, borderRadius: RADII.md, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  productTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  brandText: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.md },
  ratingText: { ...TYPOGRAPHY.bodySemibold, color: COLORS.textPrimary },
  reviewCount: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary },
  stockBadge: { backgroundColor: COLORS.successLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADII.full, marginLeft: 8 },
  stockText: { ...TYPOGRAPHY.labelSmall, color: COLORS.success },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.lg },
  price: { ...TYPOGRAPHY.priceLarge, color: COLORS.primary },
  originalPrice: { ...TYPOGRAPHY.priceStrikethrough, color: COLORS.textMuted },
  discountBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADII.full },
  discountText: { ...TYPOGRAPHY.labelSmall, color: COLORS.primary },
  compatCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.successLight, padding: SPACING.md, borderRadius: RADII.md, marginBottom: SPACING.lg },
  compatTitle: { ...TYPOGRAPHY.bodySemibold, color: COLORS.textPrimary },
  compatSub: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  trustRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.lg },
  trustItem: { alignItems: 'center', gap: 4 },
  trustText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  descTitle: { ...TYPOGRAPHY.h5, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  descText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.lg },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyLabel: { ...TYPOGRAPHY.h5, color: COLORS.textPrimary },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  qtyBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.gray100, alignItems: 'center', justifyContent: 'center' },
  qtyValue: { ...TYPOGRAPHY.h4, color: COLORS.textPrimary, minWidth: 24, textAlign: 'center' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.white, padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, height: 52, borderRadius: RADII.md, gap: 8 },
  addBtnText: { ...TYPOGRAPHY.buttonLarge, color: COLORS.white },
});
