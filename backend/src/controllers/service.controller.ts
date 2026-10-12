import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { serviceCatalogService } from '../services/service.service';
import { ServiceQueryInput } from '../validators/service.validator';

export const serviceController = {
  /**
   * Get all service categories.
   */
  getCategories: asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const categories = await serviceCatalogService.getCategories();
    res.status(200).json(apiResponse.success(categories, 'Service categories retrieved successfully'));
  }),

  /**
   * Get service category by ID.
   */
  getCategoryById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const category = await serviceCatalogService.getCategoryById(req.params.id as string);
    res.status(200).json(apiResponse.success(category, 'Service category retrieved successfully'));
  }),

  /**
   * Get services list with search and pagination.
   */
  getServices: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ServiceQueryInput;
    const result = await serviceCatalogService.getServices(query);

    res.status(200).json(
      apiResponse.success(result.services, 'Services retrieved successfully', {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      })
    );
  }),

  /**
   * Get service details by ID.
   */
  getServiceById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const service = await serviceCatalogService.getServiceById(req.params.id as string);
    res.status(200).json(apiResponse.success(service, 'Service retrieved successfully'));
  }),
};
