import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Modal,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { requestError } from '../contexts/CustomerDataContext';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { Button, Badge, Card, Avatar } from '../components/ui';

interface AccountScreenProps {
  navigation?: {
    goBack: () => void;
  };
}

export const AccountScreen: React.FC<AccountScreenProps> = ({ navigation }) => {
  const { user, isPreview, loadStoredToken, logout } = useAuth();

  // App Settings switches
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  // Edit Profile Modal
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password Modal
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Policy / Terms Modal
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);

  // Save profile changes
  const handleSaveProfile = async () => {
    if (savingProfile) return;
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      return;
    }

    setSavingProfile(true);
    try {
      if (isPreview) {
        Alert.alert('Preview Mode', 'Profile updates are simulated in preview mode.');
        setEditProfileVisible(false);
        return;
      }
      await api.put('/users/profile', { name: name.trim(), phone: phone.trim() });
      await loadStoredToken();
      setEditProfileVisible(false);
      Alert.alert('Profile Updated', 'Your personal details have been updated successfully.');
    } catch (error) {
      Alert.alert('Update Failed', requestError(error));
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (changingPassword) return;

    if (!currentPassword || newPassword.length < 8) {
      Alert.alert(
        'Invalid Password',
        'Enter your current password and a new password with at least 8 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      if (isPreview) {
        Alert.alert('Preview Mode', 'Password change is simulated in preview mode.');
        setPasswordModalVisible(false);
        return;
      }
      await api.put('/users/profile/password', { currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordModalVisible(false);
      Alert.alert('Password Changed', 'Please sign in again with your new credentials.', [
        { text: 'OK', onPress: () => void logout() },
      ]);
    } catch (error) {
      Alert.alert('Password Change Failed', requestError(error));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to sign out of your Auto Pro account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            void logout();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {navigation?.goBack && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Settings & Privacy</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card */}
        <Card style={styles.profileCard} elevation="sm" border>
          <View style={styles.profileRow}>
            <Avatar
              name={user?.name || 'Customer'}
              size={54}
              backgroundColor={COLORS.primaryLight}
              textColor={COLORS.primary}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Customer Name'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'customer@example.com'}</Text>
              {user?.phone ? (
                <Text style={styles.profilePhone}>{user.phone}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => {
                setName(user?.name || '');
                setPhone(user?.phone || '');
                setEditProfileVisible(true);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* SECTION 1: App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>APP SETTINGS</Text>
          <Card style={styles.settingsGroupCard} elevation="none" border>
            {/* Push Notifications */}
            <View style={styles.settingRow}>
              <View style={[styles.settingIconCircle, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="notifications-outline" size={18} color={COLORS.info} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingSubtitle}>Order updates, tracking and promotions</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: COLORS.gray200, true: COLORS.primaryLight }}
                thumbColor={notificationsEnabled ? COLORS.primary : COLORS.gray400}
              />
            </View>

            <View style={styles.rowDivider} />

            {/* Location Permission */}
            <View style={styles.settingRow}>
              <View style={[styles.settingIconCircle, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="location-outline" size={18} color={COLORS.success} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Location Permission</Text>
                <Text style={styles.settingSubtitle}>Accurate doorstep mechanics & emergency SOS</Text>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: COLORS.gray200, true: COLORS.primaryLight }}
                thumbColor={locationEnabled ? COLORS.primary : COLORS.gray400}
              />
            </View>

            <View style={styles.rowDivider} />

            {/* Dark Mode */}
            <View style={styles.settingRow}>
              <View style={[styles.settingIconCircle, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="moon-outline" size={18} color="#7C3AED" />
              </View>
              <View style={styles.settingTextContainer}>
                <View style={styles.rowAlign}>
                  <Text style={styles.settingTitle}>Dark Mode</Text>
                  <Badge text="Coming Soon" variant="default" size="sm" style={{ marginLeft: 6 }} />
                </View>
                <Text style={styles.settingSubtitle}>Night-optimized theme</Text>
              </View>
              <Switch
                value={false}
                disabled
                trackColor={{ false: COLORS.gray200, true: COLORS.primaryLight }}
                thumbColor={COLORS.gray300}
              />
            </View>

            <View style={styles.rowDivider} />

            {/* Language Selector */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setLanguageModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="globe-outline" size={18} color="#D97706" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Language</Text>
                <Text style={styles.settingSubtitle}>Select preferred interface language</Text>
              </View>
              <View style={styles.rowAlign}>
                <Text style={styles.langValueText}>{selectedLanguage}</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        {/* SECTION 2: Privacy & Security */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PRIVACY & SECURITY</Text>
          <Card style={styles.settingsGroupCard} elevation="none" border>
            {/* Change Password */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => {
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setPasswordModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingSubtitle}>Update your sign-in password</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* Privacy Policy */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setLegalModalType('privacy')}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#0284C7" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
                <Text style={styles.settingSubtitle}>How we handle and protect your data</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            {/* Terms & Conditions */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setLegalModalType('terms')}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIconCircle, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="document-text-outline" size={18} color={COLORS.gray600} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Terms & Conditions</Text>
                <Text style={styles.settingSubtitle}>Usage agreement and service rules</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* SECTION 3: Account Actions & Logout */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <Card style={styles.settingsGroupCard} elevation="none" border>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={handleLogoutPress}
              activeOpacity={0.7}
            >
              <View style={[styles.settingIconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="log-out-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: COLORS.primary }]}>Log Out</Text>
                <Text style={styles.settingSubtitle}>Safely end your session on this device</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* Version Footer */}
        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>Auto Pro Mobile v2.4.0 (Build 2026)</Text>
          <Text style={styles.copyrightText}>Powered by Auto Pro TVS Automotive Network</Text>
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogCard}>
            <Text style={styles.dialogTitle}>Select Language</Text>
            {['English', 'Hindi (हिंदी)', 'Marathi (मराठी)', 'Tamil (தமிழ்)'].map((lang) => {
              const pureName = lang.split(' ')[0];
              const isSelected = selectedLanguage.startsWith(pureName);
              return (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langOption, isSelected && styles.langOptionSelected]}
                  onPress={() => {
                    setSelectedLanguage(pureName);
                    setLanguageModalVisible(false);
                  }}
                >
                  <Text style={[styles.langOptionText, isSelected && styles.langOptionTextSelected]}>
                    {lang}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
            <Button
              title="Close"
              variant="outline"
              size="sm"
              onPress={() => setLanguageModalVisible(false)}
              style={{ marginTop: SPACING.md }}
            />
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={editProfileVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditProfileVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditProfileVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textMuted}
                maxLength={100}
              />

              <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98765 43210"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
              />

              <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Email Address (Read-only)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalInputDisabled]}
                value={user?.email || ''}
                editable={false}
              />

              <Button
                title={savingProfile ? 'Saving...' : 'Save Profile'}
                variant="primary"
                size="lg"
                fullWidth
                loading={savingProfile}
                onPress={handleSaveProfile}
                style={{ marginTop: SPACING.xl }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.modalInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter existing password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
              />

              <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>New Password (min 8 chars)</Text>
              <TextInput
                style={styles.modalInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new strong password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                maxLength={128}
              />

              <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Confirm New Password</Text>
              <TextInput
                style={styles.modalInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repeat new password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry
                maxLength={128}
              />

              <Button
                title={changingPassword ? 'Updating...' : 'Update Password'}
                variant="primary"
                size="lg"
                fullWidth
                loading={changingPassword}
                onPress={handleChangePassword}
                style={{ marginTop: SPACING.xl }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Legal Policy / Terms Modal */}
      <Modal
        visible={legalModalType !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setLegalModalType(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {legalModalType === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
              </Text>
              <TouchableOpacity onPress={() => setLegalModalType(null)}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.legalBody} showsVerticalScrollIndicator={false}>
              {legalModalType === 'privacy' ? (
                <>
                  <Text style={styles.legalHeading}>1. Information We Collect</Text>
                  <Text style={styles.legalText}>
                    Auto Pro collects personal details such as your name, phone number, email address, vehicle registration details, and GPS coordinates solely to dispatch mechanics and deliver automotive services efficiently.
                  </Text>
                  <Text style={styles.legalHeading}>2. Real-Time Tracking Data</Text>
                  <Text style={styles.legalText}>
                    GPS location is accessed exclusively during active emergency assistance calls and doorstep mechanic tracking. We never sell or distribute your travel paths to third-party advertisers.
                  </Text>
                  <Text style={styles.legalHeading}>3. Security & Payments</Text>
                  <Text style={styles.legalText}>
                    Payment credentials are processed via RBI-compliant payment gateways with end-to-end 256-bit SSL encryption. Auto Pro never stores your raw card numbers or UPI PINs.
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.legalHeading}>1. Doorstep Service Agreements</Text>
                  <Text style={styles.legalText}>
                    By scheduling a service or booking a certified technician, you authorize Auto Pro service specialists to perform diagnostics, repairs, and part installations as approved in your estimate.
                  </Text>
                  <Text style={styles.legalHeading}>2. OEM Parts Warranty</Text>
                  <Text style={styles.legalText}>
                    All brand-new replacement spare parts carry a manufacturer warranty of 6 months or 10,000 km, whichever comes first. Misuse or third-party tampering voids the guarantee.
                  </Text>
                  <Text style={styles.legalHeading}>3. Cancellations & Rescheduling</Text>
                  <Text style={styles.legalText}>
                    Bookings can be rescheduled or cancelled without fee up to 2 hours before the technician arrives at your location.
                  </Text>
                </>
              )}
              <Button
                title="I Understand"
                variant="primary"
                size="md"
                onPress={() => setLegalModalType(null)}
                style={{ marginTop: SPACING.xl }}
              />
            </ScrollView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: SPACING.sm,
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  profileName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  profileEmail: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  profilePhone: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  editProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  settingsGroupCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    paddingVertical: SPACING.xs,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  settingIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  settingTitle: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  settingSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langValueText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginRight: 4,
    fontWeight: '500',
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 56,
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  versionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  copyrightText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    paddingBottom: SPACING.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  modalBody: {
    padding: SPACING.xl,
  },
  inputLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  modalInputDisabled: {
    backgroundColor: COLORS.gray100,
    color: COLORS.textMuted,
  },

  // Dialog Styles
  dialogBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  dialogCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 360,
    ...SHADOWS.lg,
  },
  dialogTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.sm,
    marginBottom: 6,
  },
  langOptionSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  langOptionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  langOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // Legal Content
  legalBody: {
    padding: SPACING.xl,
  },
  legalHeading: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: 4,
  },
  legalText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
