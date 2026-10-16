import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { requestError } from '../contexts/CustomerDataContext';
export const AccountScreen = () => {
  const { user, isPreview, loadStoredToken, logout } = useAuth();
  const [name, setName] = useState(user?.name || ''); const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [busy, setBusy] = useState(false);
  const save = async () => {
    if (busy) return; setBusy(true);
    try { if (isPreview) throw new Error('Account changes are disabled in sample preview.'); await api.put('/users/profile', { name: name.trim(), phone: phone.trim() }); await loadStoredToken(); Alert.alert('Profile updated'); }
    catch (error) { Alert.alert('Update failed', requestError(error)); } finally { setBusy(false); }
  };
  const password = async () => {
    if (busy) return;
    if (!currentPassword || newPassword.length < 8) { Alert.alert('Check password', 'Enter your current password and a new password of at least eight characters.'); return; }
    setBusy(true);
    try { if (isPreview) throw new Error('Password changes are disabled in sample preview.'); await api.put('/users/profile/password', { currentPassword, newPassword }); setCurrentPassword(''); setNewPassword(''); await logout(); Alert.alert('Password changed', 'Sign in again with your new password.'); }
    catch (error) { Alert.alert('Password change failed', requestError(error)); } finally { setBusy(false); }
  };
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled"><Text style={{ fontSize: 22, fontWeight: '700' }}>Account Details</Text>{isPreview && <Text>Use a real account to edit profile details or change your password.</Text>}<Text>Name</Text><TextInput value={name} onChangeText={setName} maxLength={100} style={{ borderWidth: 1, padding: 12 }} /><Text>Phone</Text><TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={{ borderWidth: 1, padding: 12 }} /><TouchableOpacity disabled={busy || isPreview} onPress={() => void save()}><Text style={{ color: '#2563EB' }}>Save profile</Text></TouchableOpacity><Text style={{ fontSize: 22, fontWeight: '700' }}>Change Password</Text><TextInput value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password" secureTextEntry style={{ borderWidth: 1, padding: 12 }} /><TextInput value={newPassword} onChangeText={setNewPassword} placeholder="New password" secureTextEntry maxLength={128} style={{ borderWidth: 1, padding: 12 }} /><TouchableOpacity disabled={busy || isPreview} onPress={() => void password()}><Text style={{ color: '#2563EB' }}>{busy ? 'Saving...' : 'Change password'}</Text></TouchableOpacity></ScrollView>;
};
