import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { aiService } from '../services/ai.service';
import { BadRequestError } from '../errors/app-error';

export const aiController = {
  recommendMechanic: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { bookingId } = req.body;
    const recommendations = await aiService.recommendMechanic(bookingId);
    res.status(200).json(
      apiResponse.success(recommendations, 'Mechanic recommendations generated successfully')
    );
  }),

  estimatePrice: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { serviceIds, vehicleId } = req.body;
    const estimation = await aiService.estimatePrice(serviceIds, vehicleId);
    res.status(200).json(
      apiResponse.success(estimation, 'Price estimate generated successfully')
    );
  }),

  getInsights: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!._id.toString();
    const insights = await aiService.getBookingInsights(userId);
    res.status(200).json(
      apiResponse.success(insights, 'Booking insights retrieved successfully')
    );
  }),

  smartSearch: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = (req.query.q || req.query.query) as string;
    if (!query || typeof query !== 'string') {
      throw new BadRequestError('Search query parameter is required');
    }
    const results = await aiService.smartSearch(query);
    res.status(200).json(
      apiResponse.success(results, 'Smart search results retrieved successfully')
    );
  }),
};
