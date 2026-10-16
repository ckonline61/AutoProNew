import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { useCustomerData } from '../contexts/CustomerDataContext';

export const ServiceCategoriesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { categories, services } = useCustomerData();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Periodic', 'Repairs', 'Cranking', 'AC'];

  const ICONS: Record<string, string> = {
    REGULAR_SERVICE: 'construct', AC_SERVICE: 'snow', BATTERY: 'flash', TYRES: 'disc',
    BRAKES: 'stopwatch', DENTING_PAINTING: 'color-palette', DETAILING: 'sparkles',
    WINDSHIELD_LIGHTS: 'bulb', CLUTCH_FITMENTS: 'cog',
  };

  const filtered = categories.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchTab = activeTab === 'All' || c.name.toLowerCase().includes(activeTab.toLowerCase());
    return matchSearch && matchTab;
  });

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Car Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={s.searchRow}>
        <View style={s.searchBox}>
          <Ionicons name="search" size={18} color={COLORS.gray400} />
          <TextInput style={s.searchInput} placeholder="Search services..." placeholderTextColor={COLORS.gray400} value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={COLORS.gray400} /></TouchableOpacity> : null}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabRow} contentContainerStyle={{ gap: 8, paddingHorizontal: SPACING.lg }}>
        {tabs.map(t => (
          <TouchableOpacity key={t} style={[s.tabPill, activeTab === t && s.tabPillActive]} onPress={() => setActiveTab(t)}>
            <Text style={[s.tabText, activeTab === t && s.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.md }}
        renderItem={({ item }) => {
          const svc = services.find(sv => sv.categoryId === item.id);
          return (
            <TouchableOpacity style={s.card} activeOpacity={0.7} onPress={() => svc && navigation.navigate('ServiceDetail', { service: svc })}>
              <View style={s.cardIcon}>
                <Ionicons name={(ICONS[item.code] || 'build') as any} size={24} color={COLORS.primary} />
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{item.name}</Text>
                <Text style={s.cardDesc} numberOfLines={1}>{item.description}</Text>
                <View style={s.cardMeta}>
                  <Ionicons name="star" size={12} color={COLORS.starGold} />
                  <Text style={s.cardRating}>4.8</Text>
                  <Text style={s.cardDuration}>• 45-60 mins</Text>
                </View>
              </View>
              <View style={s.cardRight}>
                <Text style={s.cardPrice}>From ₹{item.startingPrice.toLocaleString('en-IN')}</Text>
                <View style={s.bookBtn}><Text style={s.bookBtnText}>Book</Text></View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<View style={s.empty}><Ionicons name="search-outline" size={48} color={COLORS.gray300} /><Text style={s.emptyText}>No services found</Text></View>}
      />
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.white },
  headerTitle: { ...TYPOGRAPHY.h4, color: COLORS.textPrimary },
  searchRow: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, backgroundColor: COLORS.white },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray100, borderRadius: RADII.md, paddingHorizontal: SPACING.md, height: 44, gap: 8 },
  searchInput: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.textPrimary },
  tabRow: { backgroundColor: COLORS.white, paddingVertical: SPACING.sm, maxHeight: 50 },
  tabPill: { paddingHorizontal: SPACING.lg, paddingVertical: 6, borderRadius: RADII.full, backgroundColor: COLORS.gray100 },
  tabPillActive: { backgroundColor: COLORS.primary },
  tabText: { ...TYPOGRAPHY.label, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white },
  card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: RADII.md, padding: SPACING.lg, ...SHADOWS.md, alignItems: 'center' },
  cardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  cardBody: { flex: 1 },
  cardTitle: { ...TYPOGRAPHY.h5, color: COLORS.textPrimary, marginBottom: 2 },
  cardDesc: { ...TYPOGRAPHY.bodySmall, color: COLORS.textSecondary, marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardRating: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary, fontWeight: '600' },
  cardDuration: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  cardRight: { alignItems: 'flex-end', marginLeft: SPACING.sm },
  cardPrice: { ...TYPOGRAPHY.priceSmall, color: COLORS.primary, marginBottom: 6 },
  bookBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADII.sm },
  bookBtnText: { ...TYPOGRAPHY.labelSmall, color: COLORS.white },
  empty: { alignItems: 'center', paddingVertical: SPACING['4xl'], gap: SPACING.md },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
});
