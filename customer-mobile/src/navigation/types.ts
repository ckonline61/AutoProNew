import { NavigatorScreenParams } from '@react-navigation/native';
import { Service, Booking, Vehicle } from '../types';

// ── Auth Stack ──────────────────────────────────────────
export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
};

// ── Home Stack ──────────────────────────────────────────
export type HomeStackParamList = {
  HomeMain: undefined;
  ServiceDetail: { service: Service } | { serviceId: string; serviceName?: string; price?: number; description?: string };
  ServiceCategories: undefined;
  BookingForm: { serviceId: string; serviceName: string; price: number };
  BookingDetail: { bookingId: string; booking?: Booking };
  BookingConfirmation: { bookingId: string };
  PaymentCheckout: { bookingId: string; amount: number; serviceName: string };
  InvoiceDetail: { bookingId: string };
  LiveTracking: { bookingId: string; mechanicName?: string; mechanicRating?: number };
  Emergency: undefined;
};

// ── Bookings Stack ──────────────────────────────────────
export type BookingsStackParamList = {
  BookingsMain: undefined;
  BookingDetail: { bookingId: string; booking?: Booking };
  PaymentCheckout: { bookingId: string; amount: number; serviceName: string };
  InvoiceDetail: { bookingId: string };
  LiveTracking: { bookingId: string; mechanicName?: string; mechanicRating?: number };
  ReviewScreen: { mechanicName: string; serviceDate: string; bookingId: string };
};

// ── Marketplace Stack ───────────────────────────────────
export type MarketplaceStackParamList = {
  MarketplaceMain: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  UsedCarDetail: { carId: string };
  CarInspection: { carId: string };
  InspectionReport: { carId: string };
};

// ── Offers Stack ────────────────────────────────────────
export type OffersStackParamList = {
  OffersMain: undefined;
};

// ── Saved Stack ─────────────────────────────────────────
export type SavedStackParamList = {
  SavedMain: undefined;
};

// ── Profile Stack ───────────────────────────────────────
export type ProfileStackParamList = {
  ProfileMain: undefined;
  VehicleForm: { vehicle?: Vehicle; isEdit?: boolean } | undefined;
  Notifications: undefined;
  Addresses: undefined;
  Support: undefined;
  Account: undefined;
  ServiceHistory: undefined;
  ReviewScreen: { mechanicName: string; serviceDate: string; bookingId: string };
  SellCarForm: undefined;
  LiveTracking: { bookingId: string; mechanicName?: string; mechanicRating?: number };
};

// ── Main Tabs ───────────────────────────────────────────
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Bookings: NavigatorScreenParams<BookingsStackParamList>;
  Offers: NavigatorScreenParams<OffersStackParamList>;
  Saved: NavigatorScreenParams<SavedStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// ── Root ────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};
