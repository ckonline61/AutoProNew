import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { auditService } from '../services/audit.service';
import { AuditAction } from '../types';

export const auditController = {
  getAll: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const { action, resource, resourceId, userId, startDate, endDate } = req.query;

    const result = await auditService.getAll(
      {
        action: action as AuditAction | undefined,
        resource: resource as string | undefined,
        resourceId: resourceId as string | undefined,
        userId: userId as string | undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      },
      page,
      limit
    );

    res.status(200).json(
      apiResponse.success(result.logs, 'Audit logs retrieved successfully', result.pagination)
    );
  }),

  getByUser: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const result = await auditService.getByUser(req.params.userId as string, page, limit);
    res.status(200).json(
      apiResponse.success(result.logs, 'User audit logs retrieved successfully', result.pagination)
    );
  }),

  getByResource: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const resource = req.params.resource as string;
    const resourceId = req.query.resourceId as string | undefined;

    const result = await auditService.getByResource(resource, resourceId, page, limit);
    res.status(200).json(
      apiResponse.success(result.logs, 'Resource audit logs retrieved successfully', result.pagination)
    );
  }),
};
