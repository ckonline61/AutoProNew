import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import { BookingStatus } from '../types';

interface StatusTimelineProps {
  currentStatus: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
}

interface Step {
  key: BookingStatus;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { key: 'PENDING', title: 'Booking Placed', description: 'Your service request has been received' },
  { key: 'CONFIRMED', title: 'Booking Confirmed', description: 'Schedule and slot confirmed by workshop' },
  { key: 'MECHANIC_ASSIGNED', title: 'Mechanic Assigned', description: 'A certified specialist is assigned' },
  { key: 'IN_PROGRESS', title: 'Service In Progress', description: 'Inspection and maintenance underway' },
  { key: 'COMPLETED', title: 'Service Completed', description: 'Quality inspection passed and car ready' },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ currentStatus }) => {
  if (currentStatus === 'CANCELLED') {
    return (
      <View style={styles.cancelledBox}>
        <Text style={styles.cancelledTitle}>❌ Booking Cancelled</Text>
        <Text style={styles.cancelledSubtitle}>This booking was cancelled. Please re-book if you need service.</Text>
      </View>
    );
  }

  const displayStatus = ['ASSIGNED','ACCEPTED','EN_ROUTE','ARRIVED'].includes(currentStatus) ? 'MECHANIC_ASSIGNED' : currentStatus;
  if (['REJECTED','FAILED','NO_SHOW'].includes(currentStatus)) return <Text style={{ color: COLORS.emergency }}>Booking status: {currentStatus.replace(/_/g, ' ')}</Text>;
  const orderIndex = STEPS.findIndex((s) => s.key === displayStatus);
  const activeIndex = orderIndex === -1 ? 0 : orderIndex;

  return (
    <View style={styles.container}>
      {STEPS.map((step, index) => {
        const isDone = index < activeIndex;
        const isCurrent = index === activeIndex;
        const isPending = index > activeIndex;

        return (
          <View key={step.key} style={styles.stepRow}>
            <View style={styles.indicatorColumn}>
              <View
                style={[
                  styles.circle,
                  isDone && styles.circleDone,
                  isCurrent && styles.circleCurrent,
                  isPending && styles.circlePending,
                ]}
              >
                {isDone ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : isCurrent ? (
                  <View style={styles.innerDot} />
                ) : (
                  <Text style={styles.stepNum}>{index + 1}</Text>
                )}
              </View>
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.connectorLine,
                    isDone ? styles.lineDone : styles.linePending,
                  ]}
                />
              )}
            </View>

            <View style={styles.contentColumn}>
              <Text
                style={[
                  styles.stepTitle,
                  isCurrent && styles.stepTitleCurrent,
                  isDone && styles.stepTitleDone,
                ]}
              >
                {step.title}
              </Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  indicatorColumn: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  circleDone: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success,
  },
  circleCurrent: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  circlePending: {
    borderColor: COLORS.gray300,
    backgroundColor: '#FFFFFF',
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  stepNum: {
    color: COLORS.gray400,
    fontSize: 12,
    fontWeight: '600',
  },
  connectorLine: {
    width: 2,
    minHeight: 28,
    flex: 1,
    marginVertical: 4,
  },
  lineDone: {
    backgroundColor: COLORS.success,
  },
  linePending: {
    backgroundColor: COLORS.gray200,
  },
  contentColumn: {
    flex: 1,
    paddingTop: 3,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray500,
    marginBottom: 2,
  },
  stepTitleCurrent: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  stepTitleDone: {
    color: COLORS.text,
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  cancelledBox: {
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginVertical: 8,
  },
  cancelledTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.emergency,
    marginBottom: 4,
  },
  cancelledSubtitle: {
    fontSize: 13,
    color: '#7F1D1D',
  },
});
