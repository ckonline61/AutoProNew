import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { UserRole } from '../types';
import { config } from '../config';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';
import { TokenPayload } from '../services/auth.service';

/**
 * Middleware to authenticate requests via JWT Bearer token.
 * Extracts Bearer token from Authorization header, verifies JWT,
 * loads active user, and attaches user to the Express request.
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authentication token required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedError('Authentication token required');
    }

    let payload: TokenPayload;
    try {
      payload = jwt.verify(token, config.jwt.secret) as unknown as TokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired authentication token');
    }

    if (!payload || !payload.userId) {
      throw new UnauthorizedError('Invalid token payload');
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or account is deactivated');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to authorize requests based on user roles.
 * Verifies that the authenticated user's role is in the allowed roles list.
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User is not authenticated');
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      throw new ForbiddenError('You do not have permission to access this resource');
    }

    next();
  };
};
