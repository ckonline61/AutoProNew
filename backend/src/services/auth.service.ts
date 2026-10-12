import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { UserRole } from '../types';
import { config } from '../config';
import { ConflictError, UnauthorizedError, AppError } from '../errors/app-error';
import { logger } from '../utils/logger';
import { RegisterInput } from '../validators/auth.validator';

export interface TokenPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface SanitizedUser {
  id?: string;
  _id?: unknown;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isVerified: boolean;
  deviceTokens: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class AuthService {
  /**
   * Hashes a plain text password using bcryptjs.
   */
  public async hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, 10);
  }

  /**
   * Compares a plain text password against a hash.
   */
  public async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }

  /**
   * Generates a signed JWT access token.
   */
  public generateAccessToken(user: { _id?: unknown; id?: string; role: UserRole; email: string }): string {
    const userId = user._id ? user._id.toString() : user.id || '';
    const payload: TokenPayload = {
      userId,
      role: user.role,
      email: user.email,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Generates a signed JWT refresh token.
   */
  public generateRefreshToken(user: { _id?: unknown; id?: string }): string {
    const userId = user._id ? user._id.toString() : user.id || '';
    const payload: RefreshTokenPayload = {
      userId,
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  /**
   * Registers a new customer user.
   */
  public async register(data: RegisterInput): Promise<SanitizedUser> {
    // Check if user with this email already exists
    const existingEmail = await User.findOne({ email: data.email });
    if (existingEmail) {
      throw new ConflictError('A user with this email address already exists');
    }

    // Check if user with this phone number already exists
    const existingPhone = await User.findOne({ phone: data.phone });
    if (existingPhone) {
      throw new ConflictError('A user with this phone number already exists');
    }

    // Hash the password with 10 salt rounds
    const hashedPassword = await this.hashPassword(data.password);

    // Create the customer user
    const newUser = await User.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashedPassword,
      role: UserRole.CUSTOMER,
      isActive: true,
      isVerified: false,
      deviceTokens: [],
      refreshTokens: [],
    });

    logger.info(`New user registered successfully: ${newUser._id}`);

    // Return sanitized user without password
    const userObj = newUser.toObject ? newUser.toObject() : { ...newUser };
    delete (userObj as Record<string, unknown>).password;
    delete (userObj as Record<string, unknown>).refreshTokens;

    return userObj as SanitizedUser;
  }

  /**
   * Authenticates a user by email and password, returning tokens and user details.
   */
  public async login(
    email: string,
    password: string
  ): Promise<{ tokens: AuthTokens; user: SanitizedUser }> {
    // Find user including select: false password and refreshTokens
    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account has been deactivated');
    }

    const isMatch = await this.comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Update lastLogin and add refresh token
    user.lastLogin = new Date();
    if (!user.refreshTokens) {
      user.refreshTokens = [];
    }
    user.refreshTokens.push(refreshToken);
    await user.save();

    logger.info(`User logged in successfully: ${user._id}`);

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete (userObj as Record<string, unknown>).password;
    delete (userObj as Record<string, unknown>).refreshTokens;

    return {
      tokens: {
        accessToken,
        refreshToken,
      },
      user: userObj as SanitizedUser,
    };
  }

  /**
   * Verifies a refresh token and produces a new access token.
   */
  public async refreshToken(token: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as unknown as RefreshTokenPayload;
      if (!decoded || !decoded.userId) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const user = await User.findById(decoded.userId).select('+refreshTokens');
      if (!user || !user.isActive) {
        throw new UnauthorizedError('User not found or account is deactivated');
      }

      // Check if the refresh token is stored in the user's active tokens
      if (user.refreshTokens && user.refreshTokens.length > 0 && !user.refreshTokens.includes(token)) {
        throw new UnauthorizedError('Invalid or revoked refresh token');
      }

      const accessToken = this.generateAccessToken(user);
      return { accessToken };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Logs out user by removing the refresh token from their stored tokens.
   */
  public async logout(userId?: string, refreshToken?: string): Promise<void> {
    if (!userId) {
      return;
    }

    if (refreshToken) {
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: refreshToken },
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        $set: { refreshTokens: [] },
      });
    }

    logger.info(`User logged out successfully: ${userId}`);
  }
}

export const authService = new AuthService();
