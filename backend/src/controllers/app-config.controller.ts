import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { appConfigService } from '../services/app-config.service';

export const appConfigController = {
  // --- Public endpoint ---

  getPublicConfig: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const config = await appConfigService.getPublicConfig();
    res.status(200).json(apiResponse.success(config, 'Public configuration retrieved successfully'));
  }),

  // --- Admin endpoints ---

  getAll: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const configs = await appConfigService.getAll();
    res.status(200).json(apiResponse.success(configs, 'All configurations retrieved successfully'));
  }),

  getByKey: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const config = await appConfigService.getByKey(req.params.key as string);
    res.status(200).json(apiResponse.success(config, 'Configuration retrieved successfully'));
  }),

  setKey: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    const { value, type, description } = req.body;
    const key = req.params.key as string;

    const config = await appConfigService.set(key, value, type, description, userId);
    res.status(200).json(apiResponse.success(config, 'Configuration saved successfully'));
  }),

  deleteKey: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const config = await appConfigService.delete(req.params.key as string);
    res.status(200).json(apiResponse.success(config, 'Configuration deleted successfully'));
  }),
};
