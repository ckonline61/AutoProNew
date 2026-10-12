import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, authorize } from '../../src/middleware/auth';
import { User } from '../../src/models/user.model';
import { UserRole } from '../../src/types';
import { config } from '../../src/config';
import { AppError } from '../../src/errors/app-error';

jest.mock('../../src/models/user.model');

describe('Auth Middleware Unit Tests', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {};
    nextFunction = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticate middleware', () => {
    it('should return error when Authorization header is missing', async () => {
      mockReq.headers = {};

      await authenticate(mockReq as Request, mockRes as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledTimes(1);
      const error = nextFunction.mock.calls[0][0] as unknown as AppError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication token required');
    });

    it('should return error when Authorization header does not start with Bearer', async () => {
      mockReq.headers = {
        authorization: 'Basic 123456',
      };

      await authenticate(mockReq as Request, mockRes as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledTimes(1);
      const error = nextFunction.mock.calls[0][0] as unknown as AppError;
      expect(error.statusCode).toBe(401);
    });

    it('should return error when token is invalid', async () => {
      mockReq.headers = {
        authorization: 'Bearer invalid.token.value',
      };

      await authenticate(mockReq as Request, mockRes as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledTimes(1);
      const error = nextFunction.mock.calls[0][0] as unknown as AppError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Invalid or expired authentication token');
    });

    it('should return error when user is not found in database', async () => {
      const token = jwt.sign(
        { userId: '507f1f77bcf86cd799439011', role: UserRole.CUSTOMER, email: 'test@example.com' },
        config.jwt.secret || 'test-secret'
      );
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      (User.findById as jest.Mock).mockResolvedValue(null);

      await authenticate(mockReq as Request, mockRes as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledTimes(1);
      const error = nextFunction.mock.calls[0][0] as unknown as AppError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('User not found or account is deactivated');
    });

    it('should return error when user is inactive', async () => {
      const token = jwt.sign(
        { userId: '507f1f77bcf86cd799439011', role: UserRole.CUSTOMER, email: 'test@example.com' },
        config.jwt.secret || 'test-secret'
      );
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      (User.findById as jest.Mock).mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        isActive: false,
      });

      await authenticate(mockReq as Request, mockRes as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledTimes(1);
      const error = nextFunction.mock.calls[0][0] as unknown as AppError;
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('User not found or account is deactivated');
    });

    it('should attach user to req and call next() on valid token', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
        isActive: true,
      };

      const token = jwt.sign(
        { userId: '507f1f77bcf86cd799439011', role: UserRole.CUSTOMER, email: 'test@example.com' },
        config.jwt.secret || 'test-secret'
      );
      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(mockReq as Request, mockRes as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledWith();
      expect(mockReq.user).toEqual(mockUser);
    });
  });

  describe('authorize middleware', () => {
    it('should throw error when req.user is undefined', () => {
      mockReq.user = undefined;
      const middleware = authorize(UserRole.ADMIN);

      expect(() => {
        middleware(mockReq as Request, mockRes as Response, nextFunction);
      }).toThrow('User is not authenticated');
    });

    it('should throw error when user role does not match allowed roles', () => {
      mockReq.user = {
        role: UserRole.CUSTOMER,
      } as unknown as Request['user'];
      const middleware = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

      expect(() => {
        middleware(mockReq as Request, mockRes as Response, nextFunction);
      }).toThrow('You do not have permission to access this resource');
    });

    it('should call next() when user role matches allowed roles', () => {
      mockReq.user = {
        role: UserRole.ADMIN,
      } as unknown as Request['user'];
      const middleware = authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN);

      middleware(mockReq as Request, mockRes as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should call next() when no specific roles are required', () => {
      mockReq.user = {
        role: UserRole.CUSTOMER,
      } as unknown as Request['user'];
      const middleware = authorize();

      middleware(mockReq as Request, mockRes as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(nextFunction).toHaveBeenCalledWith();
    });
  });
});
