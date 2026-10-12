import { Types } from 'mongoose';
import { Payment, IPayment } from '../models/payment.model';
import { Booking } from '../models/booking.model';
import { PaymentStatus, PaymentMethod } from '../types';
import { razorpayClient, RazorpayOrderResponse } from '../integrations/razorpay';
import { config } from '../config';
import { BadRequestError, ForbiddenError, NotFoundError } from '../errors/app-error';
import { VerifyPaymentInput } from '../validators/payment.validator';

export interface CreateOrderResult {
  payment: IPayment;
  razorpayOrder: RazorpayOrderResponse;
  keyId: string;
}

export class PaymentService {
  /**
   * Create Razorpay order and save pending payment record
   */
  async createOrder(userId: string, bookingId: string): Promise<CreateOrderResult> {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.customerId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to pay for this booking');
    }

    // Check if payment already completed
    const existingPayment = await Payment.findOne({
      bookingId: booking._id,
      status: { $in: [PaymentStatus.SUCCESS, PaymentStatus.COMPLETED] },
    });

    if (existingPayment) {
      throw new BadRequestError('Payment has already been completed for this booking');
    }

    const amount = booking.finalPrice ?? booking.estimatedPrice;
    if (!amount || amount <= 0) {
      throw new BadRequestError('Invalid booking amount');
    }

    const receipt = `rcpt_${booking.bookingNumber}`;
    const razorpayOrder = await razorpayClient.createOrder(amount, 'INR', receipt, {
      bookingId: booking._id.toString(),
      customerId: userId,
      bookingNumber: booking.bookingNumber,
    });

    const payment = await Payment.create({
      bookingId: booking._id,
      customerId: new Types.ObjectId(userId),
      amount,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id,
      status: PaymentStatus.PENDING,
      notes: {
        bookingNumber: booking.bookingNumber,
      },
    });

    return {
      payment,
      razorpayOrder,
      keyId: config.razorpay.keyId,
    };
  }

  /**
   * Verify Razorpay payment signature and mark payment as COMPLETED
   */
  async verifyPayment(userId: string, data: VerifyPaymentInput): Promise<{ payment: IPayment; verified: boolean }> {
    const payment = await Payment.findOne({ razorpayOrderId: data.razorpayOrderId });
    if (!payment) {
      throw new NotFoundError('Payment record not found for this order');
    }

    if (payment.customerId.toString() !== userId.toString()) {
      throw new ForbiddenError('You are not authorized to verify this payment');
    }

    const isValid = razorpayClient.verifyPaymentSignature(
      data.razorpayOrderId,
      data.razorpayPaymentId,
      data.razorpaySignature
    );

    if (!isValid) {
      payment.status = PaymentStatus.FAILED;
      payment.razorpayPaymentId = data.razorpayPaymentId;
      payment.razorpaySignature = data.razorpaySignature;
      await payment.save();

      await Booking.findByIdAndUpdate(payment.bookingId, {
        paymentStatus: PaymentStatus.FAILED,
      });

      throw new BadRequestError('Payment signature verification failed');
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.razorpayPaymentId = data.razorpayPaymentId;
    payment.razorpaySignature = data.razorpaySignature;
    payment.method = PaymentMethod.RAZORPAY;
    await payment.save();

    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: PaymentStatus.COMPLETED,
    });

    return {
      payment,
      verified: true,
    };
  }

  /**
   * Get payment details for a specific booking
   */
  async getPaymentByBooking(userId: string, bookingId: string): Promise<IPayment> {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.customerId.toString() !== userId.toString()) {
      throw new ForbiddenError('You do not have permission to view payment for this booking');
    }

    const payment = await Payment.findOne({ bookingId }).sort({ createdAt: -1 });
    if (!payment) {
      throw new NotFoundError('Payment not found for this booking');
    }

    return payment;
  }

  /**
   * Get full payment history for a customer
   */
  async getPaymentHistory(userId: string): Promise<IPayment[]> {
    return Payment.find({ customerId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .populate('bookingId');
  }

  /**
   * Initiate payment refund
   */
  async initiateRefund(paymentId: string, amount?: number): Promise<IPayment> {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment record not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED && payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestError('Only completed payments can be refunded');
    }

    if (!payment.razorpayPaymentId) {
      throw new BadRequestError('Payment cannot be refunded without Razorpay payment ID');
    }

    if (amount !== undefined && (amount <= 0 || amount > payment.amount)) {
      throw new BadRequestError('Refund amount must be between 1 and the total payment amount');
    }

    const refund = await razorpayClient.refundPayment(payment.razorpayPaymentId, amount);

    payment.refundId = refund.id;
    payment.refundAmount = amount || payment.amount;
    payment.refundStatus = refund.status;
    payment.status =
      amount && amount < payment.amount ? PaymentStatus.PARTIAL_REFUND : PaymentStatus.REFUNDED;
    await payment.save();

    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: payment.status,
    });

    return payment;
  }

  /**
   * Process incoming Razorpay webhook
   */
  async handleWebhook(rawBody: string, signature: string): Promise<{ processed: boolean; event?: string }> {
    const isValid = razorpayClient.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new BadRequestError('Invalid webhook signature');
    }

    let eventData: {
      event?: string;
      payload?: {
        payment?: { entity?: { id?: string; order_id?: string; status?: string } };
        order?: { entity?: { id?: string; status?: string } };
      };
    };

    try {
      eventData = JSON.parse(rawBody);
    } catch {
      throw new BadRequestError('Invalid webhook payload format');
    }

    const event = eventData.event;
    if (event === 'payment.captured' || event === 'order.paid') {
      const orderId =
        eventData.payload?.payment?.entity?.order_id || eventData.payload?.order?.entity?.id;
      const paymentId = eventData.payload?.payment?.entity?.id;

      if (orderId) {
        const payment = await Payment.findOne({ razorpayOrderId: orderId });
        if (payment && payment.status !== PaymentStatus.COMPLETED) {
          payment.status = PaymentStatus.COMPLETED;
          if (paymentId) payment.razorpayPaymentId = paymentId;
          await payment.save();

          await Booking.findByIdAndUpdate(payment.bookingId, {
            paymentStatus: PaymentStatus.COMPLETED,
          });
        }
      }
    } else if (event === 'payment.failed') {
      const orderId = eventData.payload?.payment?.entity?.order_id;
      if (orderId) {
        const payment = await Payment.findOne({ razorpayOrderId: orderId });
        if (payment && payment.status === PaymentStatus.PENDING) {
          payment.status = PaymentStatus.FAILED;
          await payment.save();

          await Booking.findByIdAndUpdate(payment.bookingId, {
            paymentStatus: PaymentStatus.FAILED,
          });
        }
      }
    }

    return { processed: true, event };
  }
}

export const paymentService = new PaymentService();
export default paymentService;
