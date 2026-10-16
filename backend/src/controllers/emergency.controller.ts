import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { emergencyService } from '../services/emergency.service';
import { UnauthorizedError } from '../errors/app-error';
import { EmergencyQueryInput } from '../validators/emergency.validator';
import { EmergencyActor } from '../services/emergency-policy';

function actor(req: Request): EmergencyActor {
  if (!req.user) throw new UnauthorizedError('User is not authenticated');
  return { id: req.user._id.toString(), role: req.user.role };
}

export const emergencyController = {
  /**
   * Create emergency SOS request.
   */
  createSOS: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!customerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const request = await emergencyService.createSOS(customerId, req.body);
    res.status(201).json(apiResponse.success(request, 'Emergency request created successfully'));
  }),

  /**
   * Get single emergency request by ID.
   */
  getById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const request = await emergencyService.getById(req.params.id as string, actor(req));
    res.status(200).json(apiResponse.success(request, 'Emergency request retrieved successfully'));
  }),

  /**
   * Get all emergency requests for authenticated customer.
   */
  getCustomerRequests: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const customerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!customerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const query = req.query as unknown as EmergencyQueryInput;
    const result = await emergencyService.getCustomerRequests(customerId, query);

    res.status(200).json(
      apiResponse.success(result.requests, 'Emergency requests retrieved successfully', {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      })
    );
  }),

  /**
   * Get requests assigned to authenticated provider.
   */
  getProviderRequests: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const providerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!providerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const requests = await emergencyService.getProviderRequests(providerId);
    res.status(200).json(apiResponse.success(requests, 'Assigned emergency requests retrieved successfully'));
  }),

  /**
   * Provider accepts emergency request.
   */
  acceptRequest: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const providerId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!providerId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const request = await emergencyService.acceptRequest(providerId, req.params.id as string);
    res.status(200).json(apiResponse.success(request, 'Emergency request accepted successfully'));
  }),

  /**
   * Update emergency request status.
   */
  updateStatus: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const request = await emergencyService.updateStatus(
      req.params.id as string,
      req.body.status,
      req.body.notes,
      actor(req)
    );
    res.status(200).json(apiResponse.success(request, 'Status updated successfully'));
  }),

  /**
   * Cancel emergency request.
   */
  cancel: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const cancelledBy = req.user?.role || 'CUSTOMER';
    const request = await emergencyService.cancel(
      req.params.id as string,
      cancelledBy,
      req.body.reason,
      actor(req)
    );
    res.status(200).json(apiResponse.success(request, 'Emergency request cancelled successfully'));
  }),
};
