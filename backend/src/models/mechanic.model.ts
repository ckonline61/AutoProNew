import mongoose, { Document, Schema, Types } from 'mongoose';
import { MechanicApprovalStatus } from '../types';

export interface IMechanic extends Document {
  userId: Types.ObjectId;
  specializations: string[];
  experience?: number;
  documents: {
    aadhaar?: string;
    pan?: string;
    license?: string;
    certifications?: string[];
  };
  serviceAreaIds: Types.ObjectId[];
  isAvailable: boolean;
  isOnline: boolean;
  isApproved: boolean;
  approvalStatus: MechanicApprovalStatus;
  rating: number;
  totalJobs: number;
  totalEarnings: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const mechanicSchema = new Schema<IMechanic>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    specializations: [{ type: String, trim: true }],
    experience: { type: Number, min: 0 },
    documents: {
      aadhaar: { type: String },
      pan: { type: String },
      license: { type: String },
      certifications: [{ type: String }],
    },
    serviceAreaIds: [{ type: Schema.Types.ObjectId, ref: 'ServiceArea' }],
    isAvailable: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: Object.values(MechanicApprovalStatus),
      default: MechanicApprovalStatus.PENDING,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalJobs: { type: Number, default: 0, min: 0 },
    totalEarnings: { type: Number, default: 0, min: 0 },
    currentLocation: {
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

mechanicSchema.index({ approvalStatus: 1 });
mechanicSchema.index({ isAvailable: 1 });
mechanicSchema.index({ isOnline: 1 });

export const Mechanic = mongoose.model<IMechanic>('Mechanic', mechanicSchema);
