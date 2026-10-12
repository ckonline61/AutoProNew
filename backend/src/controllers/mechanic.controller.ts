import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { mechanicService } from '../services/mechanic.service';
import { UnauthorizedError } from '../errors/app-error';

export const mechanicController = {
  /**
   * Onboard authenticated user as mechanic.
   */
  onboard: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const mechanic = await mechanicService.onboard(userId, req.body);
    res.status(201).json(apiResponse.success(mechanic, 'Mechanic onboarding submitted successfully'));
  }),

  /**
   * Get authenticated mechanic's profile.
   */
  getProfile: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const mechanic = await mechanicService.getProfile(userId);
    res.status(200).json(apiResponse.success(mechanic, 'Mechanic profile retrieved successfully'));
  }),

  /**
   * Toggle online/offline and availability.
   */
  updateAvailability: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const mechanic = await mechanicService.updateAvailability(userId, req.body);
    res.status(200).json(apiResponse.success(mechanic, 'Availability updated successfully'));
  }),

  /**
   * Update real-time GPS location.
   */
  updateLocation: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const mechanic = await mechanicService.updateLocation(userId, req.body);
    res.status(200).json(apiResponse.success(mechanic, 'Location updated successfully'));
  }),

  /**
   * Admin verification endpoint.
   */
  verify: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const mechanic = await mechanicService.verifyMechanic(
      req.params.id as string,
      req.body.approvalStatus
    );
    res.status(200).json(apiResponse.success(mechanic, 'Mechanic verification status updated'));
  }),

  /**
   * List jobs assigned to authenticated mechanic.
   */
  getAssignedJobs: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const jobs = await mechanicService.getAssignedJobs(userId);
    res.status(200).json(apiResponse.success(jobs, 'Assigned jobs retrieved successfully'));
  }),

  /**
   * Accept an assigned job.
   */
  acceptJob: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const job = await mechanicService.acceptJob(userId, req.params.id as string);
    res.status(200).json(apiResponse.success(job, 'Job accepted successfully'));
  }),

  /**
   * Reject an assigned job.
   */
  rejectJob: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const job = await mechanicService.rejectJob(userId, req.params.id as string, req.body?.reason);
    res.status(200).json(apiResponse.success(job, 'Job rejected successfully'));
  }),

  /**
   * Get current active job for mechanic.
   */
  getActiveJob: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const job = await mechanicService.getActiveJob(userId);
    res.status(200).json(apiResponse.success(job, 'Active job retrieved successfully'));
  }),

  /**
   * Advance job execution status (EN_ROUTE, ARRIVED, IN_PROGRESS, COMPLETED).
   */
  updateJobStatus: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!userId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const job = await mechanicService.updateJobExecutionStatus(
      userId,
      req.params.id as string,
      req.body.status,
      req.body.notes
    );
    res.status(200).json(apiResponse.success(job, 'Job status updated successfully'));
  }),
};
