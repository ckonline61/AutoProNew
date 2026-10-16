export type SessionEvent = { type: 'expired' } | { type: 'refreshed'; accessToken: string };
const listeners = new Set<(event: SessionEvent) => void>();
export const sessionEvents = {
  subscribe(listener: (event: SessionEvent) => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  emit(event: SessionEvent) { listeners.forEach(listener => listener(event)); },
};
