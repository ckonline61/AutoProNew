import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { adminService } from '../services/admin.service';

export const adminController = {
  getDashboardStats: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const stats = await adminService.getDashboardStats();
    res.status(200).json(apiResponse.success(stats, 'Dashboard statistics retrieved successfully'));
  }),

  getRecentBookings: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const bookings = await adminService.getRecentBookings(limit);
    res.status(200).json(apiResponse.success(bookings, 'Recent bookings retrieved successfully'));
  }),

  getRecentUsers: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const users = await adminService.getRecentUsers(limit);
    res.status(200).json(apiResponse.success(users, 'Recent users retrieved successfully'));
  }),

  getUserById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await adminService.getUserById(req.params.id as string);
    res.status(200).json(apiResponse.success(user, 'User details retrieved successfully'));
  }),

  updateUserStatus: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { isActive } = req.body;
    const user = await adminService.updateUserStatus(req.params.id as string, isActive);
    res.status(200).json(apiResponse.success(user, 'User status updated successfully'));
  }),

  getSystemHealth: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const health = adminService.getSystemHealth();
    res.status(200).json(apiResponse.success(health, 'System health retrieved successfully'));
  }),
};
