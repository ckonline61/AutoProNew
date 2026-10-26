import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { COLORS as CONST_COLORS } from '../constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../navigation/types';

// Required for expo-auth-session on Android
WebBrowser.maybeCompleteAuthSession();

// ⚠️ Replace with your actual Google OAuth Web Client ID from Google Cloud Console
const GOOGLE_WEB_CLIENT_ID = '403346240734-f0rit8p04e5jmq8uilf80ph0enp847jn.apps.googleusercontent.com';

const LOGO_IMAGE = require('../../assets/logo.jpg');
type Props = Partial<NativeStackScreenProps<AuthStackParamList, 'Login'>> & {
  navigation?: any;
};

type AuthMode = 'phone' | 'email' | 'whatsapp';

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, googleLogin, isLoading, enterPreview } = useAuth();
  const { config, isFeatureEnabled } = useConfig();
  const [authMode, setAuthMode] = useState<AuthMode>('phone');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Feature flags from remote config
  const showGoogleLogin = isFeatureEnabled('feature_google_signin');
  const showAppleLogin = isFeatureEnabled('feature_apple_signin');
  const showWhatsAppLogin = isFeatureEnabled('feature_whatsapp_login');
  const showEmailLogin = isFeatureEnabled('feature_email_login');
  const showPhoneLogin = isFeatureEnabled('feature_phone_login');

  // Check if any social login is visible
  const hasSocialLogin = showGoogleLogin || showAppleLogin || showWhatsAppLogin;

  // expo-auth-session Google provider
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri: makeRedirectUri({ scheme: 'com.autopro.customer' }),
  });

  // Handle Google OAuth response
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        setGoogleLoading(true);
        googleLogin(id_token).then((result) => {
          if (!result.success) {
            Alert.alert('Google Sign-In Failed', result.message || 'Please try again.');
          }
        }).finally(() => setGoogleLoading(false));
      }
    } else if (response?.type === 'error') {
      Alert.alert('Google Sign-In Error', response.error?.message || 'Something went wrong.');
    }
  }, [response]);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailErrors, setEmailErrors] = useState<{ email?: string; password?: string }>({});

  // Phone form state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Validate email login
  const validateEmailForm = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }

    setEmailErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEmailLogin = async () => {
    if (!validateEmailForm()) return;

    const result = await login(email.trim(), password);
    if (!result.success) {
      Alert.alert('Login Failed', result.message || 'Please check your credentials and try again.');
    }
  };

  // Validate phone login
  const handleSendOtp = () => {
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone) {
      setPhoneError('Please enter your mobile number');
      return;
    }
    if (cleanPhone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number');
      return;
    }

    setPhoneError('');
    setIsOtpSent(true);
    Alert.alert(
      'OTP Sent!',
      `A 6-digit verification code has been sent to +91 ${cleanPhone}.\n\n(For demo testing, enter: 123456)`,
      [{ text: 'OK' }]
    );
  };

  const handleVerifyOtp = () => {
    if (!otp.trim() || otp.trim().length < 6) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit verification code.');
      return;
    }

    // In demo / preview, enterPreview directly
    enterPreview();
  };

  const handleGoogleSignIn = async () => {
    if (!request) {
      Alert.alert('Not Ready', 'Google Sign-In is loading. Please try again in a moment.');
      return;
    }
    await promptAsync();
  };

  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
    if (provider === 'Google') {
      void handleGoogleSignIn();
      return;
    }
    // Apple Sign-In — future implementation
    Alert.alert(
      'Apple Sign-In',
      'Apple Sign-In coming soon! Please use Email or Google for now.',
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardContainer}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header: Auto Pro logo (red circle with white AP, 64px) */}
        <View style={styles.header}>
          <Image source={LOGO_IMAGE} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.brandTitle}>Auto Pro</Text>
        </View>

        {/* Two Mode Tabs: Phone vs Email */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              authMode === 'phone' ? styles.tabButtonActive : styles.tabButtonInactive,
            ]}
            onPress={() => {
              setAuthMode('phone');
              setPhoneError('');
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabButtonText,
                authMode === 'phone' ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
              ]}
            >
              Login with Phone
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              authMode === 'email' ? styles.tabButtonActive : styles.tabButtonInactive,
            ]}
            onPress={() => {
              setAuthMode('email');
              setEmailErrors({});
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabButtonText,
                authMode === 'email' ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
              ]}
            >
              Login with Email
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Body: Phone Mode */}
        {authMode === 'phone' && (
          <View style={styles.formContainer}>
            {!isOtpSent ? (
              <>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <View style={[styles.phoneInputRow, phoneError ? styles.inputErrorBorder : null]}>
                  {/* Country Code Selector */}
                  <TouchableOpacity style={styles.countryCodeSelector} activeOpacity={0.7}>
                    <Text style={styles.countryCodeText}>+91 🇮🇳</Text>
                    <Ionicons name="chevron-down" size={14} color={COLORS.gray500} />
                  </TouchableOpacity>

                  {/* Phone input field */}
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter mobile number"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text.replace(/[^0-9]/g, ''));
                      if (phoneError) setPhoneError('');
                    }}
                  />
                </View>
                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                {/* Red Send OTP Button */}
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSendOtp}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <View style={styles.buttonInnerRow}>
                    <Text style={styles.primaryButtonText}>Send OTP</Text>
                    <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.otpContainer}>
                <View style={styles.otpHeaderRow}>
                  <Text style={styles.inputLabel}>Enter Verification Code</Text>
                  <TouchableOpacity onPress={() => setIsOtpSent(false)}>
                    <Text style={styles.changePhoneLink}>Change Number</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.otpSubtitle}>
                  Sent to +91 {phone} (Demo OTP: 123456)
                </Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor={COLORS.gray400}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  autoFocus
                />

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleVerifyOtp}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <View style={styles.buttonInnerRow}>
                    <Text style={styles.primaryButtonText}>Verify & Proceed</Text>
                    <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Tab Body: WhatsApp Mode */}
        {authMode === 'whatsapp' && (
          <View style={styles.formContainer}>
            <View style={styles.whatsappHeaderBanner}>
              <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.whatsappHeaderTitle}>WhatsApp Login</Text>
                <Text style={styles.whatsappHeaderDesc}>OTP aapke WhatsApp number par aayega</Text>
              </View>
              <TouchableOpacity onPress={() => setAuthMode('phone')}>
                <Ionicons name="close-circle" size={24} color={COLORS.gray400} />
              </TouchableOpacity>
            </View>

            {!isOtpSent ? (
              <>
                <Text style={styles.inputLabel}>WhatsApp Number</Text>
                <View style={[styles.phoneInputRow, phoneError ? styles.inputErrorBorder : null]}>
                  <TouchableOpacity style={styles.countryCodeSelector} activeOpacity={0.7}>
                    <Text style={styles.countryCodeText}>+91 🇮🇳</Text>
                    <Ionicons name="chevron-down" size={14} color={COLORS.gray500} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="WhatsApp number enter karein"
                    placeholderTextColor={COLORS.gray400}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={(text) => {
                      setPhone(text.replace(/[^0-9]/g, ''));
                      if (phoneError) setPhoneError('');
                    }}
                  />
                </View>
                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                <TouchableOpacity
                  style={[styles.primaryButton, styles.whatsappPrimaryButton]}
                  onPress={() => {
                    const cleanPhone = phone.trim().replace(/\D/g, '');
                    if (!cleanPhone) { setPhoneError('WhatsApp number enter karein'); return; }
                    if (cleanPhone.length < 10) { setPhoneError('10-digit valid number enter karein'); return; }
                    setPhoneError('');
                    setIsOtpSent(true);
                    Alert.alert(
                      'WhatsApp OTP Sent! 💬',
                      `+91 ${cleanPhone} par WhatsApp message mein 6-digit OTP bheja gaya hai.\n\n(Demo testing ke liye OTP: 123456)`,
                      [{ text: 'OK' }]
                    );
                  }}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <View style={styles.buttonInnerRow}>
                    <Ionicons name="logo-whatsapp" size={18} color={COLORS.white} />
                    <Text style={styles.primaryButtonText}>Send WhatsApp OTP</Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.otpContainer}>
                <View style={styles.otpHeaderRow}>
                  <Text style={styles.inputLabel}>WhatsApp OTP Enter Karein</Text>
                  <TouchableOpacity onPress={() => setIsOtpSent(false)}>
                    <Text style={styles.changePhoneLink}>Change Number</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.otpSubtitle}>
                  WhatsApp par bheja gaya +91 {phone} (Demo OTP: 123456)
                </Text>
                <TextInput
                  style={[styles.input, styles.otpInput]}
                  placeholder="6-digit OTP"
                  placeholderTextColor={COLORS.gray400}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={setOtp}
                  autoFocus
                />

                <TouchableOpacity
                  style={[styles.primaryButton, styles.whatsappPrimaryButton]}
                  onPress={() => {
                    if (!otp.trim() || otp.trim().length < 6) {
                      Alert.alert('Invalid OTP', '6-digit OTP enter karein jo WhatsApp par aaya hai.');
                      return;
                    }
                    enterPreview();
                  }}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  <View style={styles.buttonInnerRow}>
                    <Text style={styles.primaryButtonText}>Verify & Login</Text>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Tab Body: Email Mode */}
        {authMode === 'email' && (
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={[styles.inputFieldRow, emailErrors.email ? styles.inputErrorBorder : null]}>
                <Ionicons name="mail-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInputField}
                  placeholder="name@example.com"
                  placeholderTextColor={COLORS.gray400}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailErrors.email) setEmailErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                />
              </View>
              {emailErrors.email ? <Text style={styles.errorText}>{emailErrors.email}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputFieldRow, emailErrors.password ? styles.inputErrorBorder : null]}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.gray400} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInputField}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.gray400}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (emailErrors.password) setEmailErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  style={styles.eyeIconButton}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.gray500}
                  />
                </TouchableOpacity>
              </View>
              {emailErrors.password ? <Text style={styles.errorText}>{emailErrors.password}</Text> : null}
            </View>

            {/* Red Sign In Button */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleEmailLogin}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <View style={styles.buttonInnerRow}>
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Divider with "OR CONTINUE WITH" — only if social logins visible */}
        {hasSocialLogin && (
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>
        )}

        {/* Social Login Buttons: conditionally rendered based on remote config */}
        {hasSocialLogin && (
        <View style={styles.socialButtonsRow}>
          {showGoogleLogin && (
          <TouchableOpacity
            style={[styles.socialButton, (!request || googleLoading) && styles.socialButtonDisabled]}
            onPress={() => handleSocialLogin('Google')}
            activeOpacity={0.8}
            disabled={!request || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator size="small" color="#EA4335" />
            ) : (
              <Ionicons name="logo-google" size={20} color="#EA4335" />
            )}
            <Text style={styles.socialButtonText}>
              {googleLoading ? 'Signing in...' : 'Google'}
            </Text>
          </TouchableOpacity>
          )}

          {showAppleLogin && (
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialLogin('Apple')}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-apple" size={22} color={COLORS.black} />
            <Text style={styles.socialButtonText}>Apple</Text>
          </TouchableOpacity>
          )}

          {showWhatsAppLogin && (
          <TouchableOpacity
            style={[styles.socialButton, styles.whatsappButton]}
            onPress={() => {
              setAuthMode('whatsapp');
              setIsOtpSent(false);
              setPhone('');
              setOtp('');
              setPhoneError('');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
            <Text style={styles.socialButtonText}>WhatsApp</Text>
          </TouchableOpacity>
          )}
        </View>
        )}

        {/* Register Navigation Prompt */}
        <View style={styles.registerRow}>
          <Text style={styles.registerPromptText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation?.navigate?.('Register')}>
            <Text style={styles.registerLink}>Register now</Text>
          </TouchableOpacity>
        </View>

        {/* Terms & Conditions Caption */}
        <Text style={styles.termsCaption}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsHighlight}>Terms & Conditions</Text> and{' '}
          <Text style={styles.termsHighlight}>Privacy Policy</Text>
        </Text>

        {/* DEV Preview Button styled as subtle text link */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.devPreviewLink}
            onPress={enterPreview}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons name="flash-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.devPreviewText}>Preview App (Skip Login with Sample Data)</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING['2xl'],
    backgroundColor: COLORS.white,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoImage: {
    width: 72,
    height: 72,
    marginBottom: SPACING.md,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.black,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: RADII.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tabButtonInactive: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: COLORS.white,
  },
  tabButtonTextInactive: {
    color: COLORS.textPrimary,
  },
  formContainer: {
    marginBottom: SPACING.lg,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs + 2,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    backgroundColor: COLORS.gray50,
    overflow: 'hidden',
    height: 52,
  },
  countryCodeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    height: '100%',
    backgroundColor: COLORS.gray100,
    gap: 4,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    fontSize: 15,
    color: COLORS.textPrimary,
    height: '100%',
  },
  inputFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  textInputField: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
    height: '100%',
  },
  eyeIconButton: {
    padding: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    height: 52,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputErrorBorder: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  buttonInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs + 2,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  otpContainer: {
    marginTop: SPACING.xs,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changePhoneLink: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  otpSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
    marginBottom: SPACING.sm,
  },
  otpInput: {
    letterSpacing: 4,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray500,
    letterSpacing: 1,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    backgroundColor: COLORS.white,
    gap: SPACING.sm,
  },
  socialButtonDisabled: {
    opacity: 0.6,
  },
  whatsappButton: {
    borderColor: '#25D366',
    backgroundColor: '#F0FFF4',
  },
  whatsappHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FFF4',
    borderWidth: 1,
    borderColor: '#25D366',
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  whatsappHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#128C7E',
  },
  whatsappHeaderDesc: {
    fontSize: 11,
    color: '#25D366',
    marginTop: 2,
  },
  whatsappPrimaryButton: {
    backgroundColor: '#25D366',
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  registerPromptText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  termsCaption: {
    fontSize: 11,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  termsHighlight: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  devPreviewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
  },
  devPreviewText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LoginScreen;
