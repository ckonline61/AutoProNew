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
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { requestError, useCustomerData } from '../contexts/CustomerDataContext';
import { Address } from '../types';
import { Button, Badge, Card } from '../components/ui';

interface AddressesScreenProps {
  navigation?: {
    goBack: () => void;
  };
}

const QUICK_LABELS = ['Home', 'Work', 'Other'];

export const AddressesScreen: React.FC<AddressesScreenProps> = ({ navigation }) => {
  const { addresses, saveAddress, removeAddress } = useCustomerData();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [fields, setFields] = useState({
    title: 'Home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setEditingId(undefined);
    setFields({ title: 'Home', street: '', city: '', state: '', zipCode: '' });
    setIsDefault(false);
    setModalVisible(false);
  };

  const openAddModal = () => {
    setEditingId(undefined);
    setFields({ title: 'Home', street: '', city: '', state: '', zipCode: '' });
    setIsDefault(addresses.length === 0);
    setModalVisible(true);
  };

  const openEditModal = (address: Address) => {
    setEditingId(address.id);
    setFields({
      title: address.title,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    });
    setIsDefault(!!address.isDefault);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (saving) return;

    const { title, street, city, state, zipCode } = fields;
    if (!title.trim() || !street.trim() || !city.trim() || !state.trim() || !zipCode.trim()) {
      Alert.alert('Incomplete Address', 'Please fill in all address fields.');
      return;
    }

    if (!/^\d{6}$/.test(zipCode.trim())) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit postal pincode.');
      return;
    }

    setSaving(true);
    try {
      await saveAddress(
        {
          title: title.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          zipCode: zipCode.trim(),
          isDefault,
        },
        editingId
      );
      resetForm();
    } catch (error) {
      Alert.alert('Save Failed', requestError(error));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = (address: Address) => {
    Alert.alert(
      'Remove Address',
      `Are you sure you want to delete "${address.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeAddress(address.id);
            } catch (error) {
              Alert.alert('Remove Failed', requestError(error));
            }
          },
        },
      ]
    );
  };

  const getLabelIcon = (label: string): { icon: keyof typeof Ionicons.glyphMap; bg: string; color: string } => {
    const lower = (label || '').toLowerCase();
    if (lower.includes('home')) {
      return { icon: 'home', bg: '#FEE2E2', color: COLORS.primary };
    }
    if (lower.includes('work') || lower.includes('office')) {
      return { icon: 'briefcase', bg: '#DBEAFE', color: COLORS.info };
    }
    return { icon: 'location', bg: '#FEF3C7', color: '#D97706' };
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
          <Text style={styles.headerTitle}>My Addresses</Text>
        </View>
        <TouchableOpacity
          style={styles.headerAddBtn}
          onPress={openAddModal}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={18} color={COLORS.primary} />
          <Text style={styles.headerAddBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="location-outline" size={48} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Addresses Saved</Text>
            <Text style={styles.emptySubtitle}>
              Save your home, office, or workshop addresses for lightning-fast doorstep service bookings.
            </Text>
            <Button
              title="Add New Address"
              icon="add-circle-outline"
              variant="primary"
              size="md"
              onPress={openAddModal}
              style={{ marginTop: SPACING.lg }}
            />
          </View>
        ) : (
          <View style={styles.cardsList}>
            {addresses.map((address) => {
              const iconMeta = getLabelIcon(address.title);
              return (
                <Card key={address.id} style={styles.addressCard} elevation="sm" border>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.labelSection}>
                      <View style={[styles.iconBadge, { backgroundColor: iconMeta.bg }]}>
                        <Ionicons name={iconMeta.icon} size={20} color={iconMeta.color} />
                      </View>
                      <View style={styles.labelTitleContainer}>
                        <View style={styles.rowAlign}>
                          <Text style={styles.addressTitle}>{address.title}</Text>
                          {address.isDefault && (
                            <Badge
                              text="Default"
                              variant="error"
                              size="sm"
                              style={{ marginLeft: SPACING.sm }}
                            />
                          )}
                        </View>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.addressBody}>
                    {address.street}
                  </Text>
                  <Text style={styles.addressSubBody}>
                    {address.city}, {address.state} — {address.zipCode}
                  </Text>

                  {/* Actions Divider */}
                  <View style={styles.cardDivider} />

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => openEditModal(address)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="create-outline" size={16} color={COLORS.info} />
                      <Text style={[styles.actionBtnText, { color: COLORS.info }]}>Edit</Text>
                    </TouchableOpacity>

                    <View style={styles.actionSeparator} />

                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => handleRemove(address)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color={COLORS.primary} />
                      <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              );
            })}

            {/* Red Outline Button at Bottom */}
            <View style={styles.bottomBtnContainer}>
              <Button
                title="Add New Address"
                icon="add"
                variant="secondary"
                size="lg"
                fullWidth
                onPress={openAddModal}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Add / Edit Address Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={resetForm}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity onPress={resetForm} style={styles.modalCloseBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalFormContent}>
              {/* Quick Label Selector */}
              <Text style={styles.inputLabel}>Address Label</Text>
              <View style={styles.pillsRow}>
                {QUICK_LABELS.map((pill) => {
                  const isSelected = fields.title.toLowerCase() === pill.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={pill}
                      style={[styles.pillBtn, isSelected && styles.pillBtnSelected]}
                      onPress={() => setFields((prev) => ({ ...prev, title: pill }))}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pillBtnText, isSelected && styles.pillBtnTextSelected]}>
                        {pill}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Label if not quick pill */}
              {!QUICK_LABELS.some((p) => p.toLowerCase() === fields.title.toLowerCase()) && (
                <View style={styles.inputGroup}>
                  <Text style={styles.subInputLabel}>Custom Label</Text>
                  <TextInput
                    style={styles.textInput}
                    value={fields.title}
                    onChangeText={(val) => setFields((prev) => ({ ...prev, title: val }))}
                    placeholder="e.g. Vacation Home, Sister's Place"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              )}

              {/* Street & Building */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Street / Flat / Building *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={fields.street}
                  onChangeText={(val) => setFields((prev) => ({ ...prev, street: val }))}
                  placeholder="Flat No, Wing, Building Name, Street & Landmark"
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* City & State Row */}
              <View style={styles.inputsRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
                  <Text style={styles.inputLabel}>City *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={fields.city}
                    onChangeText={(val) => setFields((prev) => ({ ...prev, city: val }))}
                    placeholder="e.g. Pune"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>State *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={fields.state}
                    onChangeText={(val) => setFields((prev) => ({ ...prev, state: val }))}
                    placeholder="e.g. Maharashtra"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              {/* 6-Digit Pincode */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>6-Digit Pincode *</Text>
                <TextInput
                  style={styles.textInput}
                  value={fields.zipCode}
                  onChangeText={(val) => setFields((prev) => ({ ...prev, zipCode: val }))}
                  placeholder="e.g. 411045"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              {/* Default Address Switch */}
              <View style={styles.switchRow}>
                <View style={styles.switchTextCol}>
                  <Text style={styles.switchTitle}>Set as Default Address</Text>
                  <Text style={styles.switchSub}>Use this address automatically for upcoming bookings</Text>
                </View>
                <Switch
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{ false: COLORS.gray200, true: COLORS.primaryLight }}
                  thumbColor={isDefault ? COLORS.primary : COLORS.gray400}
                />
              </View>

              {/* Submit CTA Button */}
              <View style={styles.modalCtaRow}>
                <Button
                  title={saving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={saving}
                  onPress={handleSave}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
    marginRight: SPACING.md,
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: RADII.full,
    backgroundColor: COLORS.primaryLight,
  },
  headerAddBtnText: {
    ...TYPOGRAPHY.buttonSmall,
    color: COLORS.primary,
    fontWeight: '700',
    marginLeft: 2,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  cardsList: {
    gap: SPACING.md,
  },
  addressCard: {
    padding: SPACING.lg,
    borderRadius: RADII.md,
    backgroundColor: COLORS.white,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  labelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  labelTitleContainer: {
    flex: 1,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  addressTitle: {
    ...TYPOGRAPHY.h5,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  addressBody: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  addressSubBody: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.md,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  actionBtnText: {
    ...TYPOGRAPHY.label,
    fontWeight: '600',
    marginLeft: 6,
  },
  actionSeparator: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.divider,
  },
  bottomBtnContainer: {
    marginTop: SPACING.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['4xl'],
    paddingHorizontal: SPACING.xl,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADII.xl,
    borderTopRightRadius: RADII.xl,
    maxHeight: '88%',
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
  modalCloseBtn: {
    padding: SPACING.xs,
  },
  modalFormContent: {
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  inputLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subInputLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADII.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
  },
  pillBtnSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  pillBtnText: {
    ...TYPOGRAPHY.buttonSmall,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  pillBtnTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: SPACING.xs,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
  textArea: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.gray50,
    padding: SPACING.md,
    borderRadius: RADII.md,
    marginTop: SPACING.xs,
  },
  switchTextCol: {
    flex: 1,
    marginRight: SPACING.md,
  },
  switchTitle: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  switchSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  modalCtaRow: {
    marginTop: SPACING.md,
  },
});
