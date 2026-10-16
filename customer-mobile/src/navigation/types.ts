import { NavigatorScreenParams } from '@react-navigation/native';
import { Service, Booking, Vehicle } from '../types';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  ServiceDetail: { service: Service } | { serviceId: string; serviceName?: string; price?: number; description?: string };
  BookingForm: { serviceId: string; serviceName: string; price: number };
  BookingDetail: { bookingId: string; booking?: Booking };
  Emergency: undefined;
};

export type BookingsStackParamList = {
  BookingsMain: undefined;
  BookingDetail: { bookingId: string; booking?: Booking };
};

export type MarketplaceStackParamList = {
  MarketplaceMain: undefined;
  Cart: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  VehicleForm: { vehicle?: Vehicle; isEdit?: boolean } | undefined;
  Notifications: undefined;
  Addresses: undefined;
  Support: undefined;
  Account: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Bookings: NavigatorScreenParams<BookingsStackParamList>;
  Marketplace: NavigatorScreenParams<MarketplaceStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
