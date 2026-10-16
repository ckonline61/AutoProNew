import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import api from '../config/api';
import { Button, Field, styles } from '../components/ui';
import { canShareLocation, errorMessage, Job, JobKind, loadWorkspace, MechanicUser, nextStatus, Profile, statusLabel, updateJob } from '../services/mechanic-api';

export function Workspace({ user, onLogout }: { user: MechanicUser; onLogout: () => void }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [emergencies, setEmergencies] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const mounted = useRef(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState<'jobs' | 'sos' | 'profile'>('jobs');
  const [specializations, setSpecializations] = useState('');
  const [experience, setExperience] = useState('0');
  const [license, setLicense] = useState('');
  const [notes, setNotes] = useState('');
  const [selected, setSelected] = useState<{ job: Job; kind: JobKind } | null>(null);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const refresh = useCallback(async () => {
    const data = await loadWorkspace();
    if (!mounted.current) return;
    setProfile(data.profile); setJobs(data.jobs); setEmergencies(data.emergencies); setLoaded(true);
    setSelected(previous => {
      if (!previous) return null;
      const job = (previous.kind === 'booking' ? data.jobs : data.emergencies).find(item => item._id === previous.job._id);
      return job ? { ...previous, job } : null;
    });
  }, []);
  const run = async (action: () => Promise<void>, message = '') => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try { await action(); if (mounted.current && message) setNotice(message); }
    catch (err) { if (mounted.current) setError(errorMessage(err)); }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  };
  useEffect(() => { void refresh().catch(err => setError(errorMessage(err))).finally(() => setLoading(false)); }, [refresh]);
  const mutate = async (action: () => Promise<unknown>) => {
    await action();
    setNotice('Saved.');
    try { await refresh(); }
    catch (err) { setSelected(null); setLoaded(false); throw new Error(`Saved, but the latest data could not be loaded. Refresh before another change. ${errorMessage(err)}`); }
  };
  const shareLocation = async () => {
    if (!selected || !canShareLocation(selected.job.status)) throw new Error('Location is available only during an active journey.');
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) throw new Error('Location permission was denied. You can continue managing the job.');
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    if (!mounted.current) return;
    await api.put('/mechanics/location', { latitude: position.coords.latitude, longitude: position.coords.longitude, jobId: selected.job._id, jobType: selected.kind });
  };
  const list = tab === 'sos' ? emergencies : jobs;
  return <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <View style={styles.header}><View><Text style={styles.eyebrow}>AUTO PRO · PARTNER</Text><Text style={styles.title}>Hello, {user.name}</Text></View><Button title="Sign out" secondary disabled={busy} onPress={onLogout} /></View>
    <Text style={styles.muted}>Your assignments and work status, connected to Auto Pro.</Text>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}{!!notice && <Text style={styles.notice}>{notice}</Text>}
    <Button title={busy ? 'Please wait…' : 'Refresh assignments'} secondary disabled={busy || loading} onPress={() => void run(refresh)} />
    {loading && <ActivityIndicator accessibilityLabel="Loading mechanic workspace" />}
    {loaded && !profile && <View style={styles.card}><Text style={styles.heading}>Set up your mechanic profile</Text><Text style={styles.muted}>An administrator will review your application before you can accept work.</Text><Field label="Specializations (comma separated)" value={specializations} onChangeText={setSpecializations} /><Field label="Years of experience" value={experience} onChangeText={setExperience} numeric /><Field label="License reference (optional)" value={license} onChangeText={setLicense} /><Button title="Submit for verification" disabled={busy} onPress={() => void run(async () => {
      const skills = specializations.split(',').map(value => value.trim()).filter(Boolean);
      const years = Number(experience);
      if (!skills.length || skills.some(value => value.length < 2) || !Number.isFinite(years) || years < 0) throw new Error('Enter your specializations and a valid experience value.');
      await mutate(() => api.post('/mechanics/onboard', { specializations: skills, experience: years, documents: license.trim() ? { license: license.trim() } : {} }));
    })} /></View>}
    {loaded && profile && <>
      <View style={styles.card}><Text style={styles.heading}>{profile.approvalStatus === 'APPROVED' ? (profile.isOnline ? 'On duty' : 'Off duty') : `Verification: ${profile.approvalStatus}`}</Text><Text style={styles.muted}>{profile.approvalStatus === 'APPROVED' ? 'Accept assigned work while on duty.' : 'Ask your administrator to review your profile. Refresh here after approval.'}</Text>{profile.approvalStatus === 'APPROVED' && <Button title={profile.isOnline ? 'Go off duty' : 'Go on duty'} disabled={busy} onPress={() => void run(() => mutate(() => api.put('/mechanics/availability', { isOnline: !profile.isOnline })))} />}</View>
      <View style={styles.tabs}>{(['jobs', 'sos', 'profile'] as const).map(key => <Button key={key} title={key === 'jobs' ? `Jobs (${jobs.length})` : key === 'sos' ? `SOS (${emergencies.length})` : 'Profile'} secondary={tab !== key} disabled={busy} onPress={() => { setTab(key); setSelected(null); }} />)}</View>
      {tab === 'profile' ? <View style={styles.card}><Text style={styles.heading}>Work summary</Text><Text>Completed service jobs: {profile.totalJobs}</Text><Text>Service value recorded: ₹{profile.totalEarnings.toLocaleString('en-IN')}</Text><Text style={styles.muted}>This is the backend service total, not a payout balance.</Text><Text>Rating: {profile.rating.toFixed(1)} / 5</Text><Text>Specializations: {profile.specializations.join(', ')}</Text></View> : selected ? <View style={styles.card}>
        <Button title="Back to assignments" secondary disabled={busy} onPress={() => setSelected(null)} /><Text style={styles.heading}>{selected.job.bookingNumber || selected.job.requestNumber}</Text><Text style={styles.badge}>{selected.job.status.replaceAll('_', ' ')}</Text>
        <Text>{selected.job.customerId?.name || 'Customer'} {selected.job.customerId?.phone || ''}</Text><Text>{[selected.job.vehicleId?.brand, selected.job.vehicleId?.model, selected.job.vehicleId?.registrationNumber].filter(Boolean).join(' · ')}</Text>
        <Text>{selected.job.address || [selected.job.addressId?.addressLine1, selected.job.addressId?.city, selected.job.addressId?.pincode].filter(Boolean).join(', ') || 'Address not supplied'}</Text>
        {!!selected.job.scheduledDate && <Text>Scheduled: {new Date(selected.job.scheduledDate).toLocaleDateString()} {selected.job.scheduledTime}</Text>}
        <Text>{selected.job.problemType?.replaceAll('_', ' ') || selected.job.serviceIds?.map(service => service.name).join(', ')}</Text><Text>Estimated service value: ₹{selected.job.estimatedPrice.toLocaleString('en-IN')}</Text>
        <Field label="Work notes / decline reason" value={notes} onChangeText={setNotes} multiline />
        {selected.job.status === 'ASSIGNED' ? <><Button title="Accept assignment" disabled={busy || !profile.isOnline} onPress={() => void run(() => mutate(() => updateJob(selected.kind, selected.job, 'accept', notes)))} />{selected.kind === 'booking' && <Button title="Decline assignment" secondary disabled={busy} onPress={() => void run(() => mutate(() => updateJob(selected.kind, selected.job, 'reject', notes)))} />}</> : nextStatus[selected.job.status] && <Button title={statusLabel[nextStatus[selected.job.status]]} disabled={busy} onPress={() => void run(() => mutate(() => updateJob(selected.kind, selected.job, nextStatus[selected.job.status], notes)))} />}
        {canShareLocation(selected.job.status) && <><Button title="Share current location once" secondary disabled={busy} onPress={() => void run(shareLocation, 'Current location shared for this job.')} /><Text style={styles.muted}>Only your current position is sent. No background tracking.</Text></>}
      </View> : <>{!list.length && <View style={styles.card}><Text style={styles.heading}>No {tab === 'sos' ? 'SOS requests' : 'jobs'} assigned</Text><Text style={styles.muted}>New assignments appear here after dispatch. Use Refresh to check.</Text></View>}{list.map(job => <TouchableOpacity key={job._id} accessibilityRole="button" disabled={busy} style={styles.card} onPress={() => { setSelected({ job, kind: tab === 'sos' ? 'emergency' : 'booking' }); setNotes(''); }}><Text style={styles.heading}>{job.bookingNumber || job.requestNumber || 'Assignment'}</Text><Text style={styles.badge}>{job.status.replaceAll('_', ' ')}</Text><Text>{job.customerId?.name || 'Customer'} · {job.vehicleId?.registrationNumber || 'Vehicle'}</Text><Text style={styles.link}>View assignment →</Text></TouchableOpacity>)}</>}
    </>}
  </ScrollView>;
}
