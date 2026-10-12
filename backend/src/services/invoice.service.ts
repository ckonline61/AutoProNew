import { Types } from 'mongoose';
import { Invoice, IInvoice, IInvoiceItem } from '../models/invoice.model';
import { Booking } from '../models/booking.model';
import { User } from '../models/user.model';
import { IService } from '../models/service.model';
import { PaymentStatus } from '../types';
import { NotFoundError, ForbiddenError } from '../errors/app-error';
import { pdfService } from './pdf.service';

export class InvoiceService {
  /**
   * Helper to generate unique invoice number: INV-YYYYMMDD-XXXX
   */
  private generateInvoiceNumber(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    return `INV-${dateStr}-${randomSuffix}`;
  }

  /**
   * Create invoice from booking with line items from services
   */
  async generateInvoice(bookingId: string): Promise<IInvoice> {
    const booking = await Booking.findById(bookingId).populate<{ serviceIds: IService[] }>('serviceIds');
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Return existing invoice if already generated
    const existing = await Invoice.findOne({ bookingId: booking._id });
    if (existing) {
      return existing;
    }

    // Build line items from services
    const items: IInvoiceItem[] = [];
    if (booking.serviceIds && Array.isArray(booking.serviceIds) && booking.serviceIds.length > 0) {
      for (const service of booking.serviceIds) {
        const unitPrice = service.price ?? service.discountedPrice ?? 0;
        items.push({
          description: service.name || 'Automotive Service',
          quantity: 1,
          unitPrice,
          total: unitPrice,
        });
      }
    } else {
      const estimated = booking.finalPrice ?? booking.estimatedPrice ?? 0;
      items.push({
        description: 'Automotive Service Package',
        quantity: 1,
        unitPrice: estimated,
        total: estimated,
      });
    }

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const discount = booking.discount || 0;
    const taxRate = 18;
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round((taxableAmount * taxRate) / 100);
    const total = taxableAmount + tax;

    const isPaid =
      booking.paymentStatus === PaymentStatus.COMPLETED ||
      booking.paymentStatus === PaymentStatus.SUCCESS;

    let invoiceNumber = this.generateInvoiceNumber();
    let collision = await Invoice.exists({ invoiceNumber });
    while (collision) {
      invoiceNumber = this.generateInvoiceNumber();
      collision = await Invoice.exists({ invoiceNumber });
    }

    const invoice = await Invoice.create({
      invoiceNumber,
      bookingId: booking._id,
      customerId: booking.customerId,
      items,
      subtotal,
      tax,
      taxRate,
      discount,
      total,
      paidAmount: isPaid ? total : 0,
      status: isPaid ? 'PAID' : 'ISSUED',
      issuedDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      notes: booking.notes,
    });

    return invoice;
  }

  /**
   * Get invoice with ownership verification
   */
  async getInvoice(userId: string, invoiceId: string): Promise<IInvoice> {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    if (invoice.customerId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to access this invoice');
    }

    return invoice;
  }

  /**
   * List invoices for a customer
   */
  async getInvoicesByCustomer(userId: string): Promise<IInvoice[]> {
    return Invoice.find({ customerId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('bookingId');
  }

  /**
   * Generate and return invoice PDF Buffer
   */
  async downloadInvoicePDF(userId: string, invoiceId: string): Promise<Buffer> {
    const invoice = await this.getInvoice(userId, invoiceId);

    const customer = await User.findById(invoice.customerId);
    if (!customer) {
      throw new NotFoundError('Customer record not found');
    }

    const booking = await Booking.findById(invoice.bookingId);
    if (!booking) {
      throw new NotFoundError('Associated booking record not found');
    }

    return pdfService.generateInvoicePDF(invoice, customer, booking);
  }

  /**
   * Update invoice status to PAID
   */
  async markAsPaid(invoiceId: string, amount?: number): Promise<IInvoice> {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    invoice.status = 'PAID';
    invoice.paidAmount = amount !== undefined ? amount : invoice.total;
    await invoice.save();

    return invoice;
  }
}

export const invoiceService = new InvoiceService();
export default invoiceService;
