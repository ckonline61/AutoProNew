import request from 'supertest';
import app from '../src/app';
import { aiService } from '../src/services/ai.service';
import { User } from '../src/models/user.model';
import { UserRole } from '../src/types';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

jest.mock('../src/services/ai.service');
jest.mock('../src/models/user.model');

describe('Phase 20 — AI Integration Layer & Final Polish', () => {
  const mockCustomerId = '507f1f77bcf86cd799439011';
  const mockBookingId = '507f1f77bcf86cd799439022';
  const mockServiceId = '507f1f77bcf86cd799439033';
  const mockVehicleId = '507f1f77bcf86cd799439044';

  const mockCustomerUser = {
    _id: mockCustomerId,
    name: 'Customer User',
    email: 'customer@example.com',
    role: UserRole.CUSTOMER,
    isActive: true,
  };

  let customerToken: string;

  beforeEach(() => {
    jest.clearAllMocks();

    customerToken = jwt.sign(
      { userId: mockCustomerId, email: mockCustomerUser.email, role: mockCustomerUser.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    (User.findById as jest.Mock).mockImplementation((id: string) => {
      if (id === mockCustomerId) return Promise.resolve(mockCustomerUser);
      return Promise.resolve(null);
    });
  });

  describe('POST /api/v1/ai/recommend-mechanic', () => {
    it('should return mechanic recommendations successfully', async () => {
      const mockRecommendations = [
        {
          mechanic: {
            _id: '507f1f77bcf86cd799439066',
            userId: '507f1f77bcf86cd799439077',
            rating: 4.9,
            specializations: ['Brakes', 'Oil Service'],
          },
          score: 95,
          rating: 4.9,
          activeJobs: 0,
          distanceKm: 3.2,
          matchReasons: ['Top-rated mechanic', 'Nearby mechanic (~3.2 km away)'],
        },
      ];

      (aiService.recommendMechanic as jest.Mock).mockResolvedValue(mockRecommendations);

      const res = await request(app)
        .post('/api/v1/ai/recommend-mechanic')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ bookingId: mockBookingId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].score).toBe(95);
      expect(aiService.recommendMechanic).toHaveBeenCalledWith(mockBookingId);
    });

    it('should return 422 if bookingId is missing or invalid', async () => {
      const res = await request(app)
        .post('/api/v1/ai/recommend-mechanic')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ bookingId: 'invalid-id' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 Unauthorized without auth token', async () => {
      const res = await request(app)
        .post('/api/v1/ai/recommend-mechanic')
        .send({ bookingId: mockBookingId });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/ai/estimate-price', () => {
    it('should calculate estimated price range for given services', async () => {
      const mockEstimate = {
        minEstimate: 1425,
        maxEstimate: 1725,
        basePrice: 1000,
        multiplier: 1.5,
      };

      (aiService.estimatePrice as jest.Mock).mockResolvedValue(mockEstimate);

      const res = await request(app)
        .post('/api/v1/ai/estimate-price')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          serviceIds: [mockServiceId],
          vehicleId: mockVehicleId,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.basePrice).toBe(1000);
      expect(res.body.data.multiplier).toBe(1.5);
      expect(aiService.estimatePrice).toHaveBeenCalledWith([mockServiceId], mockVehicleId);
    });

    it('should return 422 if serviceIds array is empty', async () => {
      const res = await request(app)
        .post('/api/v1/ai/estimate-price')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ serviceIds: [] });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 Unauthorized without token', async () => {
      const res = await request(app)
        .post('/api/v1/ai/estimate-price')
        .send({ serviceIds: [mockServiceId] });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/ai/insights', () => {
    it('should return user booking insights and next recommended service date', async () => {
      const mockInsights = {
        totalBookings: 4,
        totalSpent: 5200,
        mostUsedServices: [
          { serviceId: mockServiceId, name: 'Engine Oil Replacement', count: 3 },
        ],
        averageBookingFrequency: 'Every 45 days',
        nextRecommendedServiceDate: '2026-11-15T00:00:00.000Z',
        preferredMechanic: {
          mechanicId: '507f1f77bcf86cd799439066',
          name: 'Pro Mechanic',
          bookingCount: 3,
        },
      };

      (aiService.getBookingInsights as jest.Mock).mockResolvedValue(mockInsights);

      const res = await request(app)
        .get('/api/v1/ai/insights')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalBookings).toBe(4);
      expect(res.body.data.totalSpent).toBe(5200);
      expect(aiService.getBookingInsights).toHaveBeenCalledWith(mockCustomerId);
    });

    it('should return 401 Unauthorized without token', async () => {
      const res = await request(app).get('/api/v1/ai/insights');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/ai/search', () => {
    it('should return search results across services, spare parts, and cars with q query param', async () => {
      const mockSearchResults = {
        services: [{ name: 'Oil Service', price: 800, relevanceScore: 80 }],
        spareParts: [{ name: 'Engine Oil 5W-30', price: 1200, relevanceScore: 60 }],
        usedCars: [{ brand: 'Honda', model: 'City', relevanceScore: 40 }],
      };

      (aiService.smartSearch as jest.Mock).mockResolvedValue(mockSearchResults);

      const res = await request(app)
        .get('/api/v1/ai/search')
        .query({ q: 'oil' })
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.services.length).toBe(1);
      expect(res.body.data.spareParts.length).toBe(1);
      expect(aiService.smartSearch).toHaveBeenCalledWith('oil');
    });

    it('should return 422 if search query is too short', async () => {
      const res = await request(app)
        .get('/api/v1/ai/search')
        .query({ q: 'o' })
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 Unauthorized without token', async () => {
      const res = await request(app).get('/api/v1/ai/search').query({ q: 'oil' });
      expect(res.status).toBe(401);
    });
  });
});
