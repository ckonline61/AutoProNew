/**
 * Application-wide constants.
 */

/**
 * User roles in the system.
 */
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  MECHANIC = 'MECHANIC',
  INSPECTOR = 'INSPECTOR',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

/**
 * Application environments.
 */
export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

/**
 * Booking status workflow.
 */
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
  NO_SHOW = 'NO_SHOW',
}

/**
 * Emergency request problem types.
 */
export enum EmergencyType {
  JUMP_START = 'JUMP_START',
  BATTERY_PROBLEM = 'BATTERY_PROBLEM',
  FLAT_TYRE = 'FLAT_TYRE',
  TYRE_REPLACEMENT = 'TYRE_REPLACEMENT',
  FUEL_EMERGENCY = 'FUEL_EMERGENCY',
  BREAKDOWN = 'BREAKDOWN',
  ENGINE_PROBLEM = 'ENGINE_PROBLEM',
  ACCIDENT_ASSISTANCE = 'ACCIDENT_ASSISTANCE',
  TOWING = 'TOWING',
  OTHER = 'OTHER',
}

/**
 * Emergency request statuses.
 */
export enum EmergencyStatus {
  PENDING = 'PENDING',
  SEARCHING = 'SEARCHING',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

/**
 * Payment statuses.
 */
export enum PaymentStatus {
  CREATED = 'CREATED',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
}

/**
 * Payment methods.
 */
export enum PaymentMethod {
  CARD = 'CARD',
  NETBANKING = 'NETBANKING',
  UPI = 'UPI',
  WALLET = 'WALLET',
  EMI = 'EMI',
  CASH = 'CASH',
  RAZORPAY = 'RAZORPAY',
}

/**
 * Order statuses (spare parts).
 */
export enum OrderStatus {
  PLACED = 'PLACED',
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURNED = 'RETURNED',
  REFUNDED = 'REFUNDED',
}

/**
 * Car listing statuses.
 */
export enum ListingStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  PUBLISHED = 'PUBLISHED',
  SOLD = 'SOLD',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  REMOVED = 'REMOVED',
}

/**
 * Mechanic approval statuses.
 */
export enum MechanicApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

/**
 * Vehicle fuel types.
 */
export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  CNG = 'CNG',
  ELECTRIC = 'ELECTRIC',
  HYBRID = 'HYBRID',
}

/**
 * Emergency priority levels.
 */
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Notification types.
 */
export enum NotificationType {
  BOOKING = 'BOOKING',
  EMERGENCY = 'EMERGENCY',
  PAYMENT = 'PAYMENT',
  ORDER = 'ORDER',
  SYSTEM = 'SYSTEM',
}

/**
 * Audit log actions.
 */
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  SUSPEND = 'SUSPEND',
  ACTIVATE = 'ACTIVATE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}
