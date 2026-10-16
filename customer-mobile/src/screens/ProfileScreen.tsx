import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants';
import { requestError, useCustomerData } from '../contexts/CustomerDataContext';
import { VehicleCard } from '../components/VehicleCard';
import { Vehicle } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { vehicles, addresses, removeVehicle } = useCustomerData();

  const handleAddVehicle = () => {
    navigation.navigate('VehicleForm');
  };

  const handleEditVehicle = (veh: Vehicle) => {
    navigation.navigate('VehicleForm', { vehicle: veh, isEdit: true });
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    Alert.alert('Remove Vehicle', 'Are you sure you want to remove this vehicle?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try { await removeVehicle(vehicleId); } catch (error) { Alert.alert('Delete failed', requestError(error)); }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of Auto Pro?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Info Header Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Customer'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'customer@autopro.com'}</Text>
            <Text style={styles.userPhone}>{user?.phone || 'No phone number'}</Text>
          </View>
        </View>

        {/* My Vehicles Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Vehicles ({vehicles.length})</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddVehicle}
            activeOpacity={0.7}
          >
            <Text style={styles.addBtnText}>+ Add Vehicle</Text>
          </TouchableOpacity>
        </View>

        {vehicles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No vehicles saved yet. Add your car for quick booking.</Text>
          </View>
        ) : (
          vehicles.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onEdit={handleEditVehicle}
              onDelete={handleDeleteVehicle}
            />
          ))
        )}

        {/* My Addresses Section */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Addresses')}><Text style={{ color: COLORS.primary }}>Manage Addresses</Text></TouchableOpacity>
        </View>

        {addresses.map((addr) => (
          <View key={addr.id} style={styles.addressCard}>
            <View style={styles.addressIconBox}>
              <Text style={styles.addressEmoji}>📍</Text>
            </View>
            <View style={styles.addressInfo}>
              <View style={styles.addressTitleRow}>
                <Text style={styles.addressTitle}>{addr.title}</Text>
                {addr.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
              <Text style={styles.addressDetails}>
                {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
              </Text>
            </View>
          </View>
        ))}

        {/* Settings & Options */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
        </View>

        <View style={styles.settingsGroup}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingText}>🔔 Notifications</Text>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Account')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingText}>🔒 Security & Password</Text>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Support')}
            activeOpacity={0.7}
          >
            <Text style={styles.settingText}>📞 Help & 24/7 Roadside Support</Text>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingBottom: 36,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray700,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addressIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressEmoji: {
    fontSize: 18,
  },
  addressInfo: {
    flex: 1,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  addressTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  defaultBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: '#065F46',
    fontWeight: '700',
  },
  addressDetails: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  settingsGroup: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  arrowText: {
    fontSize: 20,
    color: COLORS.gray400,
    fontWeight: '300',
  },
  settingDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginHorizontal: 16,
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButtonText: {
    color: COLORS.emergency,
    fontSize: 15,
    fontWeight: '700',
  },
});
