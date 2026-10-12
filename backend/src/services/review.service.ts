import { Types } from 'mongoose';
import { Review, IReview } from '../models/review.model';
import { Booking } from '../models/booking.model';
import { BookingStatus } from '../types';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../errors/app-error';

export interface CreateReviewData {
  rating: number;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
  images?: string[];
}

export class ReviewService {
  /**
   * Create a review for a completed booking.
   */
  async create(userId: string, bookingId: string, data: CreateReviewData): Promise<IReview> {
    const booking = await Booking.findById(bookingId);
    if (!booking || !booking.isActive) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.customerId.toString() !== userId) {
      throw new ForbiddenError('You can only review your own bookings');
    }

    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestError('Reviews can only be submitted for completed bookings');
    }

    if (!booking.mechanicId) {
      throw new BadRequestError('No mechanic was assigned to this booking');
    }

    const existingReview = await Review.findOne({ bookingId: new Types.ObjectId(bookingId) });
    if (existingReview) {
      throw new ConflictError('A review already exists for this booking');
    }

    const review = await Review.create({
      userId: new Types.ObjectId(userId),
      bookingId: booking._id,
      mechanicId: booking.mechanicId,
      rating: data.rating,
      comment: data.comment,
      images: data.images || [],
      isActive: true,
    });

    return review;
  }

  /**
   * Get review by booking ID.
   */
  async getByBooking(bookingId: string): Promise<IReview> {
    const review = await Review.findOne({
      bookingId: new Types.ObjectId(bookingId),
      isActive: true,
    }).populate('userId', 'name avatar');

    if (!review) {
      throw new NotFoundError('Review not found for this booking');
    }

    return review;
  }

  /**
   * Get paginated reviews for a mechanic along with average rating.
   */
  async getByMechanic(mechanicId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query = {
      mechanicId: new Types.ObjectId(mechanicId),
      isActive: true,
    };

    const [reviews, total, ratingStats] = await Promise.all([
      Review.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name avatar'),
      Review.countDocuments(query),
      Review.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const averageRating = ratingStats.length > 0
      ? Math.round(ratingStats[0].averageRating * 10) / 10
      : 0;

    return {
      reviews,
      averageRating,
      total,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Update own review.
   */
  async update(userId: string, reviewId: string, data: UpdateReviewData): Promise<IReview> {
    const review = await Review.findOne({
      _id: new Types.ObjectId(reviewId),
      isActive: true,
    });

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    if (review.userId.toString() !== userId) {
      throw new ForbiddenError('You can only update your own review');
    }

    if (data.rating !== undefined) {
      review.rating = data.rating;
    }
    if (data.comment !== undefined) {
      review.comment = data.comment;
    }
    if (data.images !== undefined) {
      review.images = data.images;
    }

    await review.save();
    return review;
  }

  /**
   * Soft delete own review.
   */
  async delete(userId: string, reviewId: string): Promise<IReview> {
    const review = await Review.findOne({
      _id: new Types.ObjectId(reviewId),
      isActive: true,
    });

    if (!review) {
      throw new NotFoundError('Review not found');
    }

    if (review.userId.toString() !== userId) {
      throw new ForbiddenError('You can only delete your own review');
    }

    review.isActive = false;
    await review.save();
    return review;
  }
}

export const reviewService = new ReviewService();
