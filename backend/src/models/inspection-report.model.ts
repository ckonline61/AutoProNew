import mongoose, { Document, Schema, Types } from 'mongoose';

export type InspectionStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface IInspectionCategory {
  name: string;
  score: number;
  notes?: string;
}

export interface IInspectionReport extends Document {
  vehicleId?: Types.ObjectId;
  listingId?: Types.ObjectId;
  inspectorId: Types.ObjectId;
  overallScore: number;
  categories: IInspectionCategory[];
  summary: string;
  recommendations: string[];
  images: string[];
  status: InspectionStatus;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inspectionCategorySchema = new Schema<IInspectionCategory>(
  {
    name: { type: String, required: true, trim: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const inspectionReportSchema = new Schema<IInspectionReport>(
  {
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    listingId: { type: Schema.Types.ObjectId, ref: 'UsedCarListing' },
    inspectorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    categories: { type: [inspectionCategorySchema], default: [] },
    summary: { type: String, required: true, trim: true },
    recommendations: [{ type: String, trim: true }],
    images: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
      default: 'PENDING',
      required: true,
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

inspectionReportSchema.index({ vehicleId: 1 });
inspectionReportSchema.index({ listingId: 1 });
inspectionReportSchema.index({ inspectorId: 1 });

export const InspectionReport = mongoose.model<IInspectionReport>('InspectionReport', inspectionReportSchema);
