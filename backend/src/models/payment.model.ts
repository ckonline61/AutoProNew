import mongoose, { Schema, Types } from 'mongoose';
import { PaymentStatus, PaymentMethod } from '../types';

export interface IPayment {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  amount: number;
  currency: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  status: PaymentStatus;
  method?: PaymentMethod;
  refundId?: string;
  refundAmount?: number;
  refundStatus?: string;
  notes?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR', trim: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String, sparse: true },
    razorpaySignature: { type: String },
    status: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
    method: { type: String, enum: Object.values(PaymentMethod) },
    refundId: { type: String },
    refundAmount: { type: Number, min: 0 },
    refundStatus: { type: String },
    notes: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ razorpayOrderId: 1 }, { sparse: true });
paymentSchema.index({ status: 1 });

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
