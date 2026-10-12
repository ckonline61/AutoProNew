import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { reviewService } from '../services/review.service';
import { UnauthorizedError } from '../errors/app-error';

export const reviewController = {
  create: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const { bookingId, rating, comment, images } = req.body;
    const review = await reviewService.create(userId, bookingId, { rating, comment, images });
    res.status(201).json(apiResponse.success(review, 'Review submitted successfully'));
  }),

  getByBooking: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const bookingId = req.params.bookingId as string;
    const review = await reviewService.getByBooking(bookingId);
    res.status(200).json(apiResponse.success(review, 'Review retrieved successfully'));
  }),

  getByMechanic: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const mechanicId = req.params.mechanicId as string;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await reviewService.getByMechanic(mechanicId, page, limit);
    res.status(200).json(
      apiResponse.success(
        { reviews: result.reviews, averageRating: result.averageRating },
        'Mechanic reviews retrieved successfully',
        result.pagination
      )
    );
  }),

  update: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const id = req.params.id as string;
    const review = await reviewService.update(userId, id, req.body);
    res.status(200).json(apiResponse.success(review, 'Review updated successfully'));
  }),

  delete: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const id = req.params.id as string;
    await reviewService.delete(userId, id);
    res.status(200).json(apiResponse.success(null, 'Review deleted successfully'));
  }),
};
