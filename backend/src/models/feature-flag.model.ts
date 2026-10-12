import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFeatureFlag extends Document {
  key: string;
  enabled: boolean;
  description?: string;
  userMessage?: string;
  startDate?: Date;
  endDate?: Date;
  version: number;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const featureFlagSchema = new Schema<IFeatureFlag>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    enabled: { type: Boolean, default: true },
    description: { type: String, trim: true, maxlength: 500 },
    userMessage: { type: String, trim: true, maxlength: 500 },
    startDate: { type: Date },
    endDate: { type: Date },
    version: { type: Number, default: 1 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

featureFlagSchema.index({ key: 1 }, { unique: true });

export const FeatureFlag = mongoose.model<IFeatureFlag>('FeatureFlag', featureFlagSchema);
