import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { authService } from '../services/auth.service';

export const authController = {
  /**
   * POST /api/v1/auth/google
   * Sign in or register using Google ID token.
   */
  googleSignIn: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { idToken } = req.body as { idToken?: string };
    if (!idToken || typeof idToken !== 'string') {
      res.status(400).json(apiResponse.error('Google ID token is required'));
      return;
    }
    const result = await authService.googleSignIn(idToken);
    const statusCode = result.isNewUser ? 201 : 200;
    res.status(statusCode).json(
      apiResponse.success(
        { tokens: result.tokens, user: result.user, isNewUser: result.isNewUser },
        result.isNewUser ? 'Google account registered successfully' : 'Google sign-in successful'
      )
    );
  }),

  /**
   * Register a new customer user.
   */
  register: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await authService.register(req.body);
    res.status(201).json(apiResponse.success(user, 'User registered successfully'));
  }),

  /**
   * Log in user with email and password.
   */
  login: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json(apiResponse.success(result, 'Login successful'));
  }),

  /**
   * Refresh access token using a valid refresh token.
   */
  refreshToken: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;
    const result = await authService.refreshToken(refreshToken);
    res.status(200).json(apiResponse.success(result, 'Token refreshed successfully'));
  }),

  /**
   * Logout user by invalidating their refresh token.
   */
  logout: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    const { refreshToken } = req.body || {};
    await authService.logout(userId, refreshToken);
    res.status(200).json(apiResponse.success(null, 'Logged out successfully'));
  }),

  /**
   * Get current authenticated user profile.
   */
  getMe: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = req.user;
    const userObj = user && typeof (user as { toObject?: () => Record<string, unknown> }).toObject === 'function'
      ? (user as { toObject: () => Record<string, unknown> }).toObject()
      : { ...(user as unknown as Record<string, unknown>) };

    delete (userObj as Record<string, unknown>).password;
    delete (userObj as Record<string, unknown>).refreshTokens;

    res.status(200).json(apiResponse.success(userObj, 'Current user retrieved successfully'));
  }),
};
