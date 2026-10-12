import request from 'supertest';
import app from '../src/app';
import { UserRole, PaymentStatus, PaymentMethod } from '../src/types';
import { paymentService } from '../src/services/payment.service';
import { razorpayClient } from '../src/integrations/razorpay';
import { User } from '../src/models/user.model';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';
import crypto from 'crypto';

jest.mock('../src/services/payment.service');
jest.mock('../src/models/user.model');

describe('Phase 11 — Payment Integration (Razorpay)', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockBookingId = '507f1f77bcf86cd799439055';
  const mockPaymentId = '507f1f77bcf86cd799439099';

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

  describe('Razorpay Client & HMAC Verification', () => {
    it('should correctly verify valid payment HMAC SHA256 signature', () => {
      const orderId = 'order_test123';
      const paymentId = 'pay_test456';
      const secret = config.razorpay.keySecret || 'test_secret';

      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const isValid = razorpayClient.verifyPaymentSignature(orderId, paymentId, validSignature);
      expect(isValid).toBe(true);
    });

    it('should reject invalid payment signature', () => {
      const orderId = 'order_test123';
      const paymentId = 'pay_test456';
      const invalidSignature = 'invalid_signature_hex';

      const isValid = razorpayClient.verifyPaymentSignature(orderId, paymentId, invalidSignature);
      expect(isValid).toBe(false);
    });
  });

  describe('Payment Endpoints (/api/v1/payments)', () => {
    describe('POST /api/v1/payments/orders', () => {
      it('should create payment order successfully', async () => {
        const mockOrderResult = {
          payment: {
            _id: mockPaymentId,
            bookingId: mockBookingId,
            customerId: mockUserId,
            amount: 1500,
            currency: 'INR',
            razorpayOrderId: 'order_12345',
            status: PaymentStatus.PENDING,
          },
          razorpayOrder: {
            id: 'order_12345',
            amount: 150000,
            currency: 'INR',
            status: 'created',
          },
          keyId: 'rzp_test_key',
        };

        (paymentService.createOrder as jest.Mock).mockResolvedValue(mockOrderResult);

        const response = await request(app)
          .post('/api/v1/payments/orders')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ bookingId: mockBookingId });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.razorpayOrder.id).toBe('order_12345');
        expect(paymentService.createOrder).toHaveBeenCalledWith(mockUserId, mockBookingId);
      });

      it('should return 401 without auth token', async () => {
        const response = await request(app)
          .post('/api/v1/payments/orders')
          .send({ bookingId: mockBookingId });

        expect(response.status).toBe(401);
      });

      it('should return 422 for invalid bookingId format', async () => {
        const response = await request(app)
          .post('/api/v1/payments/orders')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ bookingId: 'invalid-id' });

        expect(response.status).toBe(422);
      });
    });

    describe('POST /api/v1/payments/verify', () => {
      it('should verify payment successfully', async () => {
        const verifyData = {
          razorpayOrderId: 'order_12345',
          razorpayPaymentId: 'pay_67890',
          razorpaySignature: 'sig_abcde',
        };

        const mockVerifyResult = {
          payment: {
            _id: mockPaymentId,
            bookingId: mockBookingId,
            status: PaymentStatus.COMPLETED,
            method: PaymentMethod.RAZORPAY,
          },
          verified: true,
        };

        (paymentService.verifyPayment as jest.Mock).mockResolvedValue(mockVerifyResult);

        const response = await request(app)
          .post('/api/v1/payments/verify')
          .set('Authorization', `Bearer ${validToken}`)
          .send(verifyData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.verified).toBe(true);
        expect(paymentService.verifyPayment).toHaveBeenCalledWith(mockUserId, verifyData);
      });

      it('should reject verification with missing fields', async () => {
        const response = await request(app)
          .post('/api/v1/payments/verify')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ razorpayOrderId: 'order_123' });

        expect(response.status).toBe(422);
      });
    });

    describe('GET /api/v1/payments/booking/:bookingId', () => {
      it('should get payment for a booking', async () => {
        const mockPayment = {
          _id: mockPaymentId,
          bookingId: mockBookingId,
          amount: 1500,
          status: PaymentStatus.COMPLETED,
        };

        (paymentService.getPaymentByBooking as jest.Mock).mockResolvedValue(mockPayment);

        const response = await request(app)
          .get(`/api/v1/payments/booking/${mockBookingId}`)
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.amount).toBe(1500);
        expect(paymentService.getPaymentByBooking).toHaveBeenCalledWith(mockUserId, mockBookingId);
      });
    });

    describe('GET /api/v1/payments/history', () => {
      it('should get payment history for authenticated user', async () => {
        const mockPayments = [
          {
            _id: mockPaymentId,
            bookingId: mockBookingId,
            amount: 1500,
            status: PaymentStatus.COMPLETED,
          },
        ];

        (paymentService.getPaymentHistory as jest.Mock).mockResolvedValue(mockPayments);

        const response = await request(app)
          .get('/api/v1/payments/history')
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
        expect(paymentService.getPaymentHistory).toHaveBeenCalledWith(mockUserId);
      });
    });

    describe('POST /api/v1/payments/webhook', () => {
      it('should process webhook without user authentication', async () => {
        (paymentService.handleWebhook as jest.Mock).mockResolvedValue({
          processed: true,
          event: 'payment.captured',
        });

        const webhookPayload = {
          event: 'payment.captured',
          payload: {
            payment: {
              entity: {
                id: 'pay_123',
                order_id: 'order_123',
                status: 'captured',
              },
            },
          },
        };

        const response = await request(app)
          .post('/api/v1/payments/webhook')
          .set('x-razorpay-signature', 'valid_webhook_sig')
          .send(webhookPayload);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.processed).toBe(true);
        expect(paymentService.handleWebhook).toHaveBeenCalled();
      });

      it('should reject webhook when signature header is missing', async () => {
        const response = await request(app)
          .post('/api/v1/payments/webhook')
          .send({ event: 'payment.captured' });

        expect(response.status).toBe(400);
      });
    });
  });
});
