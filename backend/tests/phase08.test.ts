import request from 'supertest';
import app from '../src/app';
import { emergencyService } from '../src/services/emergency.service';
import { User } from '../src/models/user.model';
import { EmergencyStatus, EmergencyType, Priority, UserRole } from '../src/types';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

jest.mock('../src/services/emergency.service');
jest.mock('../src/models/user.model');

describe('Phase 08 — Emergency Roadside Assistance (RSA)', () => {
  const mockCustomerId = '507f1f77bcf86cd799439011';
  const mockProviderId = '507f1f77bcf86cd799439022';
  const mockRequestId = '507f1f77bcf86cd799439033';

  const mockCustomerUser = {
    _id: mockCustomerId,
    name: 'Customer Suraj',
    email: 'suraj@example.com',
    role: UserRole.CUSTOMER,
    isActive: true,
  };

  const mockProviderUser = {
    _id: mockProviderId,
    name: 'Mechanic Ramesh',
    email: 'ramesh@example.com',
    role: UserRole.MECHANIC,
    isActive: true,
  };

  let customerToken: string;
  let providerToken: string;

  beforeEach(() => {
    jest.clearAllMocks();

    customerToken = jwt.sign(
      { userId: mockCustomerId, email: mockCustomerUser.email, role: mockCustomerUser.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    providerToken = jwt.sign(
      { userId: mockProviderId, email: mockProviderUser.email, role: mockProviderUser.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    (User.findById as jest.Mock).mockImplementation((id: string) => {
      if (id === mockCustomerId) return Promise.resolve(mockCustomerUser);
      if (id === mockProviderId) return Promise.resolve(mockProviderUser);
      return Promise.resolve(null);
    });
  });

  describe('SOS Request Creation & Matching', () => {
    it('POST /api/v1/emergency — should create rapid SOS request', async () => {
      const sosData = {
        problemType: EmergencyType.FLAT_TYRE,
        latitude: 19.076,
        longitude: 72.8777,
        priority: Priority.HIGH,
        address: 'Bandra West, Mumbai',
      };

      (emergencyService.createSOS as jest.Mock).mockResolvedValue({
        _id: mockRequestId,
        requestNumber: 'EM-20261012-1001',
        customerId: mockCustomerId,
        ...sosData,
        status: EmergencyStatus.ASSIGNED,
        assignedProviderId: mockProviderId,
        estimatedPrice: 399,
        estimatedArrival: 15,
      });

      const res = await request(app)
        .post('/api/v1/emergency')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(sosData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.requestNumber).toBe('EM-20261012-1001');
      expect(emergencyService.createSOS).toHaveBeenCalledWith(
        mockCustomerId,
        expect.objectContaining(sosData)
      );
    });

    it('GET /api/v1/emergency — should list customer emergency requests', async () => {
      (emergencyService.getCustomerRequests as jest.Mock).mockResolvedValue({
        requests: [
          {
            _id: mockRequestId,
            requestNumber: 'EM-20261012-1001',
            status: EmergencyStatus.ASSIGNED,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const res = await request(app)
        .get('/api/v1/emergency')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('GET /api/v1/emergency/:id — should get request details', async () => {
      (emergencyService.getById as jest.Mock).mockResolvedValue({
        _id: mockRequestId,
        requestNumber: 'EM-20261012-1001',
        status: EmergencyStatus.ASSIGNED,
      });

      const res = await request(app)
        .get(`/api/v1/emergency/${mockRequestId}`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(emergencyService.getById).toHaveBeenCalledWith(mockRequestId);
    });
  });

  describe('Provider Dispatch & Response', () => {
    it('GET /api/v1/emergency/assigned — should get provider assigned requests', async () => {
      (emergencyService.getProviderRequests as jest.Mock).mockResolvedValue([
        {
          _id: mockRequestId,
          requestNumber: 'EM-20261012-1001',
          status: EmergencyStatus.ASSIGNED,
        },
      ]);

      const res = await request(app)
        .get('/api/v1/emergency/assigned')
        .set('Authorization', `Bearer ${providerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(emergencyService.getProviderRequests).toHaveBeenCalledWith(mockProviderId);
    });

    it('POST /api/v1/emergency/:id/accept — provider accepts request', async () => {
      (emergencyService.acceptRequest as jest.Mock).mockResolvedValue({
        _id: mockRequestId,
        status: EmergencyStatus.ACCEPTED,
      });

      const res = await request(app)
        .post(`/api/v1/emergency/${mockRequestId}/accept`)
        .set('Authorization', `Bearer ${providerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(emergencyService.acceptRequest).toHaveBeenCalledWith(
        mockProviderId,
        mockRequestId
      );
    });

    it('PUT /api/v1/emergency/:id/status — advance emergency progress', async () => {
      (emergencyService.updateStatus as jest.Mock).mockResolvedValue({
        _id: mockRequestId,
        status: EmergencyStatus.EN_ROUTE,
      });

      const res = await request(app)
        .put(`/api/v1/emergency/${mockRequestId}/status`)
        .set('Authorization', `Bearer ${providerToken}`)
        .send({ status: EmergencyStatus.EN_ROUTE, notes: 'Mechanic on the way' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(emergencyService.updateStatus).toHaveBeenCalledWith(
        mockRequestId,
        EmergencyStatus.EN_ROUTE,
        'Mechanic on the way'
      );
    });

    it('POST /api/v1/emergency/:id/cancel — cancel request', async () => {
      (emergencyService.cancel as jest.Mock).mockResolvedValue({
        _id: mockRequestId,
        status: EmergencyStatus.CANCELLED,
        cancellationReason: 'Found another assistance',
      });

      const res = await request(app)
        .post(`/api/v1/emergency/${mockRequestId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Found another assistance' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(emergencyService.cancel).toHaveBeenCalledWith(
        mockRequestId,
        UserRole.CUSTOMER,
        'Found another assistance'
      );
    });
  });
});
