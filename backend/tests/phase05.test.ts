import request from 'supertest';
import app from '../src/app';
import { userService } from '../src/services/user.service';
import { vehicleService } from '../src/services/vehicle.service';
import { addressService } from '../src/services/address.service';
import { User } from '../src/models/user.model';
import { FuelType, UserRole } from '../src/types';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

jest.mock('../src/services/user.service');
jest.mock('../src/services/vehicle.service');
jest.mock('../src/services/address.service');
jest.mock('../src/models/user.model');

describe('Phase 05 — Customer Profile + Vehicle + Address Routes', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockVehicleId = '507f1f77bcf86cd799439022';
  const mockAddressId = '507f1f77bcf86cd799439033';

  const mockUser = {
    _id: mockUserId,
    name: 'Test Customer',
    email: 'customer@example.com',
    role: UserRole.CUSTOMER,
    isActive: true,
  };

  let validToken: string;

  beforeEach(() => {
    jest.clearAllMocks();
    validToken = jwt.sign(
      { userId: mockUserId, email: mockUser.email, role: mockUser.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('User Profile Routes (/api/v1/users/profile)', () => {
    it('GET /api/v1/users/profile — should get user profile', async () => {
      (userService.getProfile as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(mockUser.email);
      expect(userService.getProfile).toHaveBeenCalledWith(mockUserId);
    });

    it('PUT /api/v1/users/profile — should update user profile', async () => {
      const updateData = { name: 'Updated Name', phone: '9876543210' };
      (userService.updateProfile as jest.Mock).mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const res = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${validToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Updated Name');
      expect(userService.updateProfile).toHaveBeenCalledWith(mockUserId, updateData);
    });

    it('PUT /api/v1/users/profile/password — should change password', async () => {
      (userService.changePassword as jest.Mock).mockResolvedValue(undefined);

      const res = await request(app)
        .put('/api/v1/users/profile/password')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          currentPassword: 'OldPassword123',
          newPassword: 'NewPassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(userService.changePassword).toHaveBeenCalledWith(
        mockUserId,
        'OldPassword123',
        'NewPassword123!'
      );
    });

    it('PUT /api/v1/users/profile/password — should validate password length', async () => {
      const res = await request(app)
        .put('/api/v1/users/profile/password')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          currentPassword: 'OldPassword123',
          newPassword: 'short',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Vehicle Routes (/api/v1/vehicles)', () => {
    const validVehicleData = {
      registrationNumber: 'MH12AB1234',
      brand: 'Honda',
      model: 'City',
      fuelType: FuelType.PETROL,
      year: 2022,
    };

    it('POST /api/v1/vehicles — should create vehicle', async () => {
      (vehicleService.create as jest.Mock).mockResolvedValue({
        _id: mockVehicleId,
        userId: mockUserId,
        ...validVehicleData,
        isActive: true,
      });

      const res = await request(app)
        .post('/api/v1/vehicles')
        .set('Authorization', `Bearer ${validToken}`)
        .send(validVehicleData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(vehicleService.create).toHaveBeenCalledWith(mockUserId, validVehicleData);
    });

    it('GET /api/v1/vehicles — should get all vehicles', async () => {
      (vehicleService.getAll as jest.Mock).mockResolvedValue([
        { _id: mockVehicleId, ...validVehicleData },
      ]);

      const res = await request(app)
        .get('/api/v1/vehicles')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(vehicleService.getAll).toHaveBeenCalledWith(mockUserId);
    });

    it('GET /api/v1/vehicles/:id — should get single vehicle', async () => {
      (vehicleService.getById as jest.Mock).mockResolvedValue({
        _id: mockVehicleId,
        ...validVehicleData,
      });

      const res = await request(app)
        .get(`/api/v1/vehicles/${mockVehicleId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(vehicleService.getById).toHaveBeenCalledWith(mockUserId, mockVehicleId);
    });

    it('PUT /api/v1/vehicles/:id — should update vehicle', async () => {
      (vehicleService.update as jest.Mock).mockResolvedValue({
        _id: mockVehicleId,
        ...validVehicleData,
        model: 'City ZX',
      });

      const res = await request(app)
        .put(`/api/v1/vehicles/${mockVehicleId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ model: 'City ZX' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(vehicleService.update).toHaveBeenCalledWith(mockUserId, mockVehicleId, {
        model: 'City ZX',
      });
    });

    it('DELETE /api/v1/vehicles/:id — should soft delete vehicle', async () => {
      (vehicleService.remove as jest.Mock).mockResolvedValue({
        _id: mockVehicleId,
        isActive: false,
      });

      const res = await request(app)
        .delete(`/api/v1/vehicles/${mockVehicleId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(vehicleService.remove).toHaveBeenCalledWith(mockUserId, mockVehicleId);
    });
  });

  describe('Address Routes (/api/v1/addresses)', () => {
    const validAddressData = {
      label: 'Home',
      addressLine1: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      isDefault: true,
    };

    it('POST /api/v1/addresses — should create address', async () => {
      (addressService.create as jest.Mock).mockResolvedValue({
        _id: mockAddressId,
        userId: mockUserId,
        ...validAddressData,
        isActive: true,
      });

      const res = await request(app)
        .post('/api/v1/addresses')
        .set('Authorization', `Bearer ${validToken}`)
        .send(validAddressData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(addressService.create).toHaveBeenCalledWith(mockUserId, validAddressData);
    });

    it('GET /api/v1/addresses — should get all addresses', async () => {
      (addressService.getAll as jest.Mock).mockResolvedValue([
        { _id: mockAddressId, ...validAddressData },
      ]);

      const res = await request(app)
        .get('/api/v1/addresses')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(addressService.getAll).toHaveBeenCalledWith(mockUserId);
    });

    it('GET /api/v1/addresses/:id — should get single address', async () => {
      (addressService.getById as jest.Mock).mockResolvedValue({
        _id: mockAddressId,
        ...validAddressData,
      });

      const res = await request(app)
        .get(`/api/v1/addresses/${mockAddressId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(addressService.getById).toHaveBeenCalledWith(mockUserId, mockAddressId);
    });

    it('PUT /api/v1/addresses/:id — should update address', async () => {
      (addressService.update as jest.Mock).mockResolvedValue({
        _id: mockAddressId,
        ...validAddressData,
        label: 'Work',
      });

      const res = await request(app)
        .put(`/api/v1/addresses/${mockAddressId}`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ label: 'Work' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(addressService.update).toHaveBeenCalledWith(mockUserId, mockAddressId, {
        label: 'Work',
      });
    });

    it('DELETE /api/v1/addresses/:id — should soft delete address', async () => {
      (addressService.remove as jest.Mock).mockResolvedValue({
        _id: mockAddressId,
        isActive: false,
      });

      const res = await request(app)
        .delete(`/api/v1/addresses/${mockAddressId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(addressService.remove).toHaveBeenCalledWith(mockUserId, mockAddressId);
    });
  });
});
