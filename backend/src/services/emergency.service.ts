import { EmergencyRequest, IEmergencyRequest } from '../models/emergency-request.model';
import { Mechanic } from '../models/mechanic.model';
import { EmergencyStatus, EmergencyType, MechanicApprovalStatus } from '../types';
import { BadRequestError, NotFoundError } from '../errors/app-error';
import { CreateEmergencyRequestInput, EmergencyQueryInput } from '../validators/emergency.validator';

const BASE_PRICING: Record<EmergencyType, number> = {
  [EmergencyType.JUMP_START]: 499,
  [EmergencyType.BATTERY_PROBLEM]: 599,
  [EmergencyType.FLAT_TYRE]: 399,
  [EmergencyType.TYRE_REPLACEMENT]: 699,
  [EmergencyType.FUEL_EMERGENCY]: 499,
  [EmergencyType.BREAKDOWN]: 799,
  [EmergencyType.ENGINE_PROBLEM]: 899,
  [EmergencyType.ACCIDENT_ASSISTANCE]: 1499,
  [EmergencyType.TOWING]: 1999,
  [EmergencyType.OTHER]: 499,
};

export class EmergencyService {
  /**
   * Generate human-readable emergency request number (e.g. EM-20261012-XXXX).
   */
  private generateRequestNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `EM-${dateStr}-${randomSuffix}`;
  }

  /**
   * Helper to compute approximate distance in kilometers between two geo-coordinates.
   */
  public calculateDistanceKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Find nearest online and available approved mechanic within max radius (e.g. 25km).
   */
  public async findNearestProvider(
    lat: number,
    lon: number,
    maxRadiusKm: number = 25
  ): Promise<{ providerUserId: string; distanceKm: number } | null> {
    const mechanics = await Mechanic.find({
      approvalStatus: MechanicApprovalStatus.APPROVED,
      isOnline: true,
      isAvailable: true,
      'currentLocation.latitude': { $exists: true },
      'currentLocation.longitude': { $exists: true },
    });

    let nearest: { providerUserId: string; distanceKm: number } | null = null;
    let minDistance = maxRadiusKm;

    for (const m of mechanics) {
      if (m.currentLocation) {
        const dist = this.calculateDistanceKm(
          lat,
          lon,
          m.currentLocation.latitude,
          m.currentLocation.longitude
        );

        if (dist < minDistance) {
          minDistance = dist;
          nearest = {
            providerUserId: m.userId.toString(),
            distanceKm: Math.round(dist * 10) / 10,
          };
        }
      }
    }

    return nearest;
  }

  /**
   * Rapid SOS emergency request creation with auto-matching.
   */
  public async createSOS(
    customerId: string,
    data: CreateEmergencyRequestInput
  ): Promise<IEmergencyRequest> {
    const requestNumber = this.generateRequestNumber();
    const estimatedPrice = BASE_PRICING[data.problemType] || 499;

    // Search for nearest provider
    const nearest = await this.findNearestProvider(data.latitude, data.longitude);

    const initialStatus = nearest ? EmergencyStatus.ASSIGNED : EmergencyStatus.SEARCHING;
    const estimatedArrival = nearest ? Math.max(10, Math.round(nearest.distanceKm * 3)) : 20;

    const request = await EmergencyRequest.create({
      requestNumber,
      customerId,
      vehicleId: data.vehicleId,
      problemType: data.problemType,
      description: data.description,
      priority: data.priority,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      assignedProviderId: nearest?.providerUserId,
      status: initialStatus,
      estimatedArrival,
      estimatedPrice,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: new Date(),
          reason: nearest
            ? `Assigned to nearest provider (${nearest.distanceKm} km away)`
            : 'Searching for nearby available emergency providers',
        },
      ],
      isActive: true,
    });

    return request;
  }

  /**
   * Get single emergency request by ID.
   */
  public async getById(requestId: string): Promise<IEmergencyRequest> {
    const request = await EmergencyRequest.findOne({
      _id: requestId,
      isActive: true,
    })
      .populate('customerId', 'name phone')
      .populate('vehicleId', 'brand model registrationNumber')
      .populate('assignedProviderId', 'name phone');

    if (!request) {
      throw new NotFoundError('Emergency request not found');
    }

    return request;
  }

  /**
   * Get emergency requests for a customer.
   */
  public async getCustomerRequests(
    customerId: string,
    query: EmergencyQueryInput
  ): Promise<{
    requests: IEmergencyRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      customerId,
      isActive: true,
    };

    if (query.status) {
      filter.status = query.status;
    }

    const [requests, total] = await Promise.all([
      EmergencyRequest.find(filter)
        .populate('assignedProviderId', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      EmergencyRequest.countDocuments(filter),
    ]);

    return {
      requests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get emergency requests assigned to a provider.
   */
  public async getProviderRequests(providerId: string): Promise<IEmergencyRequest[]> {
    return EmergencyRequest.find({
      assignedProviderId: providerId,
      status: {
        $in: [
          EmergencyStatus.ASSIGNED,
          EmergencyStatus.ACCEPTED,
          EmergencyStatus.EN_ROUTE,
          EmergencyStatus.ARRIVED,
          EmergencyStatus.IN_PROGRESS,
        ],
      },
      isActive: true,
    })
      .populate('customerId', 'name phone')
      .populate('vehicleId')
      .sort({ createdAt: -1 });
  }

  /**
   * Provider accepts emergency request.
   */
  public async acceptRequest(
    providerId: string,
    requestId: string
  ): Promise<IEmergencyRequest> {
    const request = await EmergencyRequest.findOne({
      _id: requestId,
      assignedProviderId: providerId,
      isActive: true,
    });

    if (!request) {
      throw new NotFoundError('Emergency request not found or not assigned to you');
    }

    if (request.status !== EmergencyStatus.ASSIGNED) {
      throw new BadRequestError('Request is not in ASSIGNED state');
    }

    request.status = EmergencyStatus.ACCEPTED;
    request.statusHistory.push({
      status: EmergencyStatus.ACCEPTED,
      timestamp: new Date(),
      reason: 'Accepted by emergency provider',
    });

    await request.save();
    return request;
  }

  /**
   * Update emergency request progress status.
   */
  public async updateStatus(
    requestId: string,
    nextStatus: EmergencyStatus,
    notes?: string
  ): Promise<IEmergencyRequest> {
    const request = await EmergencyRequest.findOne({
      _id: requestId,
      isActive: true,
    });

    if (!request) {
      throw new NotFoundError('Emergency request not found');
    }

    request.status = nextStatus;
    if (nextStatus === EmergencyStatus.COMPLETED) {
      request.finalPrice = request.estimatedPrice;
    }

    request.statusHistory.push({
      status: nextStatus,
      timestamp: new Date(),
      reason: notes || `Status updated to ${nextStatus}`,
    });

    await request.save();
    return request;
  }

  /**
   * Cancel emergency request with policy reason.
   */
  public async cancel(
    requestId: string,
    cancelledBy: string,
    reason: string
  ): Promise<IEmergencyRequest> {
    const request = await EmergencyRequest.findOne({
      _id: requestId,
      isActive: true,
    });

    if (!request) {
      throw new NotFoundError('Emergency request not found');
    }

    if (
      request.status === EmergencyStatus.COMPLETED ||
      request.status === EmergencyStatus.CANCELLED
    ) {
      throw new BadRequestError('Cannot cancel a completed or already cancelled request');
    }

    request.status = EmergencyStatus.CANCELLED;
    request.cancelledBy = cancelledBy;
    request.cancellationReason = reason;
    request.statusHistory.push({
      status: EmergencyStatus.CANCELLED,
      timestamp: new Date(),
      reason,
    });

    await request.save();
    return request;
  }
}

export const emergencyService = new EmergencyService();
