import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { inspectionService } from '../services/inspection.service';
import { UnauthorizedError } from '../errors/app-error';

export const inspectionController = {
  createReport: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const inspectorId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!inspectorId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const report = await inspectionService.createReport(inspectorId, req.body);
    res.status(201).json(apiResponse.success(report, 'Inspection report created successfully'));
  }),

  getReport: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const report = await inspectionService.getReport(req.params.id as string);
    res.status(200).json(apiResponse.success(report, 'Inspection report retrieved successfully'));
  }),

  updateReport: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const inspectorId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!inspectorId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const report = await inspectionService.updateReport(inspectorId, req.params.id as string, req.body);
    res.status(200).json(apiResponse.success(report, 'Inspection report updated successfully'));
  }),

  completeReport: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const inspectorId = req.user?._id?.toString() || (req.user as { id?: string } | undefined)?.id;
    if (!inspectorId) {
      throw new UnauthorizedError('User is not authenticated');
    }

    const report = await inspectionService.completeReport(inspectorId, req.params.id as string, req.body);
    res.status(200).json(apiResponse.success(report, 'Inspection report marked as completed'));
  }),

  getByVehicle: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const reports = await inspectionService.getByVehicle(req.params.vehicleId as string);
    res.status(200).json(apiResponse.success(reports, 'Vehicle inspection reports retrieved successfully'));
  }),

  getByListing: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const reports = await inspectionService.getByListing(req.params.listingId as string);
    res.status(200).json(apiResponse.success(reports, 'Listing inspection reports retrieved successfully'));
  }),
};
