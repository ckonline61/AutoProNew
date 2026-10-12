import request from 'supertest';
import app from '../src/app';
import { invoiceService } from '../src/services/invoice.service';
import { User } from '../src/models/user.model';
import { UserRole } from '../src/types';
import jwt from 'jsonwebtoken';
import { config } from '../src/config';
import { NotFoundError, ForbiddenError } from '../src/errors/app-error';

jest.mock('../src/services/invoice.service');
jest.mock('../src/models/user.model');

describe('Invoice Routes & Service Integration Tests', () => {
  const userId = '507f1f77bcf86cd799439011';
  const mockUser = {
    _id: userId,
    name: 'Test Customer',
    email: 'customer@example.com',
    role: UserRole.CUSTOMER,
    isActive: true,
  };

  const authToken = jwt.sign(
    { userId, role: UserRole.CUSTOMER, email: 'customer@example.com' },
    config.jwt.secret || 'test-jwt-secret-for-testing'
  );

  beforeEach(() => {
    jest.clearAllMocks();
    (User.findById as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('POST /api/v1/invoices/generate', () => {
    const validBookingId = '507f1f77bcf86cd799439022';

    it('should generate invoice successfully for valid booking', async () => {
      const mockInvoice = {
        _id: '507f1f77bcf86cd799439033',
        invoiceNumber: 'INV-20261012-1001',
        bookingId: validBookingId,
        customerId: userId,
        items: [{ description: 'General Service', quantity: 1, unitPrice: 1500, total: 1500 }],
        subtotal: 1500,
        tax: 270,
        taxRate: 18,
        discount: 0,
        total: 1770,
        paidAmount: 0,
        status: 'ISSUED',
        issuedDate: new Date(),
      };

      (invoiceService.generateInvoice as jest.Mock).mockResolvedValue(mockInvoice);

      const response = await request(app)
        .post('/api/v1/invoices/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bookingId: validBookingId });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.invoiceNumber).toBe('INV-20261012-1001');
      expect(response.body.data.total).toBe(1770);
    });

    it('should return 401 Unauthorized without token', async () => {
      const response = await request(app)
        .post('/api/v1/invoices/generate')
        .send({ bookingId: validBookingId });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 422 if bookingId is invalid format', async () => {
      const response = await request(app)
        .post('/api/v1/invoices/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ bookingId: 'invalid-id' });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/invoices', () => {
    it('should return customer invoices list', async () => {
      const mockInvoices = [
        {
          _id: '507f1f77bcf86cd799439033',
          invoiceNumber: 'INV-20261012-1001',
          total: 1770,
          status: 'ISSUED',
        },
      ];

      (invoiceService.getInvoicesByCustomer as jest.Mock).mockResolvedValue(mockInvoices);

      const response = await request(app)
        .get('/api/v1/invoices')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });
  });

  describe('GET /api/v1/invoices/:id', () => {
    const invoiceId = '507f1f77bcf86cd799439033';

    it('should return single invoice by ID', async () => {
      const mockInvoice = {
        _id: invoiceId,
        invoiceNumber: 'INV-20261012-1001',
        total: 1770,
        status: 'ISSUED',
      };

      (invoiceService.getInvoice as jest.Mock).mockResolvedValue(mockInvoice);

      const response = await request(app)
        .get(`/api/v1/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.invoiceNumber).toBe('INV-20261012-1001');
    });

    it('should return 404 when invoice is not found', async () => {
      (invoiceService.getInvoice as jest.Mock).mockRejectedValue(
        new NotFoundError('Invoice not found')
      );

      const response = await request(app)
        .get(`/api/v1/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 when user is not owner', async () => {
      (invoiceService.getInvoice as jest.Mock).mockRejectedValue(
        new ForbiddenError('You do not have permission to access this invoice')
      );

      const response = await request(app)
        .get(`/api/v1/invoices/${invoiceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/invoices/:id/pdf', () => {
    const invoiceId = '507f1f77bcf86cd799439033';

    it('should stream PDF buffer with application/pdf content type', async () => {
      const mockBuffer = Buffer.from('%PDF-1.4 test invoice buffer');
      (invoiceService.downloadInvoicePDF as jest.Mock).mockResolvedValue(mockBuffer);

      const response = await request(app)
        .get(`/api/v1/invoices/${invoiceId}/pdf`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain(`invoice-${invoiceId}.pdf`);
    });
  });
});
