import { User } from '../models/user.model';
import { Booking } from '../models/booking.model';
import { Mechanic } from '../models/mechanic.model';
import { Order } from '../models/order.model';
import { Payment } from '../models/payment.model';
import { BookingStatus, PaymentStatus, MechanicApprovalStatus } from '../types';
import { NotFoundError } from '../errors/app-error';
import { getDatabaseStatus } from '../config/database';

export interface DashboardStats {
  totalUsers: number;
  totalMechanics: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenue: number;
  totalOrders: number;
  pendingMechanicApprovals: number;
}

export interface SystemHealth {
  database: ReturnType<typeof getDatabaseStatus>;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  timestamp: string;
}

export const adminService = {
  /**
   * Aggregate dashboard analytics and counts.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const activeBookingStatuses = [
      BookingStatus.CONFIRMED,
      BookingStatus.ASSIGNED,
      BookingStatus.ACCEPTED,
      BookingStatus.EN_ROUTE,
      BookingStatus.ARRIVED,
      BookingStatus.IN_PROGRESS,
    ];

    const [
      totalUsers,
      totalMechanics,
      totalBookings,
      activeBookings,
      totalOrders,
      pendingMechanicApprovals,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments(),
      Mechanic.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: activeBookingStatuses } }),
      Order.countDocuments(),
      Mechanic.countDocuments({ approvalStatus: MechanicApprovalStatus.PENDING }),
      Payment.aggregate([
        {
          $match: {
            status: { $in: [PaymentStatus.SUCCESS, PaymentStatus.COMPLETED] },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return {
      totalUsers,
      totalMechanics,
      totalBookings,
      activeBookings,
      totalRevenue,
      totalOrders,
      pendingMechanicApprovals,
    };
  },

  /**
   * Retrieve recent bookings with customer and mechanic details.
   */
  async getRecentBookings(limit: number = 10) {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('customerId', 'name email phone avatar')
      .populate('mechanicId', 'name email phone avatar')
      .lean();

    return bookings;
  },

  /**
   * Retrieve recent users.
   */
  async getRecentUsers(limit: number = 10) {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-password')
      .lean();

    return users;
  },

  /**
   * Admin view of any user by ID.
   */
  async getUserById(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  },

  /**
   * Update active status for a user.
   */
  async updateUserStatus(userId: string, isActive: boolean) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  },

  /**
   * System health status.
   */
  getSystemHealth(): SystemHealth {
    return {
      database: getDatabaseStatus(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  },
};
