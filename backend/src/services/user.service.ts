import bcryptjs from 'bcryptjs';
import { User } from '../models/user.model';
import { BadRequestError, ConflictError, NotFoundError } from '../errors/app-error';
import { SanitizedUser } from './auth.service';
import { UpdateProfileInput } from '../validators/user.validator';

export class UserService {
  /**
   * Helper to sanitize user object by removing sensitive fields.
   */
  private sanitizeUser(user: InstanceType<typeof User>): SanitizedUser {
    const userObj = user.toObject ? user.toObject() : { ...user };
    delete (userObj as Record<string, unknown>).password;
    delete (userObj as Record<string, unknown>).refreshTokens;
    return userObj as SanitizedUser;
  }

  /**
   * Find user by ID, return without password and sensitive fields.
   */
  public async getProfile(userId: string): Promise<SanitizedUser> {
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw new NotFoundError('User not found');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Update user's name, phone, or avatar.
   * Checks phone uniqueness if updating phone.
   */
  public async updateProfile(userId: string, data: UpdateProfileInput): Promise<SanitizedUser> {
    if (data.phone) {
      const existingPhone = await User.findOne({
        phone: data.phone,
        _id: { $ne: userId },
      });
      if (existingPhone) {
        throw new ConflictError('A user with this phone number already exists');
      }
    }

    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      throw new NotFoundError('User not found');
    }

    if (data.name !== undefined) {
      user.name = data.name;
    }
    if (data.phone !== undefined) {
      user.phone = data.phone;
    }
    if (data.avatar !== undefined) {
      user.avatar = data.avatar;
    }

    await user.save();

    return this.sanitizeUser(user);
  }

  /**
   * Verify current password, hash new password, and update.
   */
  public async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user || !user.isActive) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await bcryptjs.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect');
    }

    user.password = await bcryptjs.hash(newPassword, 10);
    await user.save();
  }

  /**
   * Save a push notification device token for the user.
   * Avoids duplicates. Keeps latest 5 tokens max.
   */
  public async saveDeviceToken(userId: string, token: string): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { deviceTokens: token },
      },
      { new: true }
    );
    // Keep max 5 tokens per user (trim oldest if exceeded)
    const user = await User.findById(userId);
    if (user && user.deviceTokens.length > 5) {
      user.deviceTokens = user.deviceTokens.slice(-5);
      await user.save();
    }
  }
}

export const userService = new UserService();
