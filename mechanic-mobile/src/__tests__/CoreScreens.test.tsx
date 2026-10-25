import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { JobsListScreen } from '../screens/JobsListScreen';
import { JobDetailScreen } from '../screens/JobDetailScreen';

describe('Auto Pro Mechanic Core Screens', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders SplashScreen without crashing', () => {
    const onComplete = jest.fn();
    let tree: renderer.ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(<SplashScreen onComplete={onComplete} />);
    });
    act(() => {
      jest.advanceTimersByTime(2100);
    });
    expect(tree?.toJSON()).toBeTruthy();
    expect(onComplete).toHaveBeenCalled();
  });

  it('renders LoginScreen without crashing', () => {
    const onLogin = jest.fn().mockResolvedValue(undefined);
    const onNavigateRegister = jest.fn();
    let tree: renderer.ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(
        <LoginScreen
          onLogin={onLogin}
          onNavigateRegister={onNavigateRegister}
          loading={false}
          error=""
        />
      );
    });
    expect(tree?.toJSON()).toBeTruthy();
  });

  it('renders RegisterScreen without crashing', () => {
    const onRegister = jest.fn().mockResolvedValue(undefined);
    const onNavigateLogin = jest.fn();
    let tree: renderer.ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(
        <RegisterScreen
          onRegister={onRegister}
          onNavigateLogin={onNavigateLogin}
          loading={false}
          error=""
        />
      );
    });
    expect(tree?.toJSON()).toBeTruthy();
  });

  it('renders DashboardScreen without crashing', () => {
    const onToggleDuty = jest.fn().mockResolvedValue(undefined);
    const onNavigate = jest.fn();
    const mockProfile = {
      _id: 'm1',
      approvalStatus: 'APPROVED',
      isOnline: true,
      isAvailable: true,
      rating: 4.8,
      totalJobs: 24,
      totalEarnings: 36000,
      specializations: ['Brakes', 'Diagnostics'],
    };
    const mockJobs = [
      {
        _id: 'j1',
        status: 'ASSIGNED',
        bookingNumber: 'BK-1001',
        estimatedPrice: 1500,
        customerId: { name: 'John Doe', phone: '+91 9876543210' },
        vehicleId: { brand: 'Honda', model: 'City', registrationNumber: 'DL01AB1234' },
      },
    ];
    let tree: renderer.ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(
        <DashboardScreen
          profile={mockProfile}
          jobs={mockJobs}
          emergencies={[]}
          onToggleDuty={onToggleDuty}
          onNavigate={onNavigate}
        />
      );
    });
    expect(tree?.toJSON()).toBeTruthy();
  });

  it('renders JobsListScreen with active and empty states', () => {
    const onSelectJob = jest.fn();
    const onRefresh = jest.fn().mockResolvedValue(undefined);
    const mockJobs = [
      {
        _id: 'j1',
        status: 'ACCEPTED',
        bookingNumber: 'BK-1002',
        estimatedPrice: 2000,
        customerId: { name: 'Alice Smith', phone: '+91 9123456780' },
        vehicleId: { brand: 'Hyundai', model: 'Creta', registrationNumber: 'MH02XY9999' },
      },
    ];
    let tree: renderer.ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(
        <JobsListScreen
          jobs={mockJobs}
          onSelectJob={onSelectJob}
          onRefresh={onRefresh}
          loading={false}
        />
      );
    });
    expect(tree?.toJSON()).toBeTruthy();
  });

  it('renders JobDetailScreen with step timeline and action buttons', () => {
    const onAction = jest.fn().mockResolvedValue(undefined);
    const onBack = jest.fn();
    const onShareLocation = jest.fn().mockResolvedValue(undefined);
    const mockJob = {
      _id: 'j1',
      status: 'EN_ROUTE',
      bookingNumber: 'BK-1003',
      estimatedPrice: 3500,
      scheduledDate: '2026-10-20',
      scheduledTime: '10:00 AM',
      customerId: { name: 'Bob Roberts', phone: '+91 9998887776' },
      vehicleId: {
        brand: 'Maruti',
        model: 'Swift',
        year: 2022,
        registrationNumber: 'DL04CD5678',
        fuelType: 'Petrol',
      },
      address: 'Shop 12, Connaught Place, New Delhi',
    };
    let tree: renderer.ReactTestRenderer | undefined;
    act(() => {
      tree = renderer.create(
        <JobDetailScreen
          job={mockJob}
          kind="booking"
          onAction={onAction}
          onBack={onBack}
          onShareLocation={onShareLocation}
          busy={false}
        />
      );
    });
    expect(tree?.toJSON()).toBeTruthy();
  });
});
