import mongoose, { Document, Schema, Types } from 'mongoose';
import { BookingStatus, PaymentStatus } from '../types';

export interface IStatusHistory {
  status: BookingStatus;
  timestamp: Date;
  updatedBy?: Types.ObjectId;
  reason?: string;
}

export interface IBooking extends Document {
  bookingNumber: string;
  customerId: Types.ObjectId;
  vehicleId: Types.ObjectId;
  addressId?: Types.ObjectId;
  serviceType: 'DOORSTEP' | 'WORKSHOP';
  serviceIds: Types.ObjectId[];
  mechanicId?: Types.ObjectId;
  status: BookingStatus;
  paymentStatus?: PaymentStatus;
  scheduledDate: Date;
  scheduledTime: string;
  estimatedDuration: number;
  estimatedPrice: number;
  finalPrice?: number;
  discount: number;
  notes?: string;
  cancellationReason?: string;
  cancelledBy?: string;
  statusHistory: IStatusHistory[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const statusHistorySchema = new Schema<IStatusHistory>(
  {
    status: { type: String, enum: Object.values(BookingStatus), required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, trim: true },
  },
  { _id: false }
);

const bookingSchema = new Schema<IBooking>(
  {
    bookingNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    addressId: { type: Schema.Types.ObjectId, ref: 'Address' },
    serviceType: {
      type: String,
      enum: ['DOORSTEP', 'WORKSHOP'],
      default: 'DOORSTEP',
      required: true,
    },
    serviceIds: [{ type: Schema.Types.ObjectId, ref: 'Service', required: true }],
    mechanicId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    scheduledDate: { type: Date, required: true },
    scheduledTime: { type: String, required: true, trim: true },
    estimatedDuration: { type: Number, default: 60, min: 1 },
    estimatedPrice: { type: Number, required: true, min: 0 },
    finalPrice: { type: Number, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true, maxlength: 1000 },
    cancellationReason: { type: String, trim: true, maxlength: 500 },
    cancelledBy: { type: String, trim: true },
    statusHistory: [statusHistorySchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

bookingSchema.index({ customerId: 1 });
bookingSchema.index({ mechanicId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ scheduledDate: 1, scheduledTime: 1 });
bookingSchema.index({ createdAt: -1 });

export const Booking = mongoose.model<IBooking>('Booking', bookingSchema);
