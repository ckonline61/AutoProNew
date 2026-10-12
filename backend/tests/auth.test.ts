import request from 'supertest';
import app from '../src/app';
import { authService } from '../src/services/auth.service';
import { User } from '../src/models/user.model';
import { UserRole } from '../src/types';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';
import { ConflictError, UnauthorizedError } from '../src/errors/app-error';

jest.mock('../src/services/auth.service');
jest.mock('../src/models/user.model');

describe('Auth Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/auth/register', () => {
    const validRegisterData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      password: 'Password123!',
    };

    it('should register a new customer successfully', async () => {
      const mockCreatedUser = {
        _id: '507f1f77bcf86cd799439011',
        name: validRegisterData.name,
        email: validRegisterData.email,
        phone: validRegisterData.phone,
        role: UserRole.CUSTOMER,
        isActive: true,
        isVerified: false,
      };

      (authService.register as jest.Mock).mockResolvedValue(mockCreatedUser);

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegisterData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(validRegisterData.email);
      expect(response.body.data.password).toBeUndefined();
    });

    it('should reject registration when validation fails (invalid email)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...validRegisterData,
          email: 'not-an-email',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration when password is too short', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          ...validRegisterData,
          password: '123',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate email registration with 409 Conflict', async () => {
      (authService.register as jest.Mock).mockRejectedValue(
        new ConflictError('A user with this email address already exists')
      );

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validRegisterData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('CONFLICT');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials and return tokens', async () => {
      const loginPayload = {
        email: 'john@example.com',
        password: 'Password123!',
      };

      const mockLoginResult = {
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
        user: {
          _id: '507f1f77bcf86cd799439011',
          name: 'John Doe',
          email: loginPayload.email,
          role: UserRole.CUSTOMER,
        },
      };

      (authService.login as jest.Mock).mockResolvedValue(mockLoginResult);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginPayload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.tokens.accessToken).toBe('mock-access-token');
      expect(response.body.data.tokens.refreshToken).toBe('mock-refresh-token');
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should reject login with wrong password (401 Unauthorized)', async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedError('Invalid email or password')
      );

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'john@example.com',
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject login with non-existent email (401 Unauthorized)', async () => {
      (authService.login as jest.Mock).mockRejectedValue(
        new UnauthorizedError('Invalid email or password')
      );

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject login with missing fields (422 Unprocessable Entity)', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
        });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      (authService.refreshToken as jest.Mock).mockResolvedValue({
        accessToken: 'new-access-token',
      });

      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: 'valid-refresh-token',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBe('new-access-token');
    });

    it('should reject refresh request with empty body', async () => {
      const response = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Protected Routes (GET /api/v1/auth/me & POST /api/v1/auth/logout)', () => {
    it('should return 401 for protected route without token', async () => {
      const response = await request(app).get('/api/v1/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 for expired or invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should access protected route with valid token', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: UserRole.CUSTOMER,
        isActive: true,
      };

      const token = jwt.sign(
        { userId: '507f1f77bcf86cd799439011', role: UserRole.CUSTOMER, email: 'jane@example.com' },
        config.jwt.secret || 'test-secret'
      );

      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('jane@example.com');
    });

    it('should successfully log out with valid token', async () => {
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Jane Doe',
        email: 'jane@example.com',
        role: UserRole.CUSTOMER,
        isActive: true,
      };

      const token = jwt.sign(
        { userId: '507f1f77bcf86cd799439011', role: UserRole.CUSTOMER, email: 'jane@example.com' },
        config.jwt.secret || 'test-secret'
      );

      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (authService.logout as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .send({ refreshToken: 'some-refresh-token' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logged out successfully');
    });
  });
});
