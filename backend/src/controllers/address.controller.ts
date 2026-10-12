import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { addressService } from '../services/address.service';
import { UnauthorizedError } from '../errors/app-error';

export const addressController = {
  /**
   * Create a new address for the authenticated user.
   */
  create: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const address = await addressService.create(userId, req.body);
    res.status(201).json(apiResponse.success(address, 'Address created successfully'));
  }),

  /**
   * Get all addresses belonging to the authenticated user.
   */
  getAll: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const addresses = await addressService.getAll(userId);
    res.status(200).json(apiResponse.success(addresses, 'Addresses retrieved successfully'));
  }),

  /**
   * Get a single address by ID.
   */
  getById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const address = await addressService.getById(userId, req.params.id as string);
    res.status(200).json(apiResponse.success(address, 'Address retrieved successfully'));
  }),

  /**
   * Update an existing address.
   */
  update: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const address = await addressService.update(userId, req.params.id as string, req.body);
    res.status(200).json(apiResponse.success(address, 'Address updated successfully'));
  }),

  /**
   * Soft delete an address.
   */
  remove: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    await addressService.remove(userId, req.params.id as string);
    res.status(200).json(apiResponse.success(null, 'Address deleted successfully'));
  }),
};
