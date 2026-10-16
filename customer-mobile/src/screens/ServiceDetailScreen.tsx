import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { COLORS } from '../constants';
import { useCustomerData } from '../contexts/CustomerDataContext';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'ServiceDetail'>;

export const ServiceDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const serviceParams = route.params;

  const { services } = useCustomerData();
  const service = 'service' in serviceParams ? serviceParams.service : services.find(s => s.id === serviceParams.serviceId);
  if (!service) return <View style={{ padding: 24 }}><Text>This service is no longer available. Refresh the service catalogue.</Text></View>;

  const handleBookNow = () => {
    navigation.navigate('BookingForm', {
      serviceId: service.id,
      serviceName: service.name,
      price: service.price,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner Card */}
        <View style={styles.headerCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{service.categoryName || 'AUTO PRO CERTIFIED'}</Text>
          </View>
          <Text style={styles.title}>{service.name}</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statItem}>⏱️ Est. {service.estimatedDuration}</Text>
            <Text style={styles.statDot}>•</Text>
            <Text style={styles.statItem}>⭐ 4.9 (420+ reviews)</Text>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Service Overview</Text>
          <Text style={styles.descriptionText}>{service.description}</Text>
        </View>

        {/* What's Included */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>What's Included</Text>
          {service.includedFeatures.map((item, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              <Text style={styles.featureText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Auto Pro Guarantee */}
        <View style={styles.guaranteeBox}>
          <Text style={styles.guaranteeTitle}>🔒 1000 KMs / 1-Month Warranty</Text>
          <Text style={styles.guaranteeSub}>
            Every service is backed by our unconditional warranty. If anything feels off, we inspect and resolve free of cost.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.actionBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>₹{service.price}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          activeOpacity={0.85}
        >
          <Text style={styles.bookButtonText}>Book Now →</Text>
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
  scrollContent: {
    padding: 18,
    paddingBottom: 90,
  },
  headerCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statItem: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statDot: {
    color: COLORS.gray300,
  },
  section: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.gray700,
    lineHeight: 22,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.gray700,
    lineHeight: 18,
  },
  guaranteeBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  guaranteeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  guaranteeSub: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBackground,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
