import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Button, Field, styles } from './components/ui';
import { Workspace } from './screens/Workspace';
import { sessionEvents } from './services/session-events';
import { errorMessage, login, logout, MechanicUser, register, restoreSession } from './services/mechanic-api';

function MechanicApp() {
  const [user, setUser] = useState<MechanicUser | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState(''); const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  useEffect(() => sessionEvents.subscribe(event => { if (event.type === 'expired') { setUser(null); setError('Your session expired. Please sign in again.'); } }), []);
  const restore = async () => {
    setRestoring(true); setError('');
    try { setUser(await restoreSession()); } catch (err) { setError(errorMessage(err)); }
    finally { setRestoring(false); }
  };
  useEffect(() => { void restore(); }, []);
  const signOut = async () => { try { await logout(); } catch { /* Local credentials are cleared even if revocation is unavailable. */ } finally { setUser(null); setPassword(''); } };
  const submit = async () => {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      if (signup) { await register(name, email, phone, password); setSignup(false); setNotice('Account created. Sign in to submit your mechanic profile.'); }
      else { setUser(await login(email, password)); setPassword(''); }
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  };
  if (restoring) return <View style={styles.center}><ActivityIndicator /><Text>Restoring your session…</Text></View>;
  if (user) return <Workspace user={user} onLogout={() => void signOut()} />;
  return <ScrollView contentContainerStyle={[styles.content, styles.login]} keyboardShouldPersistTaps="handled">
    <Text style={styles.eyebrow}>AUTO PRO · PARTNER</Text><Text style={styles.title}>{signup ? 'Join as a mechanic' : 'Ready for your next job?'}</Text><Text style={styles.muted}>Sign in to manage service jobs and roadside assistance.</Text>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}{!!notice && <Text style={styles.notice}>{notice}</Text>}
    <View style={styles.card}>{signup && <><Field label="Full name" value={name} onChangeText={setName} /><Field label="Phone" value={phone} onChangeText={setPhone} /></>}<Field label="Email" value={email} onChangeText={setEmail} /><Field label="Password" value={password} onChangeText={setPassword} secure />
      <Button title={busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'} disabled={busy} onPress={() => void submit()} />
      <Button title={signup ? 'Already have an account? Sign in' : 'Create a mechanic account'} secondary disabled={busy} onPress={() => { setSignup(!signup); setError(''); setNotice(''); }} />
    </View><Button title="Retry saved session" secondary disabled={busy} onPress={() => void restore()} />
  </ScrollView>;
}
export default function App() {
  return <SafeAreaProvider><SafeAreaView style={styles.root}><StatusBar barStyle="dark-content" /><MechanicApp /></SafeAreaView></SafeAreaProvider>;
}
