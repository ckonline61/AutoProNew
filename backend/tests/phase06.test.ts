import request from 'supertest';
import app from '../src/app';
import { BookingFsm } from '../src/services/booking-fsm';
import { BookingStatus, UserRole } from '../src/types';
import { serviceCatalogService } from '../src/services/service.service';
import { bookingService } from '../src/services/booking.service';
import { User } from '../src/models/user.model';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';

jest.mock('../src/services/service.service');
jest.mock('../src/services/booking.service');
jest.mock('../src/models/user.model');

describe('Phase 06 — Service Catalog & Booking System', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockVehicleId = '507f1f77bcf86cd799439022';
  const mockAddressId = '507f1f77bcf86cd799439033';
  const mockServiceId = '507f1f77bcf86cd799439044';
  const mockBookingId = '507f1f77bcf86cd799439055';

  const mockUser = {
    _id: mockUserId,
    name: 'Customer One',
    email: 'customer1@example.com',
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

  describe('Booking Finite State Machine (FSM)', () => {
    it('should permit valid forward transitions', () => {
      expect(BookingFsm.canTransition(BookingStatus.PENDING, BookingStatus.CONFIRMED)).toBe(true);
      expect(BookingFsm.canTransition(BookingStatus.CONFIRMED, BookingStatus.ASSIGNED)).toBe(true);
      expect(BookingFsm.canTransition(BookingStatus.ASSIGNED, BookingStatus.ACCEPTED)).toBe(true);
      expect(BookingFsm.canTransition(BookingStatus.ACCEPTED, BookingStatus.EN_ROUTE)).toBe(true);
      expect(BookingFsm.canTransition(BookingStatus.EN_ROUTE, BookingStatus.ARRIVED)).toBe(true);
      expect(BookingFsm.canTransition(BookingStatus.ARRIVED, BookingStatus.IN_PROGRESS)).toBe(true);
      expect(BookingFsm.canTransition(BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED)).toBe(true);
    });

    it('should disallow illegal transitions', () => {
      expect(BookingFsm.canTransition(BookingStatus.PENDING, BookingStatus.COMPLETED)).toBe(false);
      expect(BookingFsm.canTransition(BookingStatus.COMPLETED, BookingStatus.PENDING)).toBe(false);
      expect(BookingFsm.canTransition(BookingStatus.CANCELLED, BookingStatus.IN_PROGRESS)).toBe(false);
      expect(() => {
        BookingFsm.assertTransition(BookingStatus.PENDING, BookingStatus.COMPLETED);
      }).toThrow('Invalid status transition');
    });

    it('should enforce cancellation rules for customers', () => {
      expect(() => {
        BookingFsm.assertCustomerCanCancel(BookingStatus.PENDING);
      }).not.toThrow();

      expect(() => {
        BookingFsm.assertCustomerCanCancel(BookingStatus.CONFIRMED);
      }).not.toThrow();

      expect(() => {
        BookingFsm.assertCustomerCanCancel(BookingStatus.IN_PROGRESS);
      }).toThrow('Booking cannot be cancelled');

      expect(() => {
        BookingFsm.assertCustomerCanCancel(BookingStatus.COMPLETED);
      }).toThrow('Booking cannot be cancelled');
    });
  });

  describe('Service Catalog Endpoints (/api/v1/services)', () => {
    it('GET /api/v1/services/categories — should list categories', async () => {
      const mockCategories = [
        { _id: 'cat-1', name: 'Periodic Services', sortOrder: 1, isActive: true },
      ];
      (serviceCatalogService.getCategories as jest.Mock).mockResolvedValue(mockCategories);

      const res = await request(app).get('/api/v1/services/categories');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('GET /api/v1/services — should list services with pagination', async () => {
      const mockServicesResult = {
        services: [
          {
            _id: mockServiceId,
            name: 'Basic Service',
            price: 2999,
            discountedPrice: 2499,
            duration: 120,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };
      (serviceCatalogService.getServices as jest.Mock).mockResolvedValue(mockServicesResult);

      const res = await request(app).get('/api/v1/services');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toBeDefined();
    });

    it('GET /api/v1/services/:id — should get service details', async () => {
      const mockService = {
        _id: mockServiceId,
        name: 'Basic Service',
        price: 2999,
        duration: 120,
      };
      (serviceCatalogService.getServiceById as jest.Mock).mockResolvedValue(mockService);

      const res = await request(app).get(`/api/v1/services/${mockServiceId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Basic Service');
    });
  });

  describe('Booking Endpoints (/api/v1/bookings)', () => {
    const validBookingData = {
      vehicleId: mockVehicleId,
      addressId: mockAddressId,
      serviceType: 'DOORSTEP',
      serviceIds: [mockServiceId],
      scheduledDate: '2026-10-25T10:00:00.000Z',
      scheduledTime: '10:00 AM - 12:00 PM',
      notes: 'Please check brake fluid',
    };

    it('POST /api/v1/bookings — should create booking', async () => {
      const mockCreatedBooking = {
        _id: mockBookingId,
        bookingNumber: 'BK-20261025-1234',
        customerId: mockUserId,
        ...validBookingData,
        status: BookingStatus.PENDING,
        estimatedPrice: 2499,
        estimatedDuration: 120,
      };
      (bookingService.create as jest.Mock).mockResolvedValue(mockCreatedBooking);

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${validToken}`)
        .send(validBookingData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bookingNumber).toBe('BK-20261025-1234');
      expect(bookingService.create).toHaveBeenCalledWith(mockUserId, validBookingData);
    });

    it('POST /api/v1/bookings — should reject when doorstep address is missing', async () => {
      const invalidData = {
        vehicleId: mockVehicleId,
        serviceType: 'DOORSTEP',
        serviceIds: [mockServiceId],
        scheduledDate: '2026-10-25T10:00:00.000Z',
        scheduledTime: '10:00 AM - 12:00 PM',
      };

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${validToken}`)
        .send(invalidData);

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('GET /api/v1/bookings — should list customer bookings', async () => {
      (bookingService.getCustomerBookings as jest.Mock).mockResolvedValue({
        bookings: [{ _id: mockBookingId, status: BookingStatus.PENDING }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const res = await request(app)
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });

    it('GET /api/v1/bookings/:id — should get single booking', async () => {
      (bookingService.getById as jest.Mock).mockResolvedValue({
        _id: mockBookingId,
        bookingNumber: 'BK-20261025-1234',
        status: BookingStatus.PENDING,
      });

      const res = await request(app)
        .get(`/api/v1/bookings/${mockBookingId}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(bookingService.getById).toHaveBeenCalledWith(mockUserId, mockBookingId);
    });

    it('POST /api/v1/bookings/:id/cancel — should cancel booking', async () => {
      (bookingService.cancel as jest.Mock).mockResolvedValue({
        _id: mockBookingId,
        status: BookingStatus.CANCELLED,
        cancellationReason: 'Change of plans',
      });

      const res = await request(app)
        .post(`/api/v1/bookings/${mockBookingId}/cancel`)
        .set('Authorization', `Bearer ${validToken}`)
        .send({ reason: 'Change of plans' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(bookingService.cancel).toHaveBeenCalledWith(
        mockUserId,
        mockBookingId,
        'Change of plans'
      );
    });
  });
});
