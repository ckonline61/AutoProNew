import mongoose, { Schema, Types } from 'mongoose';
import { FuelType } from '../types';

export interface IVehicle {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  registrationNumber: string;
  brand: string;
  model: string;
  variant?: string;
  fuelType: FuelType;
  year: number;
  mileage?: number;
  insuranceExpiry?: Date;
  pucExpiry?: Date;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    registrationNumber: { type: String, required: true, uppercase: true, trim: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    variant: { type: String, trim: true },
    fuelType: { type: String, enum: Object.values(FuelType), required: true },
    year: { type: Number, required: true, min: 1900, max: new Date().getFullYear() + 1 },
    mileage: { type: Number, min: 0 },
    insuranceExpiry: { type: Date },
    pucExpiry: { type: Date },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

vehicleSchema.index({ userId: 1 });
vehicleSchema.index({ registrationNumber: 1 });

export const Vehicle = mongoose.model<IVehicle>('Vehicle', vehicleSchema);
