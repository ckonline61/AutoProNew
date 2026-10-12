import mongoose, { Schema, Types } from 'mongoose';
import { FuelType, ListingStatus } from '../types';

export interface IUsedCarLocation {
  city: string;
  state: string;
}

export interface IUsedCarListing {
  _id: Types.ObjectId;
  sellerId: Types.ObjectId;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  fuelType: FuelType;
  mileage: number;
  price: number;
  negotiable: boolean;
  description: string;
  images: string[];
  location: IUsedCarLocation;
  status: ListingStatus;
  inspectionReportId?: Types.ObjectId;
  viewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const usedCarLocationSchema = new Schema<IUsedCarLocation>(
  {
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const usedCarListingSchema = new Schema<IUsedCarListing>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    variant: { type: String, trim: true },
    year: { type: Number, required: true },
    fuelType: {
      type: String,
      enum: Object.values(FuelType),
      required: true,
    },
    mileage: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    negotiable: { type: Boolean, default: true },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    images: [{ type: String, trim: true }],
    location: { type: usedCarLocationSchema, required: true },
    status: {
      type: String,
      enum: Object.values(ListingStatus),
      default: ListingStatus.ACTIVE,
      required: true,
    },
    inspectionReportId: { type: Schema.Types.ObjectId, ref: 'InspectionReport' },
    viewCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

usedCarListingSchema.index({ sellerId: 1 });
usedCarListingSchema.index({ status: 1 });
usedCarListingSchema.index({ brand: 1 });

export const UsedCarListing = mongoose.model<IUsedCarListing>('UsedCarListing', usedCarListingSchema);
