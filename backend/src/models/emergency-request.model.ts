import mongoose, { Document, Schema, Types } from 'mongoose';
import { EmergencyStatus, EmergencyType, Priority } from '../types';

export interface IEmergencyStatusHistory {
  status: EmergencyStatus;
  timestamp: Date;
  updatedBy?: Types.ObjectId;
  reason?: string;
}

export interface IEmergencyRequest extends Document {
  requestNumber: string;
  customerId: Types.ObjectId;
  vehicleId?: Types.ObjectId;
  problemType: EmergencyType;
  description?: string;
  priority: Priority;
  latitude: number;
  longitude: number;
  address?: string;
  assignedProviderId?: Types.ObjectId;
  status: EmergencyStatus;
  estimatedArrival?: number;
  estimatedPrice: number;
  finalPrice?: number;
  statusHistory: IEmergencyStatusHistory[];
  cancelledBy?: string;
  cancellationReason?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const emergencyStatusHistorySchema = new Schema<IEmergencyStatusHistory>(
  {
    status: { type: String, enum: Object.values(EmergencyStatus), required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, trim: true },
  },
  { _id: false }
);

const emergencyRequestSchema = new Schema<IEmergencyRequest>(
  {
    requestNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    problemType: { type: String, enum: Object.values(EmergencyType), required: true },
    description: { type: String, trim: true, maxlength: 1000 },
    priority: { type: String, enum: Object.values(Priority), default: Priority.HIGH },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    address: { type: String, trim: true, maxlength: 500 },
    assignedProviderId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: Object.values(EmergencyStatus),
      default: EmergencyStatus.PENDING,
    },
    estimatedArrival: { type: Number, min: 0 },
    estimatedPrice: { type: Number, default: 499, min: 0 },
    finalPrice: { type: Number, min: 0 },
    statusHistory: [emergencyStatusHistorySchema],
    cancelledBy: { type: String, trim: true },
    cancellationReason: { type: String, trim: true, maxlength: 500 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

emergencyRequestSchema.index({ customerId: 1 });
emergencyRequestSchema.index({ assignedProviderId: 1 });
emergencyRequestSchema.index({ status: 1 });
emergencyRequestSchema.index({ latitude: 1, longitude: 1 });
emergencyRequestSchema.index({ createdAt: -1 });

export const EmergencyRequest = mongoose.model<IEmergencyRequest>(
  'EmergencyRequest',
  emergencyRequestSchema
);
