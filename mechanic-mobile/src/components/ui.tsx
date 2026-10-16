import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
export function Button({ title, onPress, disabled = false, secondary = false }: { title: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return <TouchableOpacity accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[styles.button, secondary && styles.secondary, disabled && styles.disabled]}><Text style={[styles.buttonText, secondary && styles.secondaryText]}>{title}</Text></TouchableOpacity>;
}
export function Field({ label, value, onChangeText, secure = false, numeric = false, multiline = false }: { label: string; value: string; onChangeText: (text: string) => void; secure?: boolean; numeric?: boolean; multiline?: boolean }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} secureTextEntry={secure} keyboardType={numeric ? 'numeric' : 'default'} autoCapitalize="none" multiline={multiline} style={styles.input} /></View>;
}
export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5F9' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  content: { padding: 24, gap: 16, width: '100%', maxWidth: 780, alignSelf: 'center' }, login: { paddingTop: 64 },
  header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  eyebrow: { color: '#15705C', fontSize: 12, fontWeight: '800', letterSpacing: 2 }, title: { fontSize: 30, fontWeight: '800', color: '#142B3B' },
  heading: { fontSize: 20, fontWeight: '700', color: '#142B3B' }, muted: { color: '#526574', fontSize: 14, lineHeight: 21 },
  card: { backgroundColor: '#FFF', padding: 22, borderRadius: 16, borderWidth: 1, borderColor: '#DFE6EC', gap: 14 },
  field: { gap: 8 }, label: { color: '#354C5A', fontWeight: '600' }, input: { borderWidth: 1, borderColor: '#CBD6DD', borderRadius: 8, padding: 13, fontSize: 16, backgroundColor: '#FFF' },
  button: { backgroundColor: '#15705C', borderRadius: 9, paddingHorizontal: 18, paddingVertical: 13, alignItems: 'center' }, buttonText: { color: '#FFF', fontWeight: '700' },
  secondary: { backgroundColor: '#E9F0F4' }, secondaryText: { color: '#263F50' }, disabled: { opacity: 0.5 }, tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { color: '#9A2334', backgroundColor: '#FEECEF', padding: 14, borderRadius: 8 }, notice: { color: '#126346', padding: 12, backgroundColor: '#E2F4EA', borderRadius: 8 },
  badge: { color: '#15705C', fontWeight: '700', fontSize: 12 }, link: { color: '#126B9A', fontWeight: '700' },
});
