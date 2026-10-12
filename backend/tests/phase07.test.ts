import request from 'supertest';
import app from '../src/app';
import { mechanicService } from '../src/services/mechanic.service';
import { User } from '../src/models/user.model';
import { BookingStatus, MechanicApprovalStatus, UserRole } from '../src/types';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

jest.mock('../src/services/mechanic.service');
jest.mock('../src/models/user.model');

describe('Phase 07 — Mechanic Management & Job Dispatch', () => {
  const mockMechanicUserId = '507f1f77bcf86cd799439011';
  const mockAdminUserId = '507f1f77bcf86cd799439099';
  const mockMechanicId = '507f1f77bcf86cd799439022';
  const mockBookingId = '507f1f77bcf86cd799439033';

  const mockMechanicUser = {
    _id: mockMechanicUserId,
    name: 'Mechanic Ramesh',
    email: 'ramesh@example.com',
    role: UserRole.MECHANIC,
    isActive: true,
  };

  const mockAdminUser = {
    _id: mockAdminUserId,
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    isActive: true,
  };

  let mechanicToken: string;
  let adminToken: string;

  beforeEach(() => {
    jest.clearAllMocks();

    mechanicToken = jwt.sign(
      { userId: mockMechanicUserId, email: mockMechanicUser.email, role: mockMechanicUser.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    adminToken = jwt.sign(
      { userId: mockAdminUserId, email: mockAdminUser.email, role: mockAdminUser.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    (User.findById as jest.Mock).mockImplementation((id: string) => {
      if (id === mockMechanicUserId) return Promise.resolve(mockMechanicUser);
      if (id === mockAdminUserId) return Promise.resolve(mockAdminUser);
      return Promise.resolve(null);
    });
  });

  describe('Mechanic Onboarding & Profile', () => {
    it('POST /api/v1/mechanics/onboard — should onboard new mechanic', async () => {
      const onboardData = {
        specializations: ['Brake Service', 'Engine Diagnostics'],
        experience: 5,
        documents: { license: 'DL-12345' },
      };

      (mechanicService.onboard as jest.Mock).mockResolvedValue({
        _id: mockMechanicId,
        userId: mockMechanicUserId,
        ...onboardData,
        approvalStatus: MechanicApprovalStatus.PENDING,
        isApproved: false,
      });

      const res = await request(app)
        .post('/api/v1/mechanics/onboard')
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send(onboardData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(mechanicService.onboard).toHaveBeenCalledWith(
        mockMechanicUserId,
        expect.objectContaining(onboardData)
      );
    });

    it('GET /api/v1/mechanics/profile — should get mechanic profile', async () => {
      (mechanicService.getProfile as jest.Mock).mockResolvedValue({
        _id: mockMechanicId,
        userId: mockMechanicUserId,
        approvalStatus: MechanicApprovalStatus.APPROVED,
        isApproved: true,
      });

      const res = await request(app)
        .get('/api/v1/mechanics/profile')
        .set('Authorization', `Bearer ${mechanicToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mechanicService.getProfile).toHaveBeenCalledWith(mockMechanicUserId);
    });
  });

  describe('Mechanic Availability & Location', () => {
    it('PUT /api/v1/mechanics/availability — should toggle online status', async () => {
      (mechanicService.updateAvailability as jest.Mock).mockResolvedValue({
        _id: mockMechanicId,
        isOnline: true,
        isAvailable: true,
      });

      const res = await request(app)
        .put('/api/v1/mechanics/availability')
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ isOnline: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mechanicService.updateAvailability).toHaveBeenCalledWith(mockMechanicUserId, {
        isOnline: true,
      });
    });

    it('PUT /api/v1/mechanics/location — should update GPS coordinates', async () => {
      (mechanicService.updateLocation as jest.Mock).mockResolvedValue({
        _id: mockMechanicId,
        currentLocation: { latitude: 19.076, longitude: 72.8777 },
      });

      const res = await request(app)
        .put('/api/v1/mechanics/location')
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ latitude: 19.076, longitude: 72.8777 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mechanicService.updateLocation).toHaveBeenCalledWith(mockMechanicUserId, {
        latitude: 19.076,
        longitude: 72.8777,
      });
    });
  });

  describe('Admin Verification Workflow', () => {
    it('PUT /api/v1/mechanics/:id/verify — admin can approve mechanic', async () => {
      (mechanicService.verifyMechanic as jest.Mock).mockResolvedValue({
        _id: mockMechanicId,
        approvalStatus: MechanicApprovalStatus.APPROVED,
        isApproved: true,
      });

      const res = await request(app)
        .put(`/api/v1/mechanics/${mockMechanicId}/verify`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approvalStatus: MechanicApprovalStatus.APPROVED });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mechanicService.verifyMechanic).toHaveBeenCalledWith(
        mockMechanicId,
        MechanicApprovalStatus.APPROVED
      );
    });

    it('PUT /api/v1/mechanics/:id/verify — should reject non-admin users with 403', async () => {
      const res = await request(app)
        .put(`/api/v1/mechanics/${mockMechanicId}/verify`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ approvalStatus: MechanicApprovalStatus.APPROVED });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Job Dispatch & Execution', () => {
    it('GET /api/v1/mechanics/jobs — should list assigned jobs', async () => {
      (mechanicService.getAssignedJobs as jest.Mock).mockResolvedValue([
        { _id: mockBookingId, status: BookingStatus.ASSIGNED },
      ]);

      const res = await request(app)
        .get('/api/v1/mechanics/jobs')
        .set('Authorization', `Bearer ${mechanicToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('POST /api/v1/mechanics/jobs/:id/accept — should accept job', async () => {
      (mechanicService.acceptJob as jest.Mock).mockResolvedValue({
        _id: mockBookingId,
        status: BookingStatus.ACCEPTED,
      });

      const res = await request(app)
        .post(`/api/v1/mechanics/jobs/${mockBookingId}/accept`)
        .set('Authorization', `Bearer ${mechanicToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mechanicService.acceptJob).toHaveBeenCalledWith(
        mockMechanicUserId,
        mockBookingId
      );
    });

    it('POST /api/v1/mechanics/jobs/:id/reject — should reject job', async () => {
      (mechanicService.rejectJob as jest.Mock).mockResolvedValue({
        _id: mockBookingId,
        status: BookingStatus.REJECTED,
      });

      const res = await request(app)
        .post(`/api/v1/mechanics/jobs/${mockBookingId}/reject`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ reason: 'Too far' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mechanicService.rejectJob).toHaveBeenCalledWith(
        mockMechanicUserId,
        mockBookingId,
        'Too far'
      );
    });

    it('GET /api/v1/mechanics/jobs/active — should get active job', async () => {
      (mechanicService.getActiveJob as jest.Mock).mockResolvedValue({
        _id: mockBookingId,
        status: BookingStatus.IN_PROGRESS,
      });

      const res = await request(app)
        .get('/api/v1/mechanics/jobs/active')
        .set('Authorization', `Bearer ${mechanicToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(BookingStatus.IN_PROGRESS);
    });

    it('PUT /api/v1/mechanics/jobs/:id/status — should update execution state', async () => {
      (mechanicService.updateJobExecutionStatus as jest.Mock).mockResolvedValue({
        _id: mockBookingId,
        status: BookingStatus.COMPLETED,
      });

      const res = await request(app)
        .put(`/api/v1/mechanics/jobs/${mockBookingId}/status`)
        .set('Authorization', `Bearer ${mechanicToken}`)
        .send({ status: BookingStatus.COMPLETED, notes: 'Engine oil replaced' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mechanicService.updateJobExecutionStatus).toHaveBeenCalledWith(
        mockMechanicUserId,
        mockBookingId,
        BookingStatus.COMPLETED,
        'Engine oil replaced'
      );
    });
  });
});
