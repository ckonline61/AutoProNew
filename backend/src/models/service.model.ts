import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IService extends Document {
  categoryId: Types.ObjectId;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  duration: number;
  image?: string;
  features: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    shortDescription: { type: String, trim: true, maxlength: 300 },
    price: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    image: { type: String },
    features: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ categoryId: 1 });
serviceSchema.index({ name: 1 });
serviceSchema.index({ isActive: 1 });

export const Service = mongoose.model<IService>('Service', serviceSchema);
