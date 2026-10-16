import React, { useState, useEffect } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { requestError } from '../contexts/CustomerDataContext';
import { idOf, record, RecordData } from '../services/customer-data';
export const SupportScreen = () => {
  const { isPreview } = useAuth();
  const [tickets, setTickets] = useState<RecordData[]>([]);
  const [selected, setSelected] = useState<RecordData>();
  const [subject, setSubject] = useState(''); const [description, setDescription] = useState(''); const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const load = async () => {
    if (isPreview) return; setBusy(true); setError('');
    try { const response = await api.get('/support'); if (!Array.isArray(response.data.data)) throw new Error('Invalid ticket response.'); setTickets(response.data.data); }
    catch (error) { setError(requestError(error)); } finally { setBusy(false); }
  };
  useEffect(() => { void load(); }, [isPreview]);
  const create = async () => {
    if (busy || !subject.trim() || !description.trim()) { if (!busy) Alert.alert('Complete the form', 'Enter a subject and description.'); return; }
    setBusy(true); setError('');
    try { const ticket = isPreview ? { id: `preview-ticket-${Date.now()}`, subject: subject.trim(), status: 'OPEN', description: description.trim(), messages: [] } : record((await api.post('/support', { subject: subject.trim(), description: description.trim(), category: 'GENERAL' })).data.data); setTickets(previous => [ticket,...previous]); setSubject(''); setDescription(''); }
    catch (error) { setError(requestError(error)); } finally { setBusy(false); }
  };
  const open = async (ticket: RecordData) => {
    setBusy(true); setError('');
    try { setSelected(isPreview ? ticket : record((await api.get(`/support/${idOf(ticket)}`)).data.data)); }
    catch (error) { setError(requestError(error)); } finally { setBusy(false); }
  };
  const send = async () => {
    if (!selected || busy || !message.trim()) return; setBusy(true); setError('');
    try { const ticket = isPreview ? { ...selected, messages: [...(Array.isArray(selected.messages) ? selected.messages : []), { message: message.trim() }] } : record((await api.post(`/support/${idOf(selected)}/messages`, { message: message.trim() })).data.data); setSelected(ticket); setTickets(previous => previous.map(t => idOf(t) === idOf(ticket) ? ticket : t)); setMessage(''); }
    catch (error) { setError(requestError(error)); } finally { setBusy(false); }
  };
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }} keyboardShouldPersistTaps="handled">
    <Text style={{ fontSize: 22, fontWeight: '700' }}>Customer Support</Text>
    {!!error && <Text style={{ color: '#DC2626' }} accessibilityRole="alert">{error}</Text>}
    <TouchableOpacity disabled={busy} onPress={() => void load()}><Text style={{ color: '#2563EB' }}>{busy ? 'Loading...' : 'Refresh tickets'}</Text></TouchableOpacity>
    {selected ? <><TouchableOpacity onPress={() => setSelected(undefined)}><Text>← All tickets</Text></TouchableOpacity><Text style={{ fontSize: 18 }}>{String(selected.subject)}</Text><Text>Status: {String(selected.status)}</Text><Text>{String(selected.description || '')}</Text>{Array.isArray(selected.messages) && selected.messages.map((value,index) => <Text key={index} style={{ padding: 12, backgroundColor: 'white' }}>{String(record(value).message || '')}</Text>)}<TextInput value={message} onChangeText={setMessage} placeholder="Your reply" multiline maxLength={2000} style={{ borderWidth: 1, padding: 12 }} /><TouchableOpacity disabled={busy || !message.trim()} onPress={() => void send()}><Text style={{ color: '#2563EB' }}>Send reply</Text></TouchableOpacity></> : <>
      {!tickets.length && !busy && <Text>No support tickets yet.</Text>}{tickets.map(ticket => <TouchableOpacity key={idOf(ticket)} disabled={busy} onPress={() => void open(ticket)} style={{ backgroundColor: 'white', padding: 16, borderRadius: 10 }}><Text>{String(ticket.subject)} — {String(ticket.status)}</Text></TouchableOpacity>)}
      <Text style={{ fontSize: 18, fontWeight: '700' }}>New Ticket</Text><TextInput value={subject} onChangeText={setSubject} placeholder="Subject" maxLength={200} style={{ borderWidth: 1, padding: 12 }} /><TextInput value={description} onChangeText={setDescription} placeholder="Describe the issue" multiline maxLength={2000} style={{ borderWidth: 1, padding: 12, minHeight: 90 }} /><TouchableOpacity disabled={busy} onPress={() => void create()} style={{ padding: 16, backgroundColor: '#2563EB', borderRadius: 8 }}><Text style={{ color: 'white' }}>Create ticket</Text></TouchableOpacity></>}
  </ScrollView>;
};
