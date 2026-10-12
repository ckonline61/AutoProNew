import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { sparePartService } from '../services/spare-part.service';

export const sparePartController = {
  getAll: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const search = req.query.search as string | undefined;
    const categoryTag = req.query.categoryTag as string | undefined;
    const brand = req.query.brand as string | undefined;

    const result = await sparePartService.getAll({ search, categoryTag, brand }, page, limit);
    res.status(200).json(
      apiResponse.success(result.items, 'Spare parts retrieved successfully', result.pagination)
    );
  }),

  getById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const item = await sparePartService.getById(req.params.id as string);
    res.status(200).json(apiResponse.success(item, 'Spare part retrieved successfully'));
  }),

  create: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const item = await sparePartService.create(req.body);
    res.status(201).json(apiResponse.success(item, 'Spare part created successfully'));
  }),

  update: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const item = await sparePartService.update(req.params.id as string, req.body);
    res.status(200).json(apiResponse.success(item, 'Spare part updated successfully'));
  }),

  deactivate: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const item = await sparePartService.deactivate(req.params.id as string);
    res.status(200).json(apiResponse.success(item, 'Spare part deactivated successfully'));
  }),
};
