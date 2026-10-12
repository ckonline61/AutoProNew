import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { featureFlagService } from '../services/feature-flag.service';

export const featureFlagController = {
  getAll: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const flags = await featureFlagService.getAll();
    res.status(200).json(apiResponse.success(flags, 'Feature flags retrieved successfully'));
  }),

  getByKey: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const flag = await featureFlagService.getByKey(req.params.key as string);
    res.status(200).json(apiResponse.success(flag, 'Feature flag retrieved successfully'));
  }),

  create: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    const flag = await featureFlagService.create({
      ...req.body,
      updatedBy: userId,
    });
    res.status(201).json(apiResponse.success(flag, 'Feature flag created successfully'));
  }),

  update: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    const flag = await featureFlagService.update(req.params.key as string, {
      ...req.body,
      updatedBy: userId,
    });
    res.status(200).json(apiResponse.success(flag, 'Feature flag updated successfully'));
  }),

  toggle: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    const flag = await featureFlagService.toggle(req.params.key as string, userId);
    res.status(200).json(apiResponse.success(flag, 'Feature flag toggled successfully'));
  }),

  delete: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const flag = await featureFlagService.delete(req.params.key as string);
    res.status(200).json(apiResponse.success(flag, 'Feature flag deleted successfully'));
  }),

  checkKey: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const key = req.params.key as string;
    const enabled = await featureFlagService.isEnabled(key);
    res.status(200).json(
      apiResponse.success({ key, enabled }, `Feature flag '${key}' status retrieved successfully`)
    );
  }),
};
