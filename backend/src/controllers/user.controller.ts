import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { userService } from '../services/user.service';
import { UnauthorizedError } from '../errors/app-error';

export const userController = {
  /**
   * Get authenticated user profile.
   */
  getProfile: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const profile = await userService.getProfile(userId);
    res.status(200).json(apiResponse.success(profile, 'User profile retrieved successfully'));
  }),

  /**
   * Update authenticated user profile.
   */
  updateProfile: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const updatedProfile = await userService.updateProfile(userId, req.body);
    res.status(200).json(apiResponse.success(updatedProfile, 'User profile updated successfully'));
  }),

  /**
   * Change user password.
   */
  changePassword: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(userId, currentPassword, newPassword);
    res.status(200).json(apiResponse.success(null, 'Password changed successfully'));
  }),
  /**
   * Save push notification device token.
   */
  saveDeviceToken: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const { token } = req.body as { token: string };
    if (!token || typeof token !== 'string') {
      res.status(400).json(apiResponse.error('Token is required'));
      return;
    }

    await userService.saveDeviceToken(userId, token);
    res.status(200).json(apiResponse.success(null, 'Device token saved'));
  }),
};
