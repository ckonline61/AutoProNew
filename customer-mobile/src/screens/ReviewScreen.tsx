import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADII, SHADOWS } from '../theme';
import { Button, Card, Avatar } from '../components/ui';

interface ReviewScreenProps {
  navigation?: any;
  route?: {
    params?: {
      mechanicName?: string;
      serviceDate?: string;
      bookingId?: string;
    };
  };
}

const FEEDBACK_TAGS = [
  'Great Service',
  'Professional',
  'On Time',
  'Polite',
  'Good Knowledge',
  'Value for Money',
  'Clean Work',
  'Genuine Parts',
];

const RATING_LABELS: Record<number, string> = {
  1: 'Poor Experience',
  2: 'Could Be Better',
  3: 'Average Service',
  4: 'Very Good!',
  5: 'Excellent & Outstanding!',
};

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ route, navigation }) => {
  const mechanicName = route?.params?.mechanicName || 'Rajesh Sharma';
  const serviceDate = route?.params?.serviceDate || '15 Oct 2026';
  const bookingId = route?.params?.bookingId || 'BK-1001';

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Great Service', 'On Time']);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please tap a star to give an overall rating.');
      return;
    }

    setSubmitting(true);
    // Simulate API call for review submission
    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Review Submitted',
        'Thank you! Your feedback helps us maintain the highest service quality standards.',
        [
          {
            text: 'Done',
            onPress: () => {
              if (navigation?.goBack) navigation.goBack();
            },
          },
        ]
      );
    }, 600);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation?.goBack && navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Review</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mechanic Card */}
          <Card style={styles.mechanicCard} elevation="sm" border>
            <View style={styles.mechanicRow}>
              <Avatar
                name={mechanicName}
                size={54}
                backgroundColor={COLORS.primaryLight}
                textColor={COLORS.primary}
              />
              <View style={styles.mechanicInfo}>
                <View style={styles.rowAlign}>
                  <Text style={styles.mechanicName}>{mechanicName}</Text>
                  <Ionicons
                    name="shield-checkmark"
                    size={16}
                    color={COLORS.primary}
                    style={{ marginLeft: 6 }}
                  />
                </View>
                <Text style={styles.mechanicSubtitle}>Car Service Specialist • TVS Auto Pro</Text>
                <Text style={styles.serviceMetaText}>
                  Service completed on {serviceDate} • Ref #{bookingId.slice(-6).toUpperCase()}
                </Text>
              </View>
            </View>
          </Card>

          {/* Overall Rating Section */}
          <Card style={styles.ratingCard} elevation="sm" border>
            <Text style={styles.sectionHeading}>Overall Rating</Text>
            <Text style={styles.sectionSub}>How was your overall experience with the technician?</Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((starIndex) => {
                const isFilled = rating >= starIndex;
                return (
                  <TouchableOpacity
                    key={starIndex}
                    onPress={() => setRating(starIndex)}
                    style={styles.starTouchable}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isFilled ? 'star' : 'star-outline'}
                      size={36}
                      color={isFilled ? COLORS.starGold : COLORS.gray300}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.ratingLabel}>{RATING_LABELS[rating] || ''}</Text>
          </Card>

          {/* Tag Pills Multi-Select */}
          <View style={styles.tagsSection}>
            <Text style={styles.sectionHeading}>What did you like the most?</Text>
            <Text style={styles.sectionSub}>Select all highlights that apply</Text>

            <View style={styles.tagsContainer}>
              {FEEDBACK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <TouchableOpacity
                    key={tag}
                    style={[styles.tagPill, isSelected && styles.tagPillSelected]}
                    onPress={() => toggleTag(tag)}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={COLORS.white}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text style={[styles.tagPillText, isSelected && styles.tagPillTextSelected]}>
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.commentSection}>
            <View style={styles.commentHeaderRow}>
              <Text style={styles.sectionHeading}>Your Comments</Text>
              <Text style={styles.characterCount}>{comment.length}/500</Text>
            </View>
            <TextInput
              style={styles.commentInput}
              placeholder="Tell us what you loved, or what we can do better next time..."
              placeholderTextColor={COLORS.textMuted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
          </View>

          {/* Submit CTA */}
          <View style={styles.ctaContainer}>
            <Button
              title="Submit Review"
              variant="primary"
              size="lg"
              fullWidth
              loading={submitting}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  mechanicCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  mechanicRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mechanicInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mechanicName: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  mechanicSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  serviceMetaText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  ratingCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.md,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sectionHeading: {
    ...TYPOGRAPHY.h4,
    color: COLORS.textPrimary,
  },
  sectionSub: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  starTouchable: {
    padding: SPACING.xs,
  },
  ratingLabel: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  tagsSection: {
    marginBottom: SPACING.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADII.full,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tagPillText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  tagPillTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  commentSection: {
    marginBottom: SPACING.xl,
  },
  commentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  characterCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  commentInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.md,
    padding: SPACING.md,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    minHeight: 110,
    marginTop: SPACING.xs,
  },
  ctaContainer: {
    marginTop: SPACING.xs,
  },
});
