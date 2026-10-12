import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { usedCarService } from '../services/used-car.service';
import { UnauthorizedError } from '../errors/app-error';
import { FuelType } from '../types';

export const usedCarController = {
  createListing: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const listing = await usedCarService.createListing(userId, req.body);
    res.status(201).json(apiResponse.success(listing, 'Car listing created successfully'));
  }),

  getListings: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const { brand, model, fuelType, minPrice, maxPrice, minYear, maxYear, city, search } =
      req.query;

    const result = await usedCarService.getListings(
      {
        brand: brand as string | undefined,
        model: model as string | undefined,
        fuelType: fuelType as FuelType | undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        minYear: minYear ? parseInt(minYear as string, 10) : undefined,
        maxYear: maxYear ? parseInt(maxYear as string, 10) : undefined,
        city: city as string | undefined,
        search: search as string | undefined,
      },
      page,
      limit
    );

    res.status(200).json(
      apiResponse.success(result.listings, 'Car listings retrieved successfully', result.pagination)
    );
  }),

  getListingById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const listing = await usedCarService.getListingById(req.params.id as string);
    res.status(200).json(apiResponse.success(listing, 'Car listing retrieved successfully'));
  }),

  getUserListings: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const listings = await usedCarService.getUserListings(userId);
    res.status(200).json(apiResponse.success(listings, 'User listings retrieved successfully'));
  }),

  updateListing: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const listing = await usedCarService.updateListing(userId, req.params.id as string, req.body);
    res.status(200).json(apiResponse.success(listing, 'Car listing updated successfully'));
  }),

  removeListing: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    await usedCarService.removeListing(userId, req.params.id as string);
    res.status(200).json(apiResponse.success(null, 'Car listing removed successfully'));
  }),
};
