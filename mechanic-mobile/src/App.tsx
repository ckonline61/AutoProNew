import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { registerForPushNotifications, setupNotificationListeners } from './utils/pushNotifications';
import api from './config/api';

import { COLORS, SPACING } from './theme';
import type {
  AuthStackParamList,
  MainTabParamList,
  ProfileStackParamList,
} from './navigation/types';
import {
  canShareLocation,
  errorMessage,
  Job,
  JobKind,
  loadWorkspace,
  login,
  logout,
  MechanicUser,
  Profile,
  register,
  restoreSession,
  sendLocation,
  submitOnboarding,
  updateAvailability,
  updateJob,
} from './services/mechanic-api';
import { sessionEvents } from './services/session-events';

import {
  DashboardScreen,
  EarningsScreen,
  JobsScreen,
  LoginScreen,
  OnboardingScreen,
  ProfileScreen,
  RegisterScreen,
  SOSListScreen,
  SplashScreen,
} from './screens';

const Auth = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

export default function App() {
  // Auth state
  const [user, setUser] = useState<MechanicUser | null>(null);
  const [restoring, setRestoring] = useState(true);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');

  // Push notifications setup
  const cleanupPush = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    // Register push token
    registerForPushNotifications().then(async (token) => {
      if (token) {
        try {
          await api.post('/users/device-token', { token, platform: 'android' });
        } catch (e) {
          console.log('[Push] Token save failed:', e);
        }
      }
    });
    cleanupPush.current = setupNotificationListeners();
    return () => cleanupPush.current?.();
  }, []);

  // Workspace data state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [emergencies, setEmergencies] = useState<Job[]>([]);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceLoaded, setWorkspaceLoaded] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [selectedJob, setSelectedJob] = useState<{ job: Job; kind: JobKind } | null>(null);

  const mounted = useRef(true);
  const lock = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Subscribe to session expiration events
  useEffect(() => {
    const unsubscribe = sessionEvents.subscribe((event) => {
      if (event.type === 'expired') {
        setUser(null);
        setProfile(null);
        setJobs([]);
        setEmergencies([]);
        setWorkspaceLoaded(false);
        setAuthError('Your session has expired. Please sign in again.');
      }
    });
    return () => unsubscribe();
  }, []);

  // Restore session on launch
  const restore = useCallback(async () => {
    setRestoring(true);
    setAuthError('');
    try {
      const restoredUser = await restoreSession();
      if (mounted.current) {
        setUser(restoredUser);
      }
    } catch (err) {
      if (mounted.current) {
        setAuthError(errorMessage(err));
      }
    } finally {
      if (mounted.current) {
        setRestoring(false);
      }
    }
  }, []);

  useEffect(() => {
    void restore();
  }, [restore]);

  // Load workspace data when user is authenticated
  const refreshWorkspace = useCallback(async () => {
    if (!mounted.current) return;
    setWorkspaceLoading(true);
    setActionError('');
    try {
      const data = await loadWorkspace();
      if (!mounted.current) return;
      setProfile(data.profile);
      setJobs(data.jobs);
      setEmergencies(data.emergencies);
      setWorkspaceLoaded(true);

      setSelectedJob((prev) => {
        if (!prev) return null;
        const currentList = prev.kind === 'booking' ? data.jobs : data.emergencies;
        const found = currentList.find((item) => item._id === prev.job._id);
        return found ? { ...prev, job: found } : null;
      });
    } catch (err) {
      if (mounted.current) {
        setActionError(errorMessage(err));
      }
    } finally {
      if (mounted.current) {
        setWorkspaceLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      void refreshWorkspace();
    }
  }, [user, refreshWorkspace]);

  // Safe executor for mutations
  const runMutation = async (action: () => Promise<void>, successMessage = '') => {
    if (lock.current) return;
    lock.current = true;
    setActionBusy(true);
    setActionError('');
    try {
      await action();
      if (mounted.current && successMessage) {
        Alert.alert('Auto Pro', successMessage);
      }
    } catch (err) {
      const msg = errorMessage(err);
      if (mounted.current) {
        setActionError(msg);
        Alert.alert('Notice', msg);
      }
      throw err;
    } finally {
      lock.current = false;
      if (mounted.current) {
        setActionBusy(false);
      }
    }
  };

  // Auth operations
  const handleLogin = async (email: string, pass: string) => {
    if (authBusy) return;
    setAuthBusy(true);
    setAuthError('');
    setAuthNotice('');
    try {
      const loggedUser = await login(email, pass);
      setUser(loggedUser);
    } catch (err) {
      setAuthError(errorMessage(err));
    } finally {
      setAuthBusy(false);
    }
  };

  const handleRegister = async (name: string, email: string, phone: string, pass: string) => {
    if (authBusy) return;
    setAuthBusy(true);
    setAuthError('');
    setAuthNotice('');
    try {
      await register(name, email, phone, pass);
      setAuthNotice('Account created successfully! Please sign in to complete your profile.');
    } catch (err) {
      setAuthError(errorMessage(err));
      throw err;
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch {
      // Local credentials cleared regardless
    } finally {
      setUser(null);
      setProfile(null);
      setJobs([]);
      setEmergencies([]);
      setSelectedJob(null);
      setWorkspaceLoaded(false);
    }
  };

  // Workspace actions
  const handleToggleDuty = async () => {
    if (!profile) return;
    await runMutation(async () => {
      await updateAvailability(!profile.isOnline);
      await refreshWorkspace();
    }, profile.isOnline ? 'You are now off duty.' : 'You are now on duty and available for assignments.');
  };

  const handleUpdateJobStatus = async (action: string, notes: string) => {
    if (!selectedJob) return;
    await runMutation(async () => {
      await updateJob(selectedJob.kind, selectedJob.job, action, notes);
      await refreshWorkspace();
    }, 'Assignment updated successfully.');
  };

  const handleShareLocation = async () => {
    if (!selectedJob || !canShareLocation(selectedJob.job.status)) {
      Alert.alert('Location Sharing', 'Location is available only during an active journey.');
      return;
    }
    await runMutation(async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Location permission was denied. You can continue managing the job.');
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      await sendLocation(
        position.coords.latitude,
        position.coords.longitude,
        selectedJob.job._id,
        selectedJob.kind
      );
    }, 'Current location coordinates shared.');
  };

  const handleOnboardingSubmit = async (
    specializations: string,
    experience: string,
    license: string
  ) => {
    const skills = specializations
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const years = Number(experience);
    await runMutation(async () => {
      await submitOnboarding(skills, years, license);
      await refreshWorkspace();
    }, 'Profile submitted! An administrator will review your application within 24-48 hours.');
  };

  // Render Splash while restoring session
  if (restoring) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.root}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
          <SplashScreen />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Render Auth flow if unauthenticated
  if (!user) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.root}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
          <NavigationContainer>
            <Auth.Navigator
              initialRouteName="Login"
              screenOptions={{ headerShown: false }}
            >
              <Auth.Screen name="Login">
                {({ navigation }) => (
                  <LoginScreen
                    onLogin={handleLogin}
                    onNavigateRegister={() => navigation.navigate('Register')}
                    loading={authBusy}
                    error={authError}
                    notice={authNotice}
                  />
                )}
              </Auth.Screen>
              <Auth.Screen name="Register">
                {({ navigation }) => (
                  <RegisterScreen
                    onRegister={async (name, email, phone, pass) => {
                      await handleRegister(name, email, phone, pass);
                      navigation.navigate('Login');
                    }}
                    onNavigateLogin={() => navigation.navigate('Login')}
                    loading={authBusy}
                    error={authError}
                  />
                )}
              </Auth.Screen>
            </Auth.Navigator>
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show loading indicator while initial workspace data is loading
  if (!workspaceLoaded && workspaceLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.root}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading your mechanic workspace…</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show Onboarding screen if profile does not exist yet
  if (workspaceLoaded && !profile) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.root}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
          <OnboardingScreen
            onSubmit={handleOnboardingSubmit}
            loading={actionBusy}
            error={actionError}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Profile Stack Navigator (ProfileMain <-> Earnings)
  const ProfileStackNavigator = () => (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain">
        {({ navigation }) => (
          <ProfileScreen
            user={user}
            profile={profile}
            onLogout={handleSignOut}
            onNavigateEarnings={() => navigation.navigate('Earnings')}
          />
        )}
      </ProfileStack.Screen>
      <ProfileStack.Screen name="Earnings">
        {({ navigation }) => (
          <EarningsScreen
            profile={profile}
            onBack={() => navigation.goBack()}
          />
        )}
      </ProfileStack.Screen>
    </ProfileStack.Navigator>
  );

  // Main Flow: Bottom tabs with 4 tabs: Dashboard, Jobs, SOS, Profile
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
        <NavigationContainer>
          <Tab.Navigator
            initialRouteName="Dashboard"
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: COLORS.tabActive,
              tabBarInactiveTintColor: COLORS.tabInactive,
              tabBarStyle: styles.tabBar,
              tabBarLabelStyle: styles.tabBarLabel,
              tabBarIcon: ({ focused, color, size: _size }) => {
                let iconName: keyof typeof Ionicons.glyphMap = 'home';
                if (route.name === 'Dashboard') {
                  iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Jobs') {
                  iconName = focused ? 'briefcase' : 'briefcase-outline';
                } else if (route.name === 'SOS') {
                  iconName = focused ? 'flash' : 'flash-outline';
                } else if (route.name === 'Profile') {
                  iconName = focused ? 'person' : 'person-outline';
                }
                return <Ionicons name={iconName} size={22} color={color} />;
              },
            })}
          >
            {/* 1. Dashboard Tab */}
            <Tab.Screen
              name="Dashboard"
              options={{ tabBarLabel: 'Dashboard' }}
            >
              {({ navigation }) => (
                <DashboardScreen
                  user={user}
                  profile={profile}
                  jobs={jobs}
                  emergencies={emergencies}
                  loading={workspaceLoading}
                  busy={actionBusy}
                  onRefresh={refreshWorkspace}
                  onToggleDuty={handleToggleDuty}
                  onSelectJob={(job, kind) => {
                    setSelectedJob({ job, kind });
                    navigation.navigate('Jobs');
                  }}
                  onNavigateTab={(tabName) => navigation.navigate(tabName)}
                />
              )}
            </Tab.Screen>

            {/* 2. Jobs Tab */}
            <Tab.Screen
              name="Jobs"
              options={{
                tabBarLabel: 'Jobs',
                tabBarBadge: jobs.length > 0 ? jobs.length : undefined,
              }}
            >
              {() => (
                <JobsScreen
                  jobs={jobs}
                  selectedJob={selectedJob}
                  onSelectJob={(job, kind) => {
                    if (job && kind) {
                      setSelectedJob({ job, kind });
                    } else {
                      setSelectedJob(null);
                    }
                  }}
                  onUpdateJobStatus={handleUpdateJobStatus}
                  onShareLocation={handleShareLocation}
                  onRefresh={refreshWorkspace}
                  loading={workspaceLoading}
                  busy={actionBusy}
                  isOnline={profile?.isOnline ?? false}
                />
              )}
            </Tab.Screen>

            {/* 3. SOS Tab (red tint, flash icon) */}
            <Tab.Screen
              name="SOS"
              options={{
                tabBarLabel: 'SOS',
                tabBarActiveTintColor: COLORS.primary,
                tabBarBadge: emergencies.length > 0 ? emergencies.length : undefined,
                tabBarBadgeStyle: {
                  backgroundColor: COLORS.primary,
                  color: COLORS.white,
                },
              }}
            >
              {({ navigation }) => (
                <SOSListScreen
                  emergencies={emergencies}
                  onSelectSOS={(sos) => {
                    setSelectedJob({ job: sos, kind: 'emergency' });
                    navigation.navigate('Jobs');
                  }}
                  onRefresh={refreshWorkspace}
                  loading={workspaceLoading}
                />
              )}
            </Tab.Screen>

            {/* 4. Profile Tab */}
            <Tab.Screen
              name="Profile"
              component={ProfileStackNavigator}
              options={{ tabBarLabel: 'Profile' }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tabBar: {
    backgroundColor: COLORS.tabBarBg,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
