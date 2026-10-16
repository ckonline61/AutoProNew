import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import { requestError, useCustomerData } from '../contexts/CustomerDataContext';
import { Address } from '../types';
export const AddressesScreen = () => {
  const { addresses, saveAddress, removeAddress } = useCustomerData();
  const [editing, setEditing] = useState<string>();
  const [fields, setFields] = useState({ title: '', street: '', city: '', state: '', zipCode: '' });
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const reset = () => { setEditing(undefined); setFields({ title: '', street: '', city: '', state: '', zipCode: '' }); setIsDefault(false); };
  const edit = (address: Address) => { setEditing(address.id); setFields(address); setIsDefault(!!address.isDefault); };
  const save = async () => {
    if (saving) return;
    if (Object.values(fields).some(v => !v.trim()) || !/^\d{6}$/.test(fields.zipCode.trim())) { Alert.alert('Check address', 'Complete all fields and enter a six-digit pincode.'); return; }
    setSaving(true);
    try { await saveAddress({ ...fields, title: fields.title.trim(), street: fields.street.trim(), city: fields.city.trim(), state: fields.state.trim(), zipCode: fields.zipCode.trim(), isDefault }, editing); reset(); }
    catch (error) { Alert.alert('Save failed', requestError(error)); }
    finally { setSaving(false); }
  };
  const remove = (address: Address) => Alert.alert('Remove address', `Remove ${address.title}?`, [{ text: 'Keep', style: 'cancel' }, { text: 'Remove', style: 'destructive', onPress: () => { void removeAddress(address.id).catch(error => Alert.alert('Remove failed', requestError(error))); } }]);
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
    <Text style={{ fontSize: 22, fontWeight: '700' }}>Service Addresses</Text>
    {addresses.length === 0 && <Text>No addresses saved. Add one below for doorstep bookings.</Text>}
    {addresses.map(address => <View key={address.id} style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, gap: 8 }}>
      <Text style={{ fontWeight: '700' }}>{address.title}{address.isDefault ? ' — Default' : ''}</Text><Text>{address.street}, {address.city}, {address.state} {address.zipCode}</Text>
      <View style={{ flexDirection: 'row', gap: 24 }}><TouchableOpacity onPress={() => edit(address)}><Text style={{ color: '#2563EB' }}>Edit</Text></TouchableOpacity><TouchableOpacity onPress={() => remove(address)}><Text style={{ color: '#DC2626' }}>Remove</Text></TouchableOpacity></View>
    </View>)}
    <Text style={{ fontSize: 18, fontWeight: '700' }}>{editing ? 'Edit Address' : 'Add Address'}</Text>
    {(Object.keys(fields) as (keyof typeof fields)[]).filter(key => ['title','street','city','state','zipCode'].includes(key)).map(key => <View key={key}><Text>{({ title: 'Label (Home / Office)', street: 'Street and building', city: 'City', state: 'State', zipCode: 'Pincode' } as const)[key]}</Text><TextInput accessibilityLabel={key} value={fields[key]} onChangeText={value => setFields(previous => ({ ...previous, [key]: value }))} keyboardType={key === 'zipCode' ? 'number-pad' : 'default'} style={{ borderWidth: 1, borderColor: '#CBD5E1', padding: 12, borderRadius: 8, marginTop: 6 }} /></View>)}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text>Default address</Text><Switch value={isDefault} onValueChange={setIsDefault} /></View>
    <TouchableOpacity accessibilityRole="button" disabled={saving} onPress={() => void save()} style={{ backgroundColor: '#2563EB', padding: 16, borderRadius: 8 }}><Text style={{ color: 'white', textAlign: 'center' }}>{saving ? 'Saving...' : 'Save address'}</Text></TouchableOpacity>
    {editing && <TouchableOpacity onPress={reset}><Text>Cancel editing</Text></TouchableOpacity>}
  </ScrollView>;
};
