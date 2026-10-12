import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { apiResponse } from '../utils/api-response';
import { locationService } from '../services/location.service';
import {
  DistanceMatrixQueryInput,
  GeocodeQueryInput,
  ReverseGeocodeQueryInput,
  AutocompleteQueryInput,
} from '../validators/location.validator';

export const locationController = {
  /**
   * Forward geocode address to coordinates.
   */
  geocode: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { address } = req.query as unknown as GeocodeQueryInput;
    const result = await locationService.geocode(address);
    res.status(200).json(apiResponse.success(result, 'Address geocoded successfully'));
  }),

  /**
   * Reverse geocode coordinates to address.
   */
  reverseGeocode: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { latitude, longitude } = req.query as unknown as ReverseGeocodeQueryInput;
    const result = await locationService.reverseGeocode(latitude, longitude);
    res.status(200).json(apiResponse.success(result, 'Coordinates reverse geocoded successfully'));
  }),

  /**
   * Autocomplete address suggestions.
   */
  autocomplete: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { input } = req.query as unknown as AutocompleteQueryInput;
    const suggestions = await locationService.autocompletePlaces(input);
    res.status(200).json(apiResponse.success(suggestions, 'Place suggestions retrieved successfully'));
  }),

  /**
   * Calculate route distance and driving ETA.
   */
  calculateDistance: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { originLat, originLng, destLat, destLng } =
      req.query as unknown as DistanceMatrixQueryInput;
    const result = locationService.calculateDistance(
      originLat,
      originLng,
      destLat,
      destLng
    );
    res.status(200).json(apiResponse.success(result, 'Distance calculated successfully'));
  }),

  /**
   * Validate location serviceability.
   */
  checkServiceability: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await locationService.checkServiceability(req.body);
    res.status(200).json(apiResponse.success(result, result.message));
  }),

  /**
   * Admin: Create a new service area.
   */
  createServiceArea: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const area = await locationService.createServiceArea(req.body);
    res.status(201).json(apiResponse.success(area, 'Service area created successfully'));
  }),

  /**
   * List all service areas.
   */
  getServiceAreas: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
    const areas = await locationService.getServiceAreas(isActive);
    res.status(200).json(apiResponse.success(areas, 'Service areas retrieved successfully'));
  }),

  /**
   * Get single service area by ID.
   */
  getServiceAreaById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const area = await locationService.getServiceAreaById(req.params.id as string);
    res.status(200).json(apiResponse.success(area, 'Service area retrieved successfully'));
  }),
};
