import mongoose, { Document, Schema } from 'mongoose';

export interface ISparePart extends Document {
  name: string;
  description: string;
  brand: string;
  partNumber?: string;
  categoryTag: string;
  price: number;
  discountedPrice?: number;
  stock: number;
  images: string[];
  compatibility: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sparePartSchema = new Schema<ISparePart>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    partNumber: { type: String, trim: true },
    categoryTag: { type: String, required: true, trim: true, lowercase: true },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String, trim: true }],
    compatibility: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

sparePartSchema.index({ name: 1 });
sparePartSchema.index({ categoryTag: 1 });
sparePartSchema.index({ isActive: 1 });

export const SparePart = mongoose.model<ISparePart>('SparePart', sparePartSchema);
