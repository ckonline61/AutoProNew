export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'USER' | 'MECHANIC' | 'ADMIN' | 'SUPPORT';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  email?: string;
  phone: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ACTIVE' | 'SUSPENDED';
  specializations: string[];
  rating: number;
  totalJobs: number;
  isAvailable?: boolean;
  hourlyRate?: number;
  documents?: {
    type: string;
    url: string;
    verified: boolean;
  }[];
  createdAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  category?: ServiceCategory;
  price: number;
  durationMinutes: number;
  status: 'ACTIVE' | 'INACTIVE';
  description?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  mechanicId?: string;
  mechanic?: {
    id: string;
    name: string;
    phone?: string;
  };
  serviceId?: string;
  service?: {
    id: string;
    name: string;
    price: number;
  };
  serviceName?: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  date: string;
  scheduledTime?: string;
  amount: number;
  vehicleDetails?: {
    make: string;
    model: string;
    year: number;
    licensePlate: string;
  };
  createdAt: string;
}

export interface Payment {
  id: string;
  paymentNumber?: string;
  bookingId?: string;
  bookingNumber?: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'STRIPE' | 'RAZORPAY' | 'CASH' | 'CARD' | 'UPI';
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalMechanics: number;
  activeBookings: number;
  totalRevenue: number;
  pendingApprovals: number;
  totalOrders: number;
  trends?: {
    users?: number;
    mechanics?: number;
    bookings?: number;
    revenue?: number;
  };
}

export interface SystemHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  uptimeSeconds: number;
  version: string;
  database: 'CONNECTED' | 'DISCONNECTED';
  redis: 'CONNECTED' | 'DISCONNECTED';
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  subject: string;
  category: 'BOOKING' | 'PAYMENT' | 'MECHANIC' | 'TECHNICAL' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  messages?: {
    id: string;
    senderId: string;
    senderRole: 'USER' | 'ADMIN' | 'SUPPORT';
    senderName: string;
    message: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface FeatureFlag {
  key: string;
  description: string;
  isEnabled: boolean;
  environment?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  category: 'LEGAL' | 'SUPPORT' | 'MARKETING' | 'BLOG';
  content?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppConfig {
  key: string;
  value: string | number | boolean | Record<string, unknown>;
  category: string;
  description?: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  itemsCount: number;
  createdAt: string;
}

export interface SparePart {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface UsedCarListing {
  id: string;
  title: string;
  sellerId: string;
  sellerName: string;
  price: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
  status: 'PENDING' | 'APPROVED' | 'SOLD' | 'REJECTED';
  createdAt: string;
}

export interface InspectionReport {
  id: string;
  reportNumber: string;
  vehicleVin: string;
  inspectorName: string;
  overallScore: number;
  status: 'PASSED' | 'FAILED' | 'PENDING';
  createdAt: string;
}

export interface Review {
  id: string;
  authorName: string;
  targetType: 'MECHANIC' | 'SERVICE' | 'APP';
  targetName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minSpend?: number;
  maxDiscount?: number;
  expiryDate: string;
  usageCount: number;
  usageLimit?: number;
  isActive: boolean;
}
