import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { vehicleService } from '../services/vehicle.service';
import { UnauthorizedError } from '../errors/app-error';

export const vehicleController = {
  /**
   * Create a new vehicle for the authenticated user.
   */
  create: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const vehicle = await vehicleService.create(userId, req.body);
    res.status(201).json(apiResponse.success(vehicle, 'Vehicle created successfully'));
  }),

  /**
   * Get all vehicles belonging to the authenticated user.
   */
  getAll: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const vehicles = await vehicleService.getAll(userId);
    res.status(200).json(apiResponse.success(vehicles, 'Vehicles retrieved successfully'));
  }),

  /**
   * Get a single vehicle by ID.
   */
  getById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const vehicle = await vehicleService.getById(userId, req.params.id as string);
    res.status(200).json(apiResponse.success(vehicle, 'Vehicle retrieved successfully'));
  }),

  /**
   * Update an existing vehicle.
   */
  update: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const vehicle = await vehicleService.update(userId, req.params.id as string, req.body);
    res.status(200).json(apiResponse.success(vehicle, 'Vehicle updated successfully'));
  }),

  /**
   * Soft delete a vehicle.
   */
  remove: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    await vehicleService.remove(userId, req.params.id as string);
    res.status(200).json(apiResponse.success(null, 'Vehicle deleted successfully'));
  }),
};
