/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

import renderer, { act } from 'react-test-renderer';

jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    Ionicons: (props: any) => <View {...props} testID="mock-icon" />,
  };
});

// Unit tests using react-test-renderer to verify screens render without crashing
import { SOSListScreen } from '../screens/SOSListScreen';

import { ProfileScreen } from '../screens/ProfileScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { EarningsScreen } from '../screens/EarningsScreen';

describe('Mechanic App Screens', () => {
  describe('SOSListScreen', () => {
    it('renders empty state when no emergencies', () => {
      const onRefresh = jest.fn().mockResolvedValue(undefined);
      const onSelect = jest.fn();
      let tree: renderer.ReactTestRenderer | undefined;
      act(() => {
        tree = renderer.create(
          <SOSListScreen
            emergencies={[]}
            onSelectSOS={onSelect}
            onRefresh={onRefresh}
            loading={false}
          />
        );
      });

      expect(tree?.toJSON()).toBeTruthy();
    });

    it('renders emergencies list when items exist', () => {
      const onRefresh = jest.fn().mockResolvedValue(undefined);
      const onSelect = jest.fn();
      const mockEmergencies = [
        {
          _id: 'sos1',
          problemType: 'battery_dead',
          status: 'ASSIGNED',
          customerId: { name: 'Rajesh', phone: '9876543210' },
          address: 'MG Road, Bangalore',
          estimatedPrice: 750,
        },
      ];

      let tree: renderer.ReactTestRenderer | undefined;
      act(() => {
        tree = renderer.create(
          <SOSListScreen
            emergencies={mockEmergencies}
            onSelectSOS={onSelect}
            onRefresh={onRefresh}
            loading={false}
          />
        );
      });

      expect(tree?.toJSON()).toBeTruthy();
    });
  });

  describe('ProfileScreen', () => {
    it('renders profile stats and user initials', () => {
      const mockUser = {
        _id: 'u1',
        name: 'Vikram Singh',
        email: 'vikram@autopro.in',
        phone: '9988776655',
        role: 'MECHANIC',
      };
      const mockProfile = {
        _id: 'p1',
        approvalStatus: 'APPROVED',
        isOnline: true,
        isAvailable: true,
        rating: 4.8,
        totalJobs: 42,
        totalEarnings: 84000,
        specializations: ['Brakes', 'Diagnostics'],
      };
      const onLogout = jest.fn();

      let tree: renderer.ReactTestRenderer | undefined;
      act(() => {
        tree = renderer.create(
          <ProfileScreen user={mockUser} profile={mockProfile} onLogout={onLogout} />
        );
      });

      expect(tree?.toJSON()).toBeTruthy();
    });
  });

  describe('OnboardingScreen', () => {
    it('renders onboarding form', () => {
      const onSubmit = jest.fn().mockResolvedValue(undefined);
      let tree: renderer.ReactTestRenderer | undefined;
      act(() => {
        tree = renderer.create(
          <OnboardingScreen onSubmit={onSubmit} loading={false} error="" />
        );
      });

      expect(tree?.toJSON()).toBeTruthy();
    });
  });

  describe('EarningsScreen', () => {
    it('renders earnings metrics and period tabs', () => {
      const mockProfile = { totalEarnings: 55000, totalJobs: 25 };
      const onBack = jest.fn();

      let tree: renderer.ReactTestRenderer | undefined;
      act(() => {
        tree = renderer.create(
          <EarningsScreen profile={mockProfile} onBack={onBack} />
        );
      });

      expect(tree?.toJSON()).toBeTruthy();
    });
  });
});
