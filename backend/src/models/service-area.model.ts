import mongoose, { Document, Schema } from 'mongoose';

export interface IServiceArea extends Document {
  name: string;
  city: string;
  state: string;
  pincode?: string;
  boundaries?: {
    type: string;
    coordinates: number[][][];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const serviceAreaSchema = new Schema<IServiceArea>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, maxlength: 100 },
    pincode: { type: String, trim: true },
    boundaries: {
      type: { type: String, enum: ['Polygon'], default: 'Polygon' },
      coordinates: { type: [[[Number]]] },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceAreaSchema.index({ name: 1 });
serviceAreaSchema.index({ city: 1 });
serviceAreaSchema.index({ isActive: 1 });

export const ServiceArea = mongoose.model<IServiceArea>('ServiceArea', serviceAreaSchema);
