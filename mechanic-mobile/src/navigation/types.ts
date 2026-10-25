import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Job, JobKind } from '../services/mechanic-api';

// ── Auth Stack ──────────────────────────────────────────
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
};

// ── Jobs Stack ──────────────────────────────────────────
export type JobsStackParamList = {
  JobsList: undefined;
  JobDetail: { job: Job; kind: JobKind };
};

// ── Profile Stack ───────────────────────────────────────
export type ProfileStackParamList = {
  ProfileMain: undefined;
  Earnings: undefined;
  Onboarding: undefined;
};

// ── Main Tab ────────────────────────────────────────────
export type MainTabParamList = {
  Dashboard: undefined;
  Jobs: undefined;
  SOS: undefined;
  Profile: undefined;
};

// ── Root Stack ──────────────────────────────────────────
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Earnings: undefined;
  Onboarding: undefined;
};
