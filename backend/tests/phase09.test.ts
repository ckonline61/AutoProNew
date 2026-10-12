import request from 'supertest';
import app from '../src/app';
import { locationService } from '../src/services/location.service';
import { User } from '../src/models/user.model';
import { UserRole } from '../src/types';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

jest.mock('../src/services/location.service');
jest.mock('../src/models/user.model');

describe('Phase 09 — Google Maps & Location Services', () => {
  const mockAdminId = '507f1f77bcf86cd799439099';
  const mockCustomerId = '507f1f77bcf86cd799439011';

  const mockAdminUser = {
    _id: mockAdminId,
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    isActive: true,
  };

  const mockCustomerUser = {
    _id: mockCustomerId,
    name: 'Customer User',
    email: 'customer@example.com',
    role: UserRole.CUSTOMER,
    isActive: true,
  };

  let adminToken: string;
  let customerToken: string;

  beforeEach(() => {
    jest.clearAllMocks();

    adminToken = jwt.sign(
      { userId: mockAdminId, email: mockAdminUser.email, role: mockAdminUser.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    customerToken = jwt.sign(
      { userId: mockCustomerId, email: mockCustomerUser.email, role: mockCustomerUser.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    (User.findById as jest.Mock).mockImplementation((id: string) => {
      if (id === mockAdminId) return Promise.resolve(mockAdminUser);
      if (id === mockCustomerId) return Promise.resolve(mockCustomerUser);
      return Promise.resolve(null);
    });
  });

  describe('Geocoding & Places APIs', () => {
    it('GET /api/v1/location/geocode — should forward geocode address', async () => {
      (locationService.geocode as jest.Mock).mockResolvedValue({
        latitude: 19.076,
        longitude: 72.8777,
        formattedAddress: 'Mumbai, Maharashtra',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      });

      const res = await request(app)
        .get('/api/v1/location/geocode')
        .query({ address: 'Mumbai' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.latitude).toBe(19.076);
      expect(locationService.geocode).toHaveBeenCalledWith('Mumbai');
    });

    it('GET /api/v1/location/reverse-geocode — should reverse geocode coordinates', async () => {
      (locationService.reverseGeocode as jest.Mock).mockResolvedValue({
        latitude: 19.076,
        longitude: 72.8777,
        formattedAddress: 'Bandra West, Mumbai',
        city: 'Mumbai',
      });

      const res = await request(app)
        .get('/api/v1/location/reverse-geocode')
        .query({ latitude: '19.076', longitude: '72.8777' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(locationService.reverseGeocode).toHaveBeenCalledWith(19.076, 72.8777);
    });

    it('GET /api/v1/location/autocomplete — should suggest places', async () => {
      (locationService.autocompletePlaces as jest.Mock).mockResolvedValue([
        {
          placeId: 'place_1',
          description: 'Bandra, Mumbai',
          mainText: 'Bandra',
        },
      ]);

      const res = await request(app)
        .get('/api/v1/location/autocomplete')
        .query({ input: 'Bandra' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(locationService.autocompletePlaces).toHaveBeenCalledWith('Bandra');
    });

    it('GET /api/v1/location/distance — should calculate distance and duration', async () => {
      (locationService.calculateDistance as jest.Mock).mockReturnValue({
        distanceKm: 12.4,
        durationMins: 25,
        origin: { latitude: 19.076, longitude: 72.8777 },
        destination: { latitude: 19.1136, longitude: 72.8697 },
      });

      const res = await request(app)
        .get('/api/v1/location/distance')
        .query({
          originLat: '19.076',
          originLng: '72.8777',
          destLat: '19.1136',
          destLng: '72.8697',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.distanceKm).toBe(12.4);
      expect(locationService.calculateDistance).toHaveBeenCalledWith(
        19.076,
        72.8777,
        19.1136,
        72.8697
      );
    });
  });

  describe('Serviceability & Geofencing', () => {
    it('POST /api/v1/location/serviceable — should validate serviceable location', async () => {
      (locationService.checkServiceability as jest.Mock).mockResolvedValue({
        isServiceable: true,
        message: 'Serviceable in Mumbai area',
      });

      const res = await request(app)
        .post('/api/v1/location/serviceable')
        .send({ latitude: 19.076, longitude: 72.8777, city: 'Mumbai' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isServiceable).toBe(true);
      expect(locationService.checkServiceability).toHaveBeenCalledWith({
        latitude: 19.076,
        longitude: 72.8777,
        city: 'Mumbai',
      });
    });

    it('GET /api/v1/location/service-areas — should list service areas', async () => {
      (locationService.getServiceAreas as jest.Mock).mockResolvedValue([
        { _id: 'area-1', name: 'Mumbai Metropolitan Region', city: 'Mumbai' },
      ]);

      const res = await request(app).get('/api/v1/location/service-areas');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('POST /api/v1/location/service-areas — admin can create service area', async () => {
      const newArea = {
        name: 'Pune City Central',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
      };

      (locationService.createServiceArea as jest.Mock).mockResolvedValue({
        _id: 'area-2',
        ...newArea,
        isActive: true,
      });

      const res = await request(app)
        .post('/api/v1/location/service-areas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newArea);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(locationService.createServiceArea).toHaveBeenCalledWith(newArea);
    });

    it('POST /api/v1/location/service-areas — reject non-admin with 403', async () => {
      const res = await request(app)
        .post('/api/v1/location/service-areas')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'Pune City', city: 'Pune', state: 'Maharashtra' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });
});
