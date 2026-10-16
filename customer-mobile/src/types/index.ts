// Auto Pro Customer Mobile - Types & Interfaces

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  MECHANIC = 'MECHANIC',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type FuelType = 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC' | 'HYBRID';

export interface Vehicle {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  fuelType: FuelType;
  registrationNumber: string;
  color?: string;
  mileage?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Address {
  id: string;
  userId: string;
  title: string; // e.g. "Home", "Office"
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
}

export type ServiceCategoryType =
  | 'REGULAR_SERVICE'
  | 'AC_SERVICE'
  | 'DENTING_PAINTING'
  | 'BATTERY'
  | 'TYRES'
  | 'WINDSHIELD_LIGHTS'
  | 'DETAILING'
  | 'CLUTCH_FITMENTS'
  | 'BRAKES';

export interface ServiceCategory {
  id: string;
  name: string;
  code: ServiceCategoryType;
  icon: string;
  description: string;
  startingPrice: number;
}

export interface Service {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  description: string;
  price: number;
  estimatedDuration: string; // e.g. "2 hours"
  includedFeatures: string[];
  imageUrl?: string;
}

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'MECHANIC_ASSIGNED'
  | 'ASSIGNED' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'REJECTED' | 'FAILED' | 'NO_SHOW'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type ServiceType = 'DOORSTEP' | 'WORKSHOP';

export interface MechanicInfo {
  id: string;
  name: string;
  phone: string;
  rating: number;
  avatarUrl?: string;
}

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  serviceCategory?: string;
  vehicleId: string;
  vehicleDetails?: {
    brand: string;
    model: string;
    registrationNumber: string;
  };
  address?: Address;
  scheduledDate: string;
  scheduledTime: string;
  serviceType: ServiceType;
  status: BookingStatus;
  totalAmount: number;
  notes?: string;
  mechanic?: MechanicInfo;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING' | 'CASH';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string;
}

export type EmergencyProblemType =
  | 'JUMP_START'
  | 'FLAT_TYRE'
  | 'FUEL_DELIVERY'
  | 'BREAKDOWN'
  | 'TOWING';

export type EmergencyStatus =
  | 'REQUESTED'
  | 'DISPATCHED'
  | 'ARRIVED'
  | 'RESOLVED'
  | 'CANCELLED';

export interface EmergencyRequest {
  id: string;
  userId: string;
  problemType: EmergencyProblemType;
  description?: string;
  latitude: number;
  longitude: number;
  addressString?: string;
  status: EmergencyStatus;
  assignedMechanic?: MechanicInfo;
  estimatedArrivalMinutes?: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: 'BOOKING' | 'EMERGENCY' | 'MARKETPLACE' | 'GENERAL';
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  bookingId: string;
  serviceId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SparePart {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice?: number;
  stock: number;
  imageUrl: string;
  compatibility: string[];
  description: string;
}

export interface CartItem {
  unitPrice?: number;
  id: string;
  sparePartId: string;
  sparePart: SparePart;
  quantity: number;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  shippingAddress: Address;
  status: OrderStatus;
  createdAt: string;
}

export interface UsedCarListing {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: FuelType;
  transmission: 'MANUAL' | 'AUTOMATIC';
  ownersCount: number;
  location: string;
  imageUrl: string;
  verified: boolean;
  inspectionScore?: number;
  description?: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
}
