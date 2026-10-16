import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import { requestError, useCustomerData } from '../contexts/CustomerDataContext';
import { useAuth } from '../contexts/AuthContext';
import { idOf, record } from '../services/customer-data';
const problems = [ ['JUMP_START','Battery jump start'], ['FLAT_TYRE','Flat tyre'], ['FUEL_EMERGENCY','Fuel emergency'], ['BREAKDOWN','Vehicle breakdown'], ['TOWING','Towing'] ] as const;
const terminal = ['COMPLETED','CANCELLED','FAILED','REJECTED','EXPIRED'];
export const EmergencyScreen = () => {
  const { isPreview } = useAuth();
  const { emergencies, createEmergency, refreshEmergency, cancelEmergency } = useCustomerData();
  const [problemType, setProblemType] = useState<string>('JUMP_START');
  const [latitude, setLatitude] = useState(isPreview ? '18.5204' : ''); const [longitude, setLongitude] = useState(isPreview ? '73.8567' : '');
  const [address, setAddress] = useState(''); const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const active = emergencies.find(e => !terminal.includes(String(e.status)));
  const activeId = idOf(active);
  useEffect(() => {
    if (!activeId || isPreview) return;
    let cancelled = false;
    const reload = () => { void refreshEmergency(activeId).catch(error => { if (!cancelled) setError(requestError(error)); }); };
    reload(); const timer = setInterval(reload, 30000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [activeId, isPreview]);
  const locate = async () => {
    if (busy) return; setBusy(true); setError('');
    try { const permission = await Location.requestForegroundPermissionsAsync(); if (!permission.granted) throw new Error('Location permission was denied. Enter coordinates manually.'); const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }); setLatitude(String(position.coords.latitude)); setLongitude(String(position.coords.longitude)); }
    catch (error) { setError(requestError(error)); } finally { setBusy(false); }
  };
  const request = async () => {
    if (busy || active) return;
    if (!latitude.trim() || !longitude.trim()) { setError('Use Locate me or enter latitude and longitude.'); return; }
    setBusy(true); setError('');
    try { await createEmergency({ problemType, latitude: Number(latitude), longitude: Number(longitude), description: description.trim() || undefined, address: address.trim() || undefined }); }
    catch (error) { setError(requestError(error)); } finally { setBusy(false); }
  };
  const cancel = () => Alert.alert('Cancel SOS?', 'Cancel this assistance request?', [{ text: 'Keep active', style: 'cancel' }, { text: 'Cancel SOS', style: 'destructive', onPress: async () => { setBusy(true); try { await cancelEmergency(activeId); } catch (error) { setError(requestError(error)); } finally { setBusy(false); } } }]);
  const provider = record(active?.assignedProviderId);
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
    <Text style={{ fontSize: 24, fontWeight: '800', color: '#DC2626' }}>Roadside Assistance</Text><Text>If there is immediate danger, contact local emergency services. Move to a safe place if possible.</Text>
    {isPreview && <Text>Sample request only. No actual patrol is dispatched.</Text>}
    {!!error && <Text style={{ color: '#DC2626' }} accessibilityRole="alert">{error}</Text>}
    {active ? <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 12, gap: 12 }}><Text style={{ fontSize: 18, fontWeight: '700' }}>Request {String(active.requestNumber || activeId)}</Text><Text>Status: {String(active.status).replace(/_/g,' ')}</Text>{active.assignedProviderId ? <Text>Provider: {String(provider.name || 'Assignment recorded')}</Text> : <Text>Searching for a provider. No technician has been assigned yet.</Text>}{typeof active.estimatedArrival === 'number' && <Text>Estimated arrival: {active.estimatedArrival} minutes</Text>}{typeof provider.phone === 'string' && <TouchableOpacity onPress={() => void Linking.openURL(`tel:${provider.phone}`).catch(error => setError(requestError(error)))}><Text style={{ color: '#2563EB' }}>Call assigned provider</Text></TouchableOpacity>}<TouchableOpacity disabled={busy} onPress={() => void refreshEmergency(activeId).catch(error => setError(requestError(error)))}><Text style={{ color: '#2563EB' }}>Refresh status</Text></TouchableOpacity><TouchableOpacity disabled={busy} onPress={cancel}><Text style={{ color: '#DC2626' }}>Cancel request</Text></TouchableOpacity></View> : <>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Your Location</Text><TouchableOpacity disabled={busy} onPress={() => void locate()}><Text style={{ color: '#2563EB' }}>{busy ? 'Please wait...' : 'Locate me (one-time location)'}</Text></TouchableOpacity>
      <TextInput value={latitude} onChangeText={setLatitude} placeholder="Latitude" keyboardType="numbers-and-punctuation" style={{ borderWidth: 1, padding: 12 }} /><TextInput value={longitude} onChangeText={setLongitude} placeholder="Longitude" keyboardType="numbers-and-punctuation" style={{ borderWidth: 1, padding: 12 }} /><TextInput value={address} onChangeText={setAddress} placeholder="Nearby landmark / address" maxLength={500} style={{ borderWidth: 1, padding: 12 }} />
      <Text style={{ fontSize: 18, fontWeight: '700' }}>Problem</Text>{problems.map(([key,label]) => <TouchableOpacity key={key} onPress={() => setProblemType(key)} style={{ padding: 14, borderWidth: 1, borderColor: problemType === key ? '#2563EB' : '#CBD5E1', borderRadius: 8 }}><Text>{label}</Text></TouchableOpacity>)}<TextInput value={description} onChangeText={setDescription} placeholder="Details for the provider" multiline maxLength={1000} style={{ borderWidth: 1, padding: 12 }} /><TouchableOpacity disabled={busy} onPress={() => void request()} style={{ padding: 16, backgroundColor: '#DC2626', borderRadius: 8 }}><Text style={{ color: 'white', textAlign: 'center' }}>{busy ? 'Sending...' : 'Request assistance'}</Text></TouchableOpacity></>}
  </ScrollView>;
};
