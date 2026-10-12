import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReview extends Document {
  userId: Types.ObjectId;
  bookingId: Types.ObjectId;
  mechanicId: Types.ObjectId;
  rating: number;
  comment?: string;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
    mechanicId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
    images: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ userId: 1 });
reviewSchema.index({ mechanicId: 1 });
reviewSchema.index({ bookingId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', reviewSchema);
