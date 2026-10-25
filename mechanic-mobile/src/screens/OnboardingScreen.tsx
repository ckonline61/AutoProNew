import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADII, SHADOWS, SPACING } from '../theme';

export interface OnboardingScreenProps {
  onSubmit: (specializations: string, experience: string, license: string) => Promise<void>;
  loading: boolean;
  error: string;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onSubmit,
  loading,
  error,
}) => {
  const [specializations, setSpecializations] = useState('');
  const [experience, setExperience] = useState('');
  const [license, setLicense] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async () => {
    setLocalError('');
    const trimmedSpecs = specializations.trim();
    const expNum = Number(experience.trim());

    if (!trimmedSpecs) {
      setLocalError('Please enter at least one specialization.');
      return;
    }

    const skills = trimmedSpecs.split(',').map((s) => s.trim()).filter(Boolean);
    if (skills.length === 0 || skills.some((s) => s.length < 2)) {
      setLocalError('Please enter valid specialization names.');
      return;
    }

    if (experience.trim() === '' || isNaN(expNum) || expNum < 0) {
      setLocalError('Please enter a valid number of years of experience (0 or more).');
      return;
    }

    try {
      await onSubmit(specializations, experience, license);
    } catch {
      // Error handled by parent component error prop
    }
  };

  const activeError = localError || error;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Complete Your Profile</Text>
          <Text style={styles.headerSubtitle}>
            Step 1 of 1 · Professional Details
          </Text>
        </View>

        {/* Progress Bar (Step 1 of 1) */}
        <View style={styles.progressTrack}>
          <View style={styles.progressBar} />
        </View>

        {/* Illustration Area: Wrench Icon in large circle */}
        <View style={styles.illustrationWrapper}>
          <View style={styles.illustrationCircle}>
            <Ionicons name="construct" size={44} color={COLORS.primary} />
          </View>
        </View>

        {/* Heading & Subtitle */}
        <View style={styles.headingSection}>
          <Text style={styles.headingTitle}>Tell us about your expertise</Text>
          <Text style={styles.headingSubtitle}>
            Provide your automotive background so we can dispatch the right jobs and roadside assistance requests to you.
          </Text>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons
            name="information-circle"
            size={20}
            color={COLORS.primary}
            style={styles.infoIcon}
          />
          <Text style={styles.infoText}>
            Your profile will be reviewed within 24-48 hours by our partner onboarding team.
          </Text>
        </View>

        {/* Error Alert */}
        {activeError ? (
          <View style={styles.errorAlert}>
            <Ionicons
              name="alert-circle"
              size={18}
              color={COLORS.error}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.errorAlertText}>{activeError}</Text>
          </View>
        ) : null}

        {/* Form Fields */}
        <View style={styles.formCard}>
          {/* Specializations Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Specializations <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Engine, Brakes, Electrical, AC Service"
              placeholderTextColor={COLORS.textMuted}
              value={specializations}
              onChangeText={setSpecializations}
              autoCapitalize="words"
            />
            <Text style={styles.hintText}>
              Separate multiple skills with commas (e.g. Engine, Brakes, Transmission)
            </Text>
          </View>

          {/* Years of Experience Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Years of Experience <Text style={styles.requiredStar}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5"
              placeholderTextColor={COLORS.textMuted}
              value={experience}
              onChangeText={setExperience}
              keyboardType="numeric"
            />
            <Text style={styles.hintText}>
              Total years working in auto repair and mechanics
            </Text>
          </View>

          {/* License / Certificate Reference */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>License / Certificate Reference</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ITI Auto-Mechanic Cert # / DL No. (Optional)"
              placeholderTextColor={COLORS.textMuted}
              value={license}
              onChangeText={setLicense}
              autoCapitalize="characters"
            />
            <Text style={styles.hintText}>
              Government trade certification, ITI diploma, or commercial license
            </Text>
          </View>
        </View>

        {/* Red CTA Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },
  header: {
    marginBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.black,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  progressTrack: {
    height: 5,
    backgroundColor: COLORS.gray200,
    borderRadius: RADII.full,
    marginVertical: SPACING.md,
    overflow: 'hidden',
  },
  progressBar: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADII.full,
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  illustrationCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  headingSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  headingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 6,
  },
  headingSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primaryDark,
    lineHeight: 18,
    fontWeight: '600',
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: RADII.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  fieldGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  requiredStar: {
    color: COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.black,
  },
  hintText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: RADII.md,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
