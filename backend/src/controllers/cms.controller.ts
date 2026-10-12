import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { cmsService } from '../services/cms.service';
import { UnauthorizedError } from '../errors/app-error';
import { CmsCategory } from '../models/cms-page.model';

export const cmsController = {
  // --- Public endpoints ---

  getPageBySlug: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = await cmsService.getPageBySlug(req.params.slug as string);
    res.status(200).json(apiResponse.success(page, 'Page retrieved successfully'));
  }),

  getAllPages: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const category = req.query.category as CmsCategory | undefined;

    const result = await cmsService.getAllPages(category, page, limit);
    res.status(200).json(
      apiResponse.success(result.pages, 'Pages retrieved successfully', result.pagination)
    );
  }),

  // --- Admin endpoints ---

  createPage: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const page = await cmsService.createPage(userId, req.body);
    res.status(201).json(apiResponse.success(page, 'Page created successfully'));
  }),

  updatePage: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = await cmsService.updatePage(req.params.id as string, req.body);
    res.status(200).json(apiResponse.success(page, 'Page updated successfully'));
  }),

  publishPage: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = await cmsService.publishPage(req.params.id as string);
    res.status(200).json(apiResponse.success(page, 'Page published successfully'));
  }),

  unpublishPage: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = await cmsService.unpublishPage(req.params.id as string);
    res.status(200).json(apiResponse.success(page, 'Page unpublished successfully'));
  }),

  deletePage: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = await cmsService.deletePage(req.params.id as string);
    res.status(200).json(apiResponse.success(page, 'Page deleted successfully'));
  }),

  getAllPagesAdmin: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await cmsService.getAllPagesAdmin(page, limit);
    res.status(200).json(
      apiResponse.success(result.pages, 'Admin pages retrieved successfully', result.pagination)
    );
  }),
};
